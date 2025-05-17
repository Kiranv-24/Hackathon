import express from 'express';
import authMiddleware from '../middlewares/Auth.middleware.js';
import videoController from '../controllers/videocall/videoController.js';

const router = express.Router();

// Video token routes
router.get('/token', authMiddleware, videoController.generateVideoToken);

// Meeting routes
router.post('/meetings', authMiddleware, videoController.createMeeting);
router.get('/meetings', authMiddleware, videoController.getMeetings);
router.post('/meetings/:meetingId/join', authMiddleware, videoController.joinMeeting);

export default router;