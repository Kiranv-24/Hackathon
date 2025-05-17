import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { v4 as uuidv4 } from 'uuid';

const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);

const CHUNK_UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'chunks');

// Ensure upload directory exists
try {
  if (!fs.existsSync(CHUNK_UPLOAD_DIR)) {
    fs.mkdirSync(CHUNK_UPLOAD_DIR, { recursive: true });
  }
} catch (error) {
  console.error('Failed to create upload directory:', error);
}

const networkController = {
  // Simple ping endpoint for latency measurement
  ping: async (req, res) => {
    try {
      res.status(200).json({ timestamp: Date.now() });
    } catch (error) {
      console.error('Ping error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Bandwidth test endpoint
  bandwidthTest: async (req, res) => {
    try {
      // Generate random data for bandwidth test (1MB)
      const data = Buffer.alloc(1024 * 1024);
      for (let i = 0; i < data.length; i++) {
        data[i] = Math.floor(Math.random() * 256);
      }

      res.set('Content-Type', 'application/octet-stream');
      res.send(data);
    } catch (error) {
      console.error('Bandwidth test error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Handle video chunk uploads
  uploadChunk: async (req, res) => {
    try {
      if (!req.files || !req.files.video) {
        return res.status(400).json({ error: 'No video chunk provided' });
      }

      const chunk = req.files.video;
      const chunkId = uuidv4();
      const userId = req.user.id;
      const timestamp = Date.now();

      // Create user-specific directory
      const userDir = path.join(CHUNK_UPLOAD_DIR, userId);
      if (!fs.existsSync(userDir)) {
        await mkdir(userDir, { recursive: true });
      }

      // Save chunk with metadata
      const chunkPath = path.join(userDir, `${chunkId}.webm`);
      await writeFile(chunkPath, chunk.data);

      // Save metadata
      const metadataPath = path.join(userDir, `${chunkId}.json`);
      await writeFile(metadataPath, JSON.stringify({
        chunkId,
        userId,
        timestamp,
        originalName: chunk.name,
        size: chunk.size
      }));

      res.status(200).json({
        success: true,
        chunkId,
        timestamp
      });
    } catch (error) {
      console.error('Chunk upload error:', error);
      res.status(500).json({ error: 'Failed to upload chunk' });
    }
  }
};

export default networkController;
