import { PrismaClient } from "@prisma/client";
import { customResponse } from "../../../utils/Response";

const prisma = new PrismaClient();

const testController = {

  async giveScoreTest(req,res){
  try{
    const { attemptId, score } = req.body;
    
    console.log("Scoring test attempt:", { attemptId, score });
    
    if (!attemptId) {
      return res.status(400).json({
        success: false,
        message: "attemptId is required"
      });
    }
    
    // Validate that the score is a number
    const scoreNumber = parseInt(score);
    if (isNaN(scoreNumber)) {
      return res.status(400).json({
        success: false,
        message: "Score must be a number"
      });
    }

    const attempt = await prisma.testAttempt.findUnique({
      where: {
        id: attemptId
      }
    });
    
    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "Test attempt not found"
      });
    }

    // Update the test attempt with the score
    await prisma.testAttempt.update({
      where: {
        id: attemptId
      },
      data: {
        score: scoreNumber
      }
    });
    
    console.log(`Successfully scored test attempt ${attemptId} with score ${scoreNumber}`);
    
    res.status(200).json({
      success: true,
      message: "Score submitted successfully"
    });
  } catch(err) {
    console.error("Error scoring test:", err);
    res.status(500).json({
      success: false,
      message: "Failed to submit score: " + err.message
    });
  } finally {
    await prisma.$disconnect();
  }
},
async getMySubmissions(req,res){
  try{
    const userId= req.user.id;
    const findSub= await prisma.testAttempt.findMany({
      where:{
        userId:userId
      },
      include:{
        test:true
      }
    })
    res.status(200).json({
      success:true,
      message:findSub
    })
  }catch(err){
  res.status(200).json({
      success:false,
      message:err
    }) 
  }
},
  async getSubmissionsByTestId(req, res) {
    try {
      const { id } = req.params;
      console.log(`Fetching all submissions for test ID: ${id}`);
      
      // First, check if the test exists
      const test = await prisma.test.findUnique({
        where: {
          id: id
        }
      });
      
      if (!test) {
        console.log(`Test with ID ${id} not found`);
        return res.status(404).json({
          success: false,
          message: "Test not found"
        });
      }
      
      // Find all attempts for this test
      const submissions = await prisma.testAttempt.findMany({
        where: {
          testId: id
        },
        include: {
          user: true,
          test: true,
          submissions: {
            select: {
              _count: true
            }
          }
        },
        orderBy: {
          startedAt: 'desc'
        }
      });
      
      console.log(`Found ${submissions.length} test attempts for test ID ${id}`);
      
      // Format the submissions to include answer count
      const formattedSubmissions = submissions.map(sub => ({
        ...sub,
        answerCount: sub.submissions.length
      }));
      
      res.status(200).json({
        success: true,
        message: formattedSubmissions,
        test: test
      });
    } catch (err) {
      console.error("Error fetching test submissions:", err);
      res.status(500).json({
        success: false,
        message: err.message || "Error fetching test submissions"
      });
    } finally {
      await prisma.$disconnect();
    }
  },
 async getSubmissionDetails(req, res) {
  try {
    const { id } = req.params;
    console.log(`Fetching submission details for attempt ID: ${id}`);
    
    // First verify that the test attempt exists
    const attempt = await prisma.testAttempt.findUnique({
      where: {
        id: id
      },
      include: {
        user: true,
        test: true
      }
    });
    
    if (!attempt) {
      console.log(`Test attempt with ID ${id} not found`);
      return res.status(404).json({
        success: false,
        message: "Test attempt not found"
      });
    }
    
    console.log(`Found test attempt: ${attempt.id}, user: ${attempt.user.name}, test: ${attempt.test.title}`);
    
    // Now get all submissions for this attempt
    const submissions = await prisma.testSubmission.findMany({
      where: {
        attemptId: id
      },
      include: {
        question: true,
        attempt: {
          include: {
            test: true,
            user: true
          }
        }
      }
    });
    
    console.log(`Found ${submissions.length} submissions for test attempt ${id}`);
    
    if (submissions.length === 0) {
      return res.json({
        success: true,
        message: [],
        attemptInfo: attempt
      });
    }
    
    res.status(200).json({
      success: true,
      message: submissions,
      attemptInfo: attempt
    });
  } catch (err) {
    console.error("Error getting submission details:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Error retrieving submission details"
    });
  } finally {
    await prisma.$disconnect();
  }
},
  async getQuestions(req,res){
    try{
        const { id } =req.params;
        const questions= await prisma.testQuestion.findMany({
          where:{
            testId:id
          }
        })
        res.status(200).json({
          success:true,
          message:questions
        })
    }catch(err){
  res.status(400).json({
          success:false,
          message:err
        })
    }
  },
   async createTest(req, res) {
    try {
      const { subjectname, classname, description, title, questions } = req.body;

      // Log test creation details
      console.log("Creating test:", { 
        mentorId: req.user.id, 
        title, 
        classname, 
        subjectname 
      });

      // Normalize the class name (trim, lowercase)
      const normalizedClassName = classname.trim();
      
      let classRecord = await prisma.class.findFirst({
        where: { 
          name: normalizedClassName
        },
      });

      console.log("Existing class record:", classRecord);

      if (!classRecord) {
        // Class doesn't exist, create it
        classRecord = await prisma.class.create({
          data: { name: normalizedClassName },
        });
        console.log("Created new class:", classRecord);
      }

      // Find or create subject
      let subjectRecord = await prisma.subject.findFirst({
        where: {
          name: subjectname,
          classId: classRecord.id,
        },
      });

      if (!subjectRecord) {
        subjectRecord = await prisma.subject.create({
          data: { 
            name: subjectname, 
            classId: classRecord.id 
          },
        });
        console.log("Created new subject:", subjectRecord);
      }

      // Create the test with explicit mentorId
      const newTest = await prisma.test.create({
        data: {
          description,
          title,
          mentorId: req.user.id,
          classId: classRecord.id,
          subjectId: subjectRecord.id,
        },
        include: {
          class: true,
          subject: true,
        }
      });

      console.log("Created new test:", { 
        id: newTest.id, 
        title: newTest.title, 
        class: newTest.class.name,
        subject: newTest.subject.name  
      });
      
      // Add questions if provided
      if (questions && questions.length > 0) {
        for (const question of questions) {
          await prisma.testQuestion.create({
            data: {
              question: question.question,
              testId: newTest.id,
            },
          });
        }
        console.log(`Added ${questions.length} questions to test`);
      }

      res.json({ 
        success: true, 
        message: "Test created successfully", 
        data: {
          id: newTest.id,
          title: newTest.title,
          className: newTest.class.name,
          subjectName: newTest.subject.name,
          questionCount: questions?.length || 0
        }
      });
    } catch (error) {
      console.error("Error creating test:", error);
      res.status(500).json({ success: false, message: error.message });
    } finally {
      await prisma.$disconnect();
    }
  },
   async startTestAttempt(req, res) {
    try {
      const { testId } = req.body;
      console.log("Starting test attempt for:", { 
        testId, 
        userId: req.user.id,
        timestamp: new Date().toISOString()
      });

      // Check if test exists with detailed validation
      const test = await prisma.test.findUnique({
        where: { 
          id: testId
        },
        include: { 
          questions: true,
          class: true,
          subject: true
        }, 
      });

      if (!test) {
        console.log("Test not found:", testId);
        return res.status(404).json({ success: false, message: "Test not found" });
      }
      
      console.log(`Found test: ${test.id} (${test.title}) with ${test.questions.length} questions`);

      // Check if user already has an incomplete attempt
      const existingAttempt = await prisma.testAttempt.findFirst({
        where: {
          testId: testId,
          userId: req.user.id,
          completedAt: null
        },
        include: {
          submissions: true
        }
      });

      if (existingAttempt) {
        console.log("Found existing incomplete attempt:", {
          id: existingAttempt.id,
          startedAt: existingAttempt.startedAt,
          answersSubmitted: existingAttempt.submissions.length
        });
        
        return res.json({
          success: true,
          message: "Continuing existing test attempt",
          test: {
            id: test.id,
            title: test.title,
            description: test.description,
            questions: test.questions.map(q => ({
              id: q.id,
              question: q.question,
            })),
          },
          attemptId: existingAttempt.id,
        });
      }

      // Create a new attempt
      const newAttempt = await prisma.testAttempt.create({
        data: {
          userId: req.user.id,
          testId: testId,
          // startedAt is set to now() by default in the schema
        },
      });

      console.log("Created new test attempt:", {
        id: newAttempt.id,
        testId: newAttempt.testId,
        userId: newAttempt.userId,
        startedAt: newAttempt.startedAt
      });

      res.json({
        success: true,
        message: "Test attempt started",
        test: {
          id: test.id,
          title: test.title,
          description: test.description,
          questions: test.questions.map(q => ({
            id: q.id,
            question: q.question,
          })),
        },
        attemptId: newAttempt.id,
      });
    } catch (error) {
      console.error("Error starting test attempt:", error);
      res.status(500).json({ 
        success: false, 
        message: error.message || "Error starting test attempt" 
      });
    } finally {
      await prisma.$disconnect();
    }
  },
  async submitAnswer(req, res, next) {
    try {
      const { testId, questionId, answer, attemptId } = req.body;
      console.log("Submitting answer:", { 
        testId, 
        questionId, 
        attemptId,
        userId: req.user.id, 
        answerLength: answer?.length || 0,
        timestamp: new Date().toISOString()
      });

      // Validate the test exists
      const test = await prisma.test.findUnique({
        where: { id: testId }
      });
      
      if (!test) {
        console.log(`Test with ID ${testId} not found`);
        return res.status(404).json({
          success: false,
          message: "Test not found"
        });
      }
      
      // Validate the question exists
      const question = await prisma.testQuestion.findFirst({
        where: {
          id: questionId,
          testId: testId
        }
      });
      
      if (!question) {
        console.log(`Question with ID ${questionId} not found in test ${testId}`);
        return res.status(404).json({
          success: false,
          message: "Question not found in this test"
        });
      }

      // Find test attempt - prefer specific attempt if ID is provided
      let attempt;
      
      if (attemptId) {
        console.log(`Looking for specific attempt with ID: ${attemptId}`);
        attempt = await prisma.testAttempt.findUnique({
          where: {
            id: attemptId,
            testId: testId,
            userId: req.user.id
          }
        });
        
        if (attempt) {
          console.log(`Found attempt: ${attempt.id}, completedAt:`, attempt.completedAt);
          
          // If attempt is already completed, don't allow submission
          if (attempt.completedAt) {
            return res.status(400).json({
              success: false,
              message: "Cannot submit answer to a completed test"
            });
          }
        } else {
          console.log(`Attempt with ID ${attemptId} not found`);
        }
      }
      
      // If no specific attempt found, look for any in-progress attempt
      if (!attempt) {
        console.log("Looking for any in-progress attempt");
        attempt = await prisma.testAttempt.findFirst({
          where: {
            testId: testId,
            userId: req.user.id,
            completedAt: null, // Test is still in progress
          },
        });
      }

      if (!attempt) {
        console.log("No in-progress test attempt found");
        return res.status(404).json({ 
          success: false,
          message: "Test attempt not found or already completed. Please start the test again." 
        });
      }

      console.log("Found test attempt:", attempt.id);

      // Check for existing submission
      const existingSubmission = await prisma.testSubmission.findFirst({
        where: {
          attemptId: attempt.id,
          questionId: questionId,
        },
      });

      let submission;

      if (existingSubmission) {
        console.log("Updating existing answer for question:", questionId);
        submission = await prisma.testSubmission.update({
          where: {
            id: existingSubmission.id,
          },
          data: {
            answer,
            submittedAt: new Date(),
          },
        });

        return res.json({
          success: true,
          message: "Answer updated successfully",
          submission,
          attemptId: attempt.id // Return the attempt ID with the response
        });
      } else {
        console.log("Creating new answer for question:", questionId);
        submission = await prisma.testSubmission.create({
          data: {
            attemptId: attempt.id,
            questionId: questionId,
            answer,
            submittedAt: new Date(),
          },
        });

        return res.json({
          success: true,
          message: "Answer submitted successfully",
          submission,
          attemptId: attempt.id // Return the attempt ID with the response
        });
      }
    } catch (error) {
      console.error("Error submitting answer:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Error submitting answer",
      });
    } finally {
      await prisma.$disconnect();
    }
  },

  async finishTestAttempt(req, res, next) {
    try {
       const { testId, attemptId } = req.body;
       
       console.log("Finishing test attempt for:", { 
         testId, 
         attemptId,
         userId: req.user.id,
         timestamp: new Date().toISOString()
       });
       
       // First, check if the test exists
       const test = await prisma.test.findUnique({
         where: { id: testId }
       });
       
       if (!test) {
         console.log(`Test with ID ${testId} not found`);
         return res.status(404).json({ 
           success: false,
           message: "Test not found" 
         });
       }
       
       // If attemptId is provided, try to find that specific attempt
       let attempt;
       
       if (attemptId) {
         console.log(`Looking for specific attempt ID: ${attemptId}`);
         attempt = await prisma.testAttempt.findUnique({
           where: {
             id: attemptId,
             testId: testId,
             userId: req.user.id,
           },
           include: {
             test: {
               include: {
                 questions: true,
               },
             },
             submissions: true,
           },
         });
         
         if (!attempt) {
           console.log(`Attempt with ID ${attemptId} not found`);
         } else {
           console.log(`Found attempt ${attemptId}, completedAt:`, attempt.completedAt);
           
           // If already completed, just return success
           if (attempt.completedAt) {
             return res.json({
               success: true,
               message: "Test already completed",
               attempt,
             });
           }
         }
       }
       
       // If specific attempt wasn't found or wasn't provided, look for any in-progress attempt
       if (!attempt) {
         console.log("Looking for any in-progress attempt");
         attempt = await prisma.testAttempt.findFirst({
           where: {
             testId: testId,
             userId: req.user.id,
             completedAt: null, // This means the test is still in progress
           },
           include: {
             test: {
               include: {
                 questions: true,
               },
             },
             submissions: true,
           },
         });
       }

      if (!attempt) {
        // Check if there's a completed attempt already
        const completedAttempt = await prisma.testAttempt.findFirst({
          where: {
            testId: testId,
            userId: req.user.id,
            completedAt: { not: null }
          }
        });
        
        if (completedAttempt) {
          console.log(`Test already completed at ${completedAttempt.completedAt}`);
          return res.status(200).json({ 
            success: true,
            message: "Test already completed",
            attempt: completedAttempt
          });
        }
        
        console.log("No in-progress test attempt found");
        return res.status(404).json({ 
          success: false,
          message: "Test attempt not found or already completed" 
        });
      }
      
      console.log(`Found test attempt: ${attempt.id}, marking as completed`);
    
      const updatedAttempt = await prisma.testAttempt.update({
        where: { id: attempt.id },
        data: {
          completedAt: new Date(),
        },
      });

      console.log(`Successfully marked attempt ${updatedAttempt.id} as completed`);

      return res.json({
        success: true,
        message: "Test attempt completed successfully",
        attempt: updatedAttempt,
      });
    } catch (error) {
      console.error("Error finishing test attempt:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Error finishing test attempt",
      });
    } finally {
      await prisma.$disconnect();
    }
  },
  // alows to get mentor all the test he/she has created til yet
  async getAllTestsCreatedByUser(req, res, next) {
    try {
      const userId = req.user.id;
      console.log("Getting tests for user:", userId);

      // First run the fix tests function to ensure no null subjects
      try {
        // Find all tests with missing subjects
        const testsWithoutSubject = await prisma.test.findMany({
          where: {
            mentorId: userId,
            OR: [
              { subjectId: null },
              { subject: null }
            ]
          },
          include: {
            class: true
          }
        });

        console.log(`Found ${testsWithoutSubject.length} tests with missing subjects`);

        // Process each test
        for (const test of testsWithoutSubject) {
          try {
            if (!test.class) {
              console.log(`Test ${test.id} has no class, skipping...`);
              continue;
            }

            // Create or find a default subject for the class
            let subject = await prisma.subject.findFirst({
              where: {
                name: "General",
                classId: test.classId
              }
            });

            if (!subject) {
              subject = await prisma.subject.create({
                data: {
                  name: "General",
                  classId: test.classId
                }
              });
            }

            // Update the test with the default subject
            await prisma.test.update({
              where: { id: test.id },
              data: { subjectId: subject.id }
            });

            console.log(`Fixed test ${test.id} by assigning to subject ${subject.id}`);
          } catch (err) {
            console.error(`Error fixing test ${test.id}:`, err);
          }
        }
      } catch (err) {
        console.error("Error fixing tests with missing subjects:", err);
      }

      // Now get all valid tests
      const tests = await prisma.test.findMany({
        where: {
          mentorId: userId,
          AND: [
            { classId: { not: null } },
            { subjectId: { not: null } }
          ]
        },
        include: {
          class: true,
          subject: true,
          questions: true,
        },
      });

      console.log(`Found ${tests.length} valid tests for user ${userId}`);

      // Filter out any remaining invalid tests as a safety measure
      const validTests = tests.filter(test => 
        test.class && 
        test.subject && 
        test.classId && 
        test.subjectId
      );

      console.log(`Returning ${validTests.length} tests after validation`);

      res.json({
        success: true,
        message: validTests,
      });
    } catch (error) {
      console.error("Error getting tests:", error);
      res.status(500).json({
        success: false,
        message: "Error getting tests: " + error.message,
      });
    } finally {
      await prisma.$disconnect();
    }
  },

  async deleteTest(req, res, next) {
    try {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ message: "Test ID is required." });
      }

      const test = await prisma.test.findUnique({
        where: {
          id,
        },
      });

      if (!test) {
        return res.status(404).json({ message: "Test not found." });
      }

      if (req.user.role !== "mentor") {
        return res.status(403).json({
          message: "Access denied. You must be a mentor to delete a test.",
        });
      }

      if (test.mentorId !== req.user.id) {
        return res.status(403).json({
          message:
            "Access denied. You must be the creator of the test to delete it.",
        });
      }

      await prisma.test.delete({
        where: {
          id,
        },
      });

      res.json(customResponse(200, "Test deleted successfully"));
    } catch (err) {
      res.json(customResponse(400, err));
      console.error(err);
    }
  },
  async getUserTestByClass(req, res, next) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
      }

      if (!req.user.classname) {
        return res.status(400).json({
          success: false,
          message: "User does not have a classname assigned",
        });
      }

      // Normalize and log the student's class name
      const studentClassname = req.user.classname.trim();
      console.log("Student requesting tests:", {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        classname: studentClassname
      });
      
      // Get all classes to help debug
      const allClasses = await prisma.class.findMany({
        select: {
          id: true,
          name: true,
        }
      });
      
      console.log("All available classes:", allClasses.map(c => `"${c.name}"`));
      
      // Get all tests to check what's available
      const allTests = await prisma.test.findMany({
        include: {
          class: {
            select: {
              name: true
            }
          },
          subject: {
            select: {
              name: true
            }
          }
        }
      });
      
      console.log("All tests in database:", allTests.map(t => ({
        id: t.id,
        title: t.title,
        className: t.class.name,
        subjectName: t.subject.name
      })));
      
      // Find the class ID for the user's class - case insensitive
      let userClass = await prisma.class.findFirst({
        where: {
          name: {
            equals: studentClassname,
            mode: 'insensitive'
          }
        },
      });
      
      console.log("Found class for student (exact match):", userClass);
      
      // If exact match not found, try a contains match
      if (!userClass) {
        userClass = await prisma.class.findFirst({
          where: {
            name: {
              contains: studentClassname,
              mode: 'insensitive'
            }
          },
        });
        console.log("Found class for student (contains match):", userClass);
      }
      
      // If still not found, create the class
      if (!userClass) {
        console.log("Class not found, creating:", studentClassname);
        userClass = await prisma.class.create({
          data: {
            name: studentClassname,
          },
        });
        console.log("Created new class:", userClass);
        
        // For a newly created class, there won't be any tests yet
        return res.json({
          success: true,
          message: [],
          info: `Class '${studentClassname}' was created as it didn't exist before. No tests available yet.`
        });
      }
      
      // Get all tests for the user's class
      const tests = await prisma.test.findMany({
        where: {
          classId: userClass.id,
        },
        include: {
          class: true,
          subject: true,
          owner: true,
          questions: true,
        },
      });
      
      console.log(`Found ${tests.length} tests for class ${userClass.name}`);
      tests.forEach(test => {
        console.log(`- Test: "${test.title}" (${test.id}) by ${test.owner.name}, questions: ${test.questions.length}`);
      });
      
      // Get the user's test attempts to show completion status
      const userAttempts = await prisma.testAttempt.findMany({
        where: {
          userId: req.user.id,
        },
      });
      
      // Format tests with attempt information
      const formattedTests = tests.map(test => {
        const attempts = userAttempts.filter(a => a.testId === test.id);
        return {
          ...test,
          questionCount: test.questions.length,
          // Remove questions array to avoid sending too much data
          questions: undefined,
          attempts: attempts.length > 0,
          completed: attempts.some(a => a.completedAt !== null),
        };
      });

      return res.json({
        success: true,
        message: formattedTests,
        classInfo: {
          id: userClass.id,
          name: userClass.name
        }
      });
    } catch (err) {
      console.error("Error in getUserTestByClass:", err);
      return res.status(500).json({
        success: false,
        message: err.message || "An error occurred",
        stack: err.stack,
      });
    }
  },
  async fixTestsWithMissingSubjects(req, res) {
    try {
      // Find all tests with missing subjects
      const testsWithoutSubject = await prisma.test.findMany({
        where: {
          OR: [
            { subjectId: null },
            { subject: null }
          ]
        },
        include: {
          class: true
        }
      });

      console.log(`Found ${testsWithoutSubject.length} tests with missing subjects`);

      // Process each test
      for (const test of testsWithoutSubject) {
        try {
          if (!test.class) {
            console.log(`Test ${test.id} has no class, deleting...`);
            await prisma.test.delete({
              where: { id: test.id }
            });
            continue;
          }

          // Create or find a default subject for the class
          let subject = await prisma.subject.findFirst({
            where: {
              name: "General",
              classId: test.classId
            }
          });

          if (!subject) {
            subject = await prisma.subject.create({
              data: {
                name: "General",
                classId: test.classId
              }
            });
          }

          // Update the test with the default subject
          await prisma.test.update({
            where: { id: test.id },
            data: { subjectId: subject.id }
          });

          console.log(`Fixed test ${test.id} by assigning to subject ${subject.id}`);
        } catch (err) {
          console.error(`Error fixing test ${test.id}:`, err);
        }
      }

      res.json({
        success: true,
        message: `Fixed ${testsWithoutSubject.length} tests with missing subjects`
      });
    } catch (error) {
      console.error("Error fixing tests:", error);
      res.status(500).json({
        success: false,
        message: "Error fixing tests: " + error.message
      });
    } finally {
      await prisma.$disconnect();
    }
  }
};

export default testController;
