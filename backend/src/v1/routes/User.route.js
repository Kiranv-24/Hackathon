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
import { PrismaClient } from "@prisma/client";
//import testController from "../controllers/test/test";

const router = express.Router();
router.post(
  "/create-material",
  authMiddleware,
  materialController.createMaterialsMentor
);
router.get(
  "/get-materials",
  authMiddleware,
  materialController.getMaterialByClass
);
router.post("/create-test", authMiddleware, testController.createTest);
router.get("/get-sub/:id",authMiddleware,testController.getSubmissionsByTestId)
router.post("/start-test", authMiddleware, testController.startTestAttempt);
router.post("/submit-answer", authMiddleware, testController.submitAnswer);
router.get("/get-sub-details/:id",authMiddleware,testController.getSubmissionDetails)
router.post("/finish-test", authMiddleware, testController.finishTestAttempt);
router.post("/create-course", authMiddleware, courseController.creatCourse);
router.get("/get-questions/:id",authMiddleware,testController.getQuestions)
router.get("/get-user-sub",authMiddleware,testController.getMySubmissions)
router.post("/score",authMiddleware,testController.giveScoreTest)
router.get(
  "/get-test",
  authMiddleware,
  testController.getAllTestsCreatedByUser
);
router.get("/create-video-token", authMiddleware, videoCallController.generateVideoToken)
router.get("/get-subjects", authMiddleware, materialController.getallSubjects);
router.delete("/delete-test", authMiddleware, testController.deleteTest);
router.get("/get-my-test", authMiddleware, testController.getUserTestByClass);
router.get("/user-details", authMiddleware, userController.userDetails);
router.post("/book-meeting", authMiddleware, meetController.bookMeeting);

// Test endpoint for booking meetings
router.post("/test-book-meeting", authMiddleware, async (req, res) => {
  try {
    // Simplified meeting creation for testing
    const prisma = new PrismaClient();
    const { dates, notes, guestId, title } = req.body;
    const hostId = req.user.id;
    
    console.log("Test booking with:", { hostId, guestId, dates, notes, title });
    
    // Generate a room ID
    const roomId = `room_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    const meetingTitle = title || `Test Meeting - ${new Date().toLocaleDateString()}`;
    
    // Create the meeting with the correct structure
    const meeting = await prisma.meeting.create({
      data: {
        hostId,
        title: meetingTitle,
        status: "requested",
        notes: notes || "",
        roomId,
        dates: {
          create: dates.map(date => ({ date }))
        },
        // Add the guest as a participant
        participants: {
          create: [
            {
              userId: guestId,
              role: "guest"
            }
          ]
        }
      },
      include: {
        dates: true,
        participants: true
      }
    });
    
    return res.status(201).json({
      success: true,
      message: "Test meeting created successfully",
      data: meeting
    });
  } catch (error) {
    console.error("Test booking error:", error);
    return res.status(500).json({
      success: false,
      message: "Error in test booking",
      error: error.message
    });
  }
});

router.get("/get-meetings", authMiddleware, meetController.getMeetings);
router.get("/my-meetings", authMiddleware, meetController.showbookedMeetings);
router.get("/mentors", authMiddleware, meetController.getmentorsinfo);
router.post("/confirm-meeting", authMiddleware, meetController.confirmMeeting);
router.post("/create-question", authMiddleware, userController.createQuestion);
router.post("/answer-question", authMiddleware, userController.answerQuestion);
router.get("/user-questions", authMiddleware, userController.getQuestionOfUser);
router.get("/get-allquestions", userController.getAllQuestionandAnswer);
router.delete(
  "/delete-question/:id",
  authMiddleware,
  userController.deleteQuestion
);
router.get("/get-course", authMiddleware, courseController.getcourse);
router.get("/get-material", authMiddleware, materialController.getmaterials);
router.post("/open-ai", authMiddleware, virtualMentor.openAianswer);
router.delete("/delete-subject/:id", materialController.deleteSubject);
router.post("/create-conversation",authMiddleware,messageController.sendMessage)
router.get("/get-conversation/:id",authMiddleware,messageController.getMessage)
router.get("/get-all-users",authMiddleware,userController.getAllUser)
router.get("/all-convo",authMiddleware,messageController.getAllConversations)
router.get("/getuserbyid/:id",authMiddleware,userController.getUserById)
router.post("/fix-tests", authMiddleware, testController.fixTestsWithMissingSubjects);
export default router;

