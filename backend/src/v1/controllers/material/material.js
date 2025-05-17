import { PrismaClient } from "@prisma/client";
import { customResponse } from "../../../utils/Response";
import cloudinary from "../../config/cloudinary";
import { Readable } from "stream";

let prisma;

try {
  prisma = new PrismaClient();
} catch (error) {
  console.error("Error initializing Prisma Client:", error);
  process.exit(1);
}

const materialController = {
  async deleteSubject(req, res, next) {
    try {
      const subjectId = req.params.id;
      console.log(subjectId, "subj");

      // Delete the subject
      await prisma.subject.delete({
        where: {
          id: subjectId,
        },
      });

      res.json({ success: true, message: "Subject deleted successfully." });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  async getmaterials(req, res, next) {
    try {
      if (!req.user) {
        return res
          .status(401)
          .json({ message: "Unauthorized. Please log in." });
      }

      const { classId, subjectId } = req.body;

      if (!classId || !subjectId) {
        return res
          .status(400)
          .json({ message: "both class and subject is required." });
      }

      const materials = await prisma.material.findMany({
        where: {
          classId,
          subjectId,
        },
      });

      if (!materials || materials.length === 0) {
        return res
          .status(404)
          .json({ message: "No materials found for the specified criteria." });
      }

      res.json(customResponse(200, materials));
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  },
  async createMaterialsMentor(req, res, next) {
    try {
      const { title, content, classname, subjectname } = req.body;
      const pdfFile = req.file;

      console.log("Creating material with data:", {
        title,
        content,
        classname,
        subjectname,
        hasFile: !!pdfFile
      });

      if (!title || !content || !classname || !subjectname) {
        return res.json({
          success: false,
          message: "All fields are required",
        });
      }

      // Find or create class (case-insensitive)
      let classRecord = await prisma.class.findFirst({
        where: {
          name: {
            equals: classname,
            mode: 'insensitive'
          }
        },
      });

      console.log("Class record:", classRecord);

      if (!classRecord) {
        classRecord = await prisma.class.create({
          data: {
            name: classname,
          },
        });
        console.log("Created new class:", classRecord);
      }

      // Find or create subject (case-insensitive)
      let subjectRecord = await prisma.subject.findFirst({
        where: {
          name: {
            equals: subjectname,
            mode: 'insensitive'
          },
          classId: classRecord.id,
        },
      });

      console.log("Subject record:", subjectRecord);

      if (!subjectRecord) {
        subjectRecord = await prisma.subject.create({
          data: {
            name: subjectname,
            classId: classRecord.id,
          },
        });
        console.log("Created new subject:", subjectRecord);
      }

      let fileUrl = null;
      let fileName = null;
      let fileType = null;
      let fileSize = null;

      if (pdfFile) {
        try {
          console.log("Uploading file to Cloudinary:", {
            originalname: pdfFile.originalname,
            mimetype: pdfFile.mimetype,
            size: pdfFile.size
          });

          // Convert buffer to stream
          const stream = Readable.from(pdfFile.buffer);
          
          // Upload to Cloudinary
          const uploadResponse = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
              {
                resource_type: "raw",
                folder: "materials",
                format: "pdf",
              },
              (error, result) => {
                if (error) reject(error);
                else resolve(result);
              }
            );

            stream.pipe(uploadStream);
          });

          fileUrl = uploadResponse.secure_url;
          fileName = pdfFile.originalname;
          fileType = pdfFile.mimetype;
          fileSize = pdfFile.size;

          console.log("File uploaded successfully:", {
            url: fileUrl,
            name: fileName,
            type: fileType,
            size: fileSize
          });
        } catch (uploadError) {
          console.error("Error uploading file:", uploadError);
          return res.json({
            success: false,
            message: "Failed to upload file. Please try again.",
          });
        }
      }

      // Create material with proper relations
      const materialData = {
        userId: req.user.id,
        subjectId: subjectRecord.id,
        classId: classRecord.id,
        content: content,
        title: title,
      };

      // Only add file information if a file was uploaded
      if (fileUrl) {
        materialData.fileUrl = fileUrl;
        materialData.fileName = fileName;
        materialData.fileType = fileType;
        materialData.fileSize = fileSize;
      }

      console.log("Creating material with data:", materialData);

      const newMaterial = await prisma.material.create({
        data: materialData,
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          },
          subject: true,
        }
      });

      console.log("Created material:", {
        id: newMaterial.id,
        subjectId: newMaterial.subjectId,
        classId: newMaterial.classId,
        subjectName: newMaterial.subject.name,
        className: classRecord.name,
        hasFile: !!newMaterial.fileUrl,
        fileUrl: newMaterial.fileUrl
      });

      res.json({
        success: true,
        message: newMaterial,
      });

    } catch (err) {
      console.error("Error creating material:", err);
      res.json({
        success: false,
        message: err.message || "Failed to create material",
      });
    }
  },
  async getMaterialByClass(req, res, next) {
    try {
      const { subjectname } = req.params;
      const userId = req.user.id;

      console.log("Fetching materials for:", {
        subjectname,
        userId
      });

      // Get user's class
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { classname: true }
      });

      console.log("User class:", user?.classname);

      if (!user || !user.classname) {
        return res.json({
          success: false,
          message: "User class not found"
        });
      }

      // Get class ID
      const classRecord = await prisma.class.findFirst({
        where: {
          name: {
            equals: user.classname,
            mode: 'insensitive'
          }
        }
      });

      console.log("Class record:", classRecord);

      if (!classRecord) {
        return res.json({
          success: false,
          message: "Class not found"
        });
      }

      // Get subject ID
      const subject = await prisma.subject.findFirst({
        where: {
          name: {
            equals: subjectname,
            mode: 'insensitive'
          },
          classId: classRecord.id
        }
      });

      console.log("Subject record:", subject);

      if (!subject) {
        return res.json({
          success: false,
          message: "Subject not found"
        });
      }

      // Get materials with owner info and file information
      const materials = await prisma.material.findMany({
        where: {
          subjectId: subject.id,
          classId: classRecord.id
        },
        select: {
          id: true,
          title: true,
          content: true,
          fileUrl: true,
          fileName: true,
          fileType: true,
          fileSize: true,
          createdAt: true,
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

      console.log("Found materials:", {
        count: materials.length,
        materials: materials.map(m => ({
          id: m.id,
          title: m.title,
          hasFile: !!m.fileUrl,
          fileUrl: m.fileUrl,
          fileName: m.fileName
        }))
      });

      res.json({
        success: true,
        message: materials
      });

    } catch (err) {
      console.error("Error fetching materials:", err);
      res.json({
        success: false,
        message: err.message || "Failed to fetch materials"
      });
    }
  },
  async getallSubjects(req, res, next) {
    try {
      if (!req.user) {
        return res.json({
          success: false,
          message: "User not authenticated",
        });
      }

      const classname = req.user.classname;

      if (!classname) {
        return res.json({
          success: false,
          message: "User does not have a classname assigned",
        });
      }

      console.log("Looking for subjects for class:", classname);

      // Find the class ID for the user's class
      let findclassId = await prisma.class.findFirst({
        where: {
          name: classname,
        },
      });

      // If class doesn't exist, create it
      if (!findclassId) {
        console.log("Class not found, creating:", classname);
        findclassId = await prisma.class.create({
          data: {
            name: classname,
          },
        });
        
        // Return with a message but empty subjects array since it's a new class
        return res.json({
          success: true,
          message: [],
          info: `Class '${classname}' was created as it didn't exist before`
        });
      }

      // Find subjects for the class
      const subjects = await prisma.subject.findMany({
          where: {
            classId: findclassId.id,
          },
        });

      console.log(`Found ${subjects.length} subjects for class ${classname}`);

      // If no subjects found, create default subjects for class 11
      if (subjects.length === 0 && classname === "11") {
        console.log("Creating default subjects for class 11");
        
        const defaultSubjects = ["Physics", "Chemistry", "Mathematics", "Biology", "English"];
        const createdSubjects = [];
        
        for (const subjectName of defaultSubjects) {
          const subject = await prisma.subject.create({
            data: {
              name: subjectName,
              classId: findclassId.id,
            },
          });
          createdSubjects.push(subject);
        }
        
        return res.json({
          success: true,
          message: createdSubjects,
          info: "Default subjects were created for Class 11"
        });
      }

      return res.json({
        success: true,
        message: subjects,
      });
    } catch (err) {
      console.error("Error in getallSubjects:", err);
      return res.status(500).json({
        success: false,
        message: err.message || "An error occurred",
        error: err.toString()
      });
    }
  },
};

export default materialController;