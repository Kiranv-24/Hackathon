import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import fetch from 'node-fetch';

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
        error: 'Video service configuration error' 
      });
    }

    // Generate token for VideoSDK with standard permissions
    const payload = {
      apikey: API_KEY,
      permissions: ['allow_join', 'allow_mod'], // Basic permissions needed
      version: 2,
    };

    const options = {
      expiresIn: '24h',
      algorithm: 'HS256'
    };

    const videoToken = jwt.sign(payload, SECRET_KEY, options);

    // Create a room using the token
    const response = await fetch('https://api.videosdk.live/v2/rooms', {
      method: 'POST',
      headers: {
        'Authorization': videoToken,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('VideoSDK room creation failed:', errorData);
      throw new Error('Failed to generate room token');
    }

    const data = await response.json();
    return res.status(200).json({ 
      success: true,
      token: videoToken, 
      roomId: data.roomId 
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
    if (!API_KEY || !SECRET_KEY) {
      console.error('VideoSDK credentials not found');
      return res.status(500).json({ 
        success: false,
        error: 'Video service configuration error' 
      });
    }

    // Get user ID from the authenticated user object
    const userId = req.user.id;
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    const { title, description, participants = [] } = req.body;

    // Generate token for VideoSDK
    const payload = {
      apikey: API_KEY,
      permissions: ['allow_join', 'allow_mod'],
      version: 2
    };

    const videoToken = jwt.sign(payload, SECRET_KEY, {
      expiresIn: '24h',
      algorithm: 'HS256'
    });

    const response = await fetch('https://api.videosdk.live/v2/rooms', {
      method: 'POST',
      headers: {
        'Authorization': videoToken,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('VideoSDK room creation failed:', errorData);
      throw new Error('Failed to create VideoSDK room');
    }

    const { roomId } = await response.json();

    try {
      // First create the meeting with host
      const meeting = await prisma.meeting.create({
        data: {
          roomId,
          title: title || 'New Meeting',
          description: description || '',
          status: 'ACTIVE',
          hostId: userId
        }
      });

      // Then create participants if any
      if (participants && participants.length > 0) {
        await prisma.meetingParticipant.createMany({
          data: participants.map(participantId => ({
            meetingId: meeting.id,
            userId: participantId
          }))
        });
      }

      // Fetch the complete meeting data with participants
      const completeData = await prisma.meeting.findUnique({
        where: { id: meeting.id },
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
        }
      });

      return res.status(200).json({ 
        success: true,
        meeting: {
          id: completeData.id,
          roomId: completeData.roomId,
          title: completeData.title,
          hostId: completeData.host.id,
          host: {
            id: completeData.host.id,
            name: completeData.host.name,
            email: completeData.host.email
          },
          participants: completeData.participants.map(p => ({
            id: p.user.id,
            name: p.user.name,
            email: p.user.email
          }))
        },
        token: videoToken,
        roomId
      });
    } catch (error) {
      console.error('Detailed error:', error);
      return res.status(500).json({ 
        success: false,
        error: 'Failed to create meeting',
        details: error.message 
      });
    }

  } catch (error) {
    console.error('Error creating meeting:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Failed to create meeting',
      details: error.message 
    });
  }
};


const getMeetings = async (req, res) => {
  try {
    const { userId } = req.user;

    const meetings = await prisma.meeting.findMany({
      where: {
        OR: [
          { hostId: userId },
          {
            participants: {
              some: {
                userId: userId
              }
            }
          }
        ]
      },
      include: {
        participants: true,
        host: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
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

const joinMeeting = async (req, res) => {
  try {
    const { userId } = req.user;
    const { meetingId } = req.params;

    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId },
      include: {
        participants: true
      }
    });

    if (!meeting) {
      return res.status(404).json({ 
        success: false,
        error: 'Meeting not found' 
      });
    }

    // Check if user is already a participant
    const isParticipant = meeting.participants.some(p => p.userId === userId);
    if (!isParticipant && meeting.hostId !== userId) {
      await prisma.meeting.update({
        where: { id: meetingId },
        data: {
          participants: {
            create: { userId }
          }
        }
      });
    }

    // Generate a new token for the participant
    const payload = {
      apikey: API_KEY,
      permissions: ['allow_join'],
      version: 2,
      roomId: meeting.roomId
    };

    const videoToken = jwt.sign(payload, SECRET_KEY, {
      expiresIn: '24h',
      algorithm: 'HS256'
    });

    return res.status(200).json({ 
      success: true,
      token: videoToken,
      meeting 
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

export default {
  generateVideoToken,
  createMeeting,
  getMeetings,
  joinMeeting
};