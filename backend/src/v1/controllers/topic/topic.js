import prisma from '../../../lib/prisma';

const topicController = {
  async createTopic(req, res) {
    try {
      const { message } = req.body;
      const userId = req.user.id;

      if (!message) {
        return res.json({
          success: false,
          message: "Message is required"
        });
      }

      const topic = await prisma.topic.create({
        data: {
          message,
          userId,
        },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      res.json({
        success: true,
        message: topic
      });
    } catch (error) {
      console.error("Error creating topic:", error);
      res.json({
        success: false,
        message: error.message || "Failed to create topic"
      });
    }
  },

  async getTopics(req, res) {
    try {
      const topics = await prisma.topic.findMany({
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      res.json({
        success: true,
        message: topics
      });
    } catch (error) {
      console.error("Error fetching topics:", error);
      res.json({
        success: false,
        message: error.message || "Failed to fetch topics"
      });
    }
  }
};

export default topicController;