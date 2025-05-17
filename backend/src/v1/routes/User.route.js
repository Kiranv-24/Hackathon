import express from "express";
import {
  meetController,
  userController,
  testController,
  courseController,
  materialController,
  virtualMentor,
} from "../controllers";
import authMiddleware from "../middlewares/Auth.middleware";
import messageController from "../controllers/message/message";
import videoCallController from "../controllers/videocall/videoController";
import topicController from "../controllers/topic/topic";
import { PrismaClient } from "@prisma/client";
import multer from "multer";

const router = express.Router();

// Multer config for PDF upload
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"), false);
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// --------- Material Routes ----------
router.post("/create-material", authMiddleware, upload.single("pdfFile"), materialController.createMaterialsMentor);
router.get("/get-materials/:subjectname", authMiddleware, materialController.getMaterialByClass);
router.get("/get-subjects", authMiddleware, materialController.getallSubjects);
router.get("/get-material", authMiddleware, materialController.getmaterials);
router.delete("/delete-subject/:id", materialController.deleteSubject);

// --------- Test Routes ----------
router.post("/create-test", authMiddleware, testController.createTest);
router.get("/get-sub/:id", authMiddleware, testController.getSubmissionsByTestId);
router.post("/start-test", authMiddleware, testController.startTestAttempt);
router.post("/submit-answer", authMiddleware, testController.submitAnswer);
router.get("/get-sub-details/:id", authMiddleware, testController.getSubmissionDetails);
router.post("/finish-test", authMiddleware, testController.finishTestAttempt);
router.get("/get-questions/:id", authMiddleware, testController.getQuestions);
router.get("/get-user-sub", authMiddleware, testController.getMySubmissions);
router.post("/score", authMiddleware, testController.giveScoreTest);
router.get("/get-test", authMiddleware, testController.getAllTestsCreatedByUser);
router.delete("/delete-test", authMiddleware, testController.deleteTest);
router.get("/get-my-test", authMiddleware, testController.getUserTestByClass);
router.post("/fix-tests", authMiddleware, testController.fixTestsWithMissingSubjects);

// --------- Course Routes ----------
router.post("/create-course", authMiddleware, courseController.creatCourse);
router.get("/get-course", authMiddleware, courseController.getcourse);

// --------- Video Call ----------
router.get("/create-video-token", authMiddleware, videoCallController.generateVideoToken);

// --------- Meeting Routes ----------
router.post("/book-meeting", authMiddleware, meetController.bookMeeting);
router.get("/get-meetings", authMiddleware, meetController.getMeetings);
router.get("/my-meetings", authMiddleware, meetController.showbookedMeetings);
router.get("/mentors", authMiddleware, meetController.getmentorsinfo);
router.post("/confirm-meeting", authMiddleware, meetController.confirmMeeting);

// Test meeting creation endpoint
router.post("/test-book-meeting", authMiddleware, async (req, res) => {
  try {
    const prisma = new PrismaClient();
    const { dates, notes, guestId, title } = req.body;
    const hostId = req.user.id;

    const roomId = `room_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const meetingTitle = title || `Test Meeting - ${new Date().toLocaleDateString()}`;

    const meeting = await prisma.meeting.create({
      data: {
        hostId,
        title: meetingTitle,
        status: "requested",
        notes: notes || "",
        roomId,
        dates: { create: dates.map((date) => ({ date })) },
        participants: {
          create: [{ userId: guestId, role: "guest" }],
        },
      },
      include: {
        dates: true,
        participants: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Test meeting created successfully",
      data: meeting,
    });
  } catch (error) {
    console.error("Test booking error:", error);
    return res.status(500).json({
      success: false,
      message: "Error in test booking",
      error: error.message,
    });
  }
});

// --------- User Management ----------
router.get("/user-details", authMiddleware, userController.userDetails);
router.get("/get-all-users", authMiddleware, userController.getAllUser);
router.get("/getuserbyid/:id", authMiddleware, userController.getUserById);

// --------- Q&A ----------
router.post("/create-question", authMiddleware, userController.createQuestion);
router.post("/answer-question", authMiddleware, userController.answerQuestion);
router.get("/user-questions", authMiddleware, userController.getQuestionOfUser);
router.get("/get-allquestions", userController.getAllQuestionandAnswer);
router.delete("/delete-question/:id", authMiddleware, userController.deleteQuestion);

// --------- Messaging ----------
router.post("/create-conversation", authMiddleware, messageController.sendMessage);
router.get("/get-conversation/:id", authMiddleware, messageController.getMessage);
router.get("/all-convo", authMiddleware, messageController.getAllConversations);

// --------- Virtual Mentor ----------
router.post("/open-ai", authMiddleware, virtualMentor.openAianswer);

// --------- Topics ----------
router.post("/create-topic", authMiddleware, topicController.createTopic);
router.get("/get-topics", authMiddleware, topicController.getTopics);

export default router;
