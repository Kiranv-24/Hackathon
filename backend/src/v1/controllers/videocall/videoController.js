import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import fetch from 'node-fetch';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

// VideoSDK API Key and Secret from environment variables
const API_KEY = process.env.VIDEO_SDK_API_KEY;
const SECRET_KEY = process.env.VIDEO_SDK_SECRET;

const generateVideoToken = async (req, res) => {
  try {
    // Check if the environment variables are set correctly
    if (!API_KEY || !SECRET_KEY) {
      console.error('VideoSDK credentials not found');
      return res.status(500).json({ 
        success: false,
        error: 'Video service configuration error. Please check API credentials.' 
      });
    }

    // Get user role from the authenticated user
    const userRole = req.user?.role || 'student';

    // Set permissions based on role
    const permissions = userRole === 'mentor' 
      ? ['allow_join', 'allow_mod', 'allow_screen_share', 'allow_rtmp'] 
      : ['allow_join', 'allow_screen_share'];

    // Generate token for VideoSDK
    const payload = {
      apikey: API_KEY,
      permissions,
      version: 2,
      role: userRole,
      participantId: req.user?.id?.toString() || uuidv4()
    };

    const videoToken = jwt.sign(payload, SECRET_KEY, {
      expiresIn: '24h',
      algorithm: 'HS256'
    });

    return res.status(200).json({ 
      success: true,
      token: videoToken,
      role: userRole
    });

  } catch (error) {
    console.error('Error generating video token:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Failed to generate video token',
      details: error.message 
    });
  }
};

const createMeeting = async (req, res) => {
  try {
    // Only allow mentors to create meetings
    if (req.user?.role !== 'mentor') {
      return res.status(403).json({
        success: false,
        error: 'Only mentors can create meetings'
      });
    }

    // Generate token for VideoSDK
    const payload = {
      apikey: API_KEY,
      permissions: ['allow_join', 'allow_mod', 'allow_screen_share', 'allow_rtmp'],
      version: 2,
      role: 'mentor',
      participantId: req.user?.id?.toString() || uuidv4()
    };

    const videoToken = jwt.sign(payload, SECRET_KEY, {
      expiresIn: '24h',
      algorithm: 'HS256'
    });

    // Create room using VideoSDK API
    const response = await fetch('https://api.videosdk.live/v2/rooms', {
      method: 'POST',
      headers: {
        'Authorization': videoToken,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to create VideoSDK room');
    }

    const { roomId } = await response.json();

    // Store meeting in database
    const meeting = await prisma.meeting.create({
      data: {
        roomId,
        title: 'New Meeting',
        status: 'ACTIVE',
        hostId: req.user.id
      }
    });

    return res.status(200).json({ 
      success: true,
      roomId: meeting.roomId
    });

  } catch (error) {
    console.error('Error creating meeting:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Failed to create meeting',
      details: error.message 
    });
  }
};

const joinMeeting = async (req, res) => {
  try {
    const { meetingId } = req.params;

    // Find the meeting
    const meeting = await prisma.meeting.findFirst({
      where: { roomId: meetingId }
    });

    if (!meeting) {
      return res.status(404).json({ 
        success: false,
        error: 'Meeting not found' 
      });
    }

    // Generate token with appropriate permissions
    const userRole = req.user?.role || 'student';
    const permissions = userRole === 'mentor'
      ? ['allow_join', 'allow_mod', 'allow_screen_share', 'allow_rtmp']
      : ['allow_join', 'allow_screen_share'];

    const payload = {
      apikey: API_KEY,
      permissions,
      version: 2,
      roomId: meetingId,
      role: userRole,
      participantId: req.user?.id?.toString() || uuidv4()
    };

    const videoToken = jwt.sign(payload, SECRET_KEY, {
      expiresIn: '24h',
      algorithm: 'HS256'
    });

    // Add participant to meeting
    if (req.user?.id) {
      await prisma.meetingParticipant.upsert({
        where: {
          meetingId_userId: {
            meetingId: meeting.id,
            userId: req.user.id
          }
        },
        update: {},
        create: {
          meetingId: meeting.id,
          userId: req.user.id
        }
      });
    }

    return res.status(200).json({ 
      success: true,
      token: videoToken,
      role: userRole
    });

  } catch (error) {
    console.error('Error joining meeting:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Failed to join meeting',
      details: error.message 
    });
  }
};

const getMeetings = async (req, res) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId) {
      return res.status(200).json({
        success: true,
        meetings: []
      });
    }

    const where = userRole === 'mentor'
      ? { hostId: userId }
      : {
          participants: {
            some: { userId }
          }
        };

    const meetings = await prisma.meeting.findMany({
      where,
      include: {
        host: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return res.status(200).json({ 
      success: true,
      meetings 
    });

  } catch (error) {
    console.error('Error fetching meetings:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Failed to fetch meetings',
      details: error.message 
    });
  }
};

export default {
  generateVideoToken,
  createMeeting,
  getMeetings,
  joinMeeting
};