import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { cloudinary } from '../config/cloudinary.js';
import Video from '../models/Video.model.js';
import User from '../models/User.model.js';
import { getVideoDuration } from '../../utils/videoUtils.js';

const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);

// Local storage path for videos
const VIDEOS_DIR = path.join(process.cwd(), 'uploads', 'videos');

// Ensure video directory exists
try {
  if (!fs.existsSync(VIDEOS_DIR)) {
    fs.mkdirSync(VIDEOS_DIR, { recursive: true });
  }
} catch (error) {
  console.error('Failed to create video upload directory:', error);
}

const videoController = {
  // Upload a new video
  uploadVideo: async (req, res) => {
    try {
      if (!req.files || !req.files.video) {
        return res.status(400).json({ 
          success: false, 
          message: 'No video file provided' 
        });
      }

      const { title, description, category } = req.body;
      const userId = req.user.id;
      const videoFile = req.files.video;
      let thumbnailFile = req.files.thumbnail;
      
      // Generate unique filename
      const videoFileName = `${uuidv4()}_${videoFile.name.replace(/\s+/g, '_')}`;
      const videoPath = path.join(VIDEOS_DIR, videoFileName);
      
      // Save video to local storage temporarily
      await writeFile(videoPath, videoFile.data);
      
      // Get video duration
      let duration = 0;
      try {
        duration = await getVideoDuration(videoPath);
      } catch (durationErr) {
        console.error('Error getting video duration:', durationErr);
      }
      
      // Upload to Cloudinary
      let videoResult;
      let thumbnailResult;
      
      try {
        // Upload video to cloudinary
        videoResult = await cloudinary.uploader.upload(videoPath, {
          resource_type: 'video',
          folder: 'educational_videos',
          public_id: path.parse(videoFileName).name,
        });
        
        // Remove temporary file
        await unlink(videoPath);
        
        // Upload thumbnail if provided, otherwise use auto-generated from video
        if (thumbnailFile) {
          thumbnailResult = await cloudinary.uploader.upload(thumbnailFile.data, {
            folder: 'educational_videos/thumbnails',
            public_id: `thumbnail_${path.parse(videoFileName).name}`,
          });
        } else {
          // Use auto-generated thumbnail from Cloudinary
          const thumbnailUrl = videoResult.secure_url.replace(/\.[^/.]+$/, ".jpg");
          thumbnailResult = { secure_url: thumbnailUrl };
        }
      } catch (uploadError) {
        console.error('Cloudinary upload error:', uploadError);
        // If Cloudinary upload fails, clean up temporary file
        if (fs.existsSync(videoPath)) {
          await unlink(videoPath);
        }
        return res.status(500).json({ 
          success: false, 
          message: 'Error uploading video to cloud storage' 
        });
      }
      
      // Create video document in database
      const videoDoc = new Video({
        title,
        description,
        category,
        creator: userId,
        videoUrl: videoResult.secure_url,
        thumbnailUrl: thumbnailResult.secure_url,
        duration,
        cloudinaryId: videoResult.public_id,
        views: 0,
      });
      
      await videoDoc.save();
      
      res.status(201).json({
        success: true,
        message: 'Video uploaded successfully',
        video: {
          _id: videoDoc._id,
          title: videoDoc.title,
          videoUrl: videoDoc.videoUrl,
          thumbnailUrl: videoDoc.thumbnailUrl
        }
      });
    } catch (error) {
      console.error('Video upload error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error. Could not upload video.' 
      });
    }
  },
  
  // Get all videos with pagination and filters
  getVideos: async (req, res) => {
    try {
      const { 
        page = 1, 
        limit = 12, 
        category, 
        search,
        sortBy = 'createdAt',
        order = 'desc'
      } = req.query;
      
      const query = {};
      
      // Apply category filter if provided
      if (category && category !== 'All') {
        query.category = category;
      }
      
      // Apply search filter if provided
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }
      
      // Determine sort order
      const sortOptions = {};
      sortOptions[sortBy] = order === 'asc' ? 1 : -1;
      
      const videos = await Video.find(query)
        .select('title description category videoUrl thumbnailUrl duration views createdAt')
        .populate('creator', 'name email')
        .sort(sortOptions)
        .skip((page - 1) * limit)
        .limit(Number(limit));
      
      const total = await Video.countDocuments(query);
      
      res.status(200).json({
        success: true,
        videos,
        totalPages: Math.ceil(total / limit),
        currentPage: Number(page),
        total
      });
    } catch (error) {
      console.error('Get videos error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error. Could not fetch videos.' 
      });
    }
  },
  
  // Get a single video by ID
  getVideo: async (req, res) => {
    try {
      const { id } = req.params;
      
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid video ID format' 
        });
      }
      
      const video = await Video.findById(id)
        .populate('creator', 'name email');
      
      if (!video) {
        return res.status(404).json({ 
          success: false, 
          message: 'Video not found' 
        });
      }
      
      res.status(200).json({
        success: true,
        video
      });
    } catch (error) {
      console.error('Get video error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error. Could not fetch video.' 
      });
    }
  },
  
  // Update video metadata
  updateVideo: async (req, res) => {
    try {
      const { id } = req.params;
      const { title, description, category } = req.body;
      const userId = req.user.id;
      
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid video ID format' 
        });
      }
      
      // Check if video exists and belongs to user
      const video = await Video.findById(id);
      
      if (!video) {
        return res.status(404).json({ 
          success: false, 
          message: 'Video not found' 
        });
      }
      
      // Only creator or admin can update
      const user = await User.findById(userId);
      if (video.creator.toString() !== userId && user.role !== 'admin') {
        return res.status(403).json({ 
          success: false, 
          message: 'Not authorized to update this video' 
        });
      }
      
      // Update fields if provided
      if (title) video.title = title;
      if (description) video.description = description;
      if (category) video.category = category;
      
      // Update thumbnail if provided
      if (req.files && req.files.thumbnail) {
        try {
          const result = await cloudinary.uploader.upload(req.files.thumbnail.data, {
            folder: 'educational_videos/thumbnails',
            public_id: `thumbnail_${path.parse(video.cloudinaryId).name}`,
          });
          video.thumbnailUrl = result.secure_url;
        } catch (uploadError) {
          console.error('Thumbnail upload error:', uploadError);
          return res.status(500).json({ 
            success: false, 
            message: 'Error uploading thumbnail' 
          });
        }
      }
      
      await video.save();
      
      res.status(200).json({
        success: true,
        message: 'Video updated successfully',
        video: {
          _id: video._id,
          title: video.title,
          description: video.description,
          category: video.category,
          thumbnailUrl: video.thumbnailUrl
        }
      });
    } catch (error) {
      console.error('Update video error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error. Could not update video.' 
      });
    }
  },
  
  // Delete video
  deleteVideo: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid video ID format' 
        });
      }
      
      // Check if video exists and belongs to user
      const video = await Video.findById(id);
      
      if (!video) {
        return res.status(404).json({ 
          success: false, 
          message: 'Video not found' 
        });
      }
      
      // Only creator or admin can delete
      const user = await User.findById(userId);
      if (video.creator.toString() !== userId && user.role !== 'admin') {
        return res.status(403).json({ 
          success: false, 
          message: 'Not authorized to delete this video' 
        });
      }
      
      // Delete from Cloudinary
      if (video.cloudinaryId) {
        try {
          await cloudinary.uploader.destroy(video.cloudinaryId, { resource_type: 'video' });
        } catch (cloudinaryError) {
          console.error('Error deleting from Cloudinary:', cloudinaryError);
          // Continue with deletion from database even if Cloudinary deletion fails
        }
      }
      
      // Delete from database
      await Video.findByIdAndDelete(id);
      
      res.status(200).json({
        success: true,
        message: 'Video deleted successfully'
      });
    } catch (error) {
      console.error('Delete video error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error. Could not delete video.' 
      });
    }
  },
  
  // Record a view for the video
  recordView: async (req, res) => {
    try {
      const { id } = req.params;
      
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid video ID format' 
        });
      }
      
      const video = await Video.findById(id);
      
      if (!video) {
        return res.status(404).json({ 
          success: false, 
          message: 'Video not found' 
        });
      }
      
      // Increment view count
      video.views = (video.views || 0) + 1;
      await video.save();
      
      res.status(200).json({
        success: true,
        message: 'View recorded',
        views: video.views
      });
    } catch (error) {
      console.error('Record view error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error. Could not record view.' 
      });
    }
  }
};

export default videoController; 