import express from 'express';
import multer from 'multer';
import { PrismaClient } from '@prisma/client';
import authMiddleware from '../middlewares/Auth.middleware.js';
import cloudinary from '../config/cloudinary.js';
import videoController from '../controllers/videocall/videoController.js';
import { Readable } from 'stream';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { v4 as uuidv4 } from 'uuid';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import ffprobeStatic from 'ffprobe-static';

const router = express.Router();
const prisma = new PrismaClient();
const execPromise = promisify(exec);

// Set ffmpeg paths
ffmpeg.setFfmpegPath(ffmpegStatic);
ffmpeg.setFfprobePath(ffprobeStatic.path);

// Cloudinary uploader helper
const uploadToCloudinary = (filePath, options = {}) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(filePath,
      { resource_type: 'video', folder: 'educational_videos', ...options },
      (error, result) => error ? reject(error) : resolve(result)
    );
  });
};

// Video duration extractor
const getVideoDuration = (filePath) => {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(filePath)) return reject(new Error(`File not found: ${filePath}`));
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        try {
          const stats = fs.statSync(filePath);
          return resolve((stats.size / (1024 * 1024)) * 8); // fallback: 1MB ≈ 8s
        } catch {
          return resolve(0);
        }
      }
      resolve(metadata.format.duration || 0);
    });
  });
};

// Multer setup
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    file.mimetype.startsWith('video/') ? cb(null, true) : cb(new Error('Only video files are allowed'));
  },
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB
});

// Ensure uploads directory exists
const VIDEOS_DIR = path.join(process.cwd(), 'uploads', 'videos');
if (!fs.existsSync(VIDEOS_DIR)) fs.mkdirSync(VIDEOS_DIR, { recursive: true });

/* --------------------- Video Token & Meeting Routes --------------------- */
router.get('/token', authMiddleware, videoController.generateVideoToken);
router.post('/meetings', authMiddleware, videoController.createMeeting);
router.get('/meetings', authMiddleware, videoController.getMeetings);
router.post('/meetings/:meetingId/join', authMiddleware, videoController.joinMeeting);

/* -------------------------- Video Upload Routes ------------------------- */

// Auth for protected methods
const protectedRoutes = [
  { path: '/', method: 'post' },
  { path: '/:id', method: 'put' },
  { path: '/:id', method: 'delete' }
];
router.use((req, res, next) => {
  const isProtected = protectedRoutes.some(route =>
    req.path === route.path && req.method.toLowerCase() === route.method
  );
  return isProtected ? authMiddleware(req, res, next) : next();
});

// Upload video
router.post('/', upload.fields([{ name: 'video', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }]), async (req, res) => {
  try {
    const { title, description, category } = req.body;
    const videoFile = req.files.video?.[0];
    const thumbnailFile = req.files.thumbnail?.[0];
    if (!videoFile) return res.status(400).json({ success: false, message: 'No video file provided' });

    const videoFileName = `${uuidv4()}_${videoFile.originalname.replace(/\s+/g, '_')}`;
    const videoPath = path.join(VIDEOS_DIR, videoFileName);
    fs.writeFileSync(videoPath, videoFile.buffer);

    let duration = await getVideoDuration(videoPath).catch(() => 0);
    const videoResult = await uploadToCloudinary(videoPath, { public_id: path.parse(videoFileName).name });
    fs.unlinkSync(videoPath);

    let thumbnailResult;
    if (thumbnailFile) {
      const thumbPath = path.join(VIDEOS_DIR, `thumb_${uuidv4()}.jpg`);
      fs.writeFileSync(thumbPath, thumbnailFile.buffer);
      thumbnailResult = await uploadToCloudinary(thumbPath, {
        resource_type: 'image',
        folder: 'educational_videos/thumbnails',
        public_id: `thumb_${path.parse(videoFileName).name}`,
      });
      fs.unlinkSync(thumbPath);
    } else {
      thumbnailResult = { secure_url: videoResult.secure_url.replace(/\.[^/.]+$/, '.jpg') };
    }

    const video = await prisma.video.create({
      data: {
        title,
        description,
        category,
        uploadedBy: req.user.id,
        videoUrl: videoResult.secure_url,
        thumbnailUrl: thumbnailResult.secure_url,
        duration,
        cloudinaryId: videoResult.public_id,
      }
    });

    res.status(201).json({ success: true, message: 'Video uploaded successfully', video });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, message: 'Server error. Could not upload video.' });
  }
});

// Get all videos
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 12, category, search, sortBy = 'createdAt', order = 'desc' } = req.query;
    const skip = (page - 1) * limit;
    const where = {};

    if (category && category !== 'All') where.category = category;
    if (search) where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } }
    ];

    const videos = await prisma.video.findMany({
      where,
      orderBy: { [sortBy]: order },
      skip: parseInt(skip),
      take: parseInt(limit),
      select: {
        id: true, title: true, description: true, category: true,
        videoUrl: true, thumbnailUrl: true, duration: true, views: true, createdAt: true,
        user: { select: { id: true, name: true, email: true } }
      }
    });

    const total = await prisma.video.count({ where });
    res.json({ success: true, videos, totalPages: Math.ceil(total / limit), currentPage: +page, total });
  } catch (error) {
    console.error('Get videos error:', error);
    res.status(500).json({ success: false, message: 'Could not fetch videos' });
  }
});

// Get single video
router.get('/:id', async (req, res) => {
  try {
    const video = await prisma.video.findUnique({
      where: { id: req.params.id },
      include: { user: { select: { id: true, name: true, email: true } } }
    });
    if (!video) return res.status(404).json({ success: false, message: 'Video not found' });
    res.json({ success: true, video });
  } catch (error) {
    console.error('Get video error:', error);
    res.status(500).json({ success: false, message: 'Error fetching video' });
  }
});

// Update video
router.put('/:id', async (req, res) => {
  try {
    const { title, description, category } = req.body;
    const userId = req.user.id;

    const video = await prisma.video.findUnique({ where: { id: req.params.id } });
    if (!video) return res.status(404).json({ success: false, message: 'Video not found' });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (video.uploadedBy !== userId && user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const updatedVideo = await prisma.video.update({
      where: { id: req.params.id },
      data: { title, description, category }
    });

    res.json({ success: true, message: 'Video updated', video: updatedVideo });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ success: false, message: 'Could not update video' });
  }
});

// Delete video
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const video = await prisma.video.findUnique({ where: { id } });
    if (!video) return res.status(404).json({ success: false, message: 'Video not found' });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (video.uploadedBy !== userId && user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (video.cloudinaryId) {
      await cloudinary.uploader.destroy(video.cloudinaryId, { resource_type: 'video' });
    }

    await prisma.video.delete({ where: { id } });
    res.json({ success: true, message: 'Video deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ success: false, message: 'Could not delete video' });
  }
});

// Increment view count
router.post('/:id/view', async (req, res) => {
  try {
    const video = await prisma.video.findUnique({ where: { id: req.params.id } });
    if (!video) return res.status(404).json({ success: false, message: 'Video not found' });

    const updatedVideo = await prisma.video.update({
      where: { id: req.params.id },
      data: { views: video.views + 1 }
    });

    res.json({ success: true, message: 'View recorded', views: updatedVideo.views });
  } catch (error) {
    console.error('View count error:', error);
    res.status(500).json({ success: false, message: 'Could not record view' });
  }
});

export default router;
