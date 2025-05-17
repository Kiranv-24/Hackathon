import React, { useState, useEffect } from "react";
import { getmaterial } from "../../api/material";
import { useParams, useNavigate } from "react-router-dom";
import { FaFilePdf, FaDownload } from "react-icons/fa";
import { CircularProgress, Typography, Box, Alert } from "@mui/material";
import toast from "react-hot-toast";

function Material() {
  const { subjectName } = useParams();
  const navigate = useNavigate();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getmaterial(subjectName);
        if (response.success) {
          setMaterials(response.message);
        } else {
          setError(response.message);
          toast.error(response.message);
        }
      } catch (err) {
        const errorMessage = err.message || "Failed to fetch materials. Please try again later.";
        setError(errorMessage);
        toast.error(errorMessage);
        
        // Handle authentication errors
        if (err.message === "No token provided" || err.message === "Invalid token") {
          toast.error("Please login to view materials");
          navigate("/login");
        }
        
        console.error("Error fetching materials:", err);
      } finally {
        setLoading(false);
      }
    };

    if (subjectName) {
      fetchMaterials();
    }
  }, [subjectName, navigate]);

  const handleDownload = (fileUrl, fileName) => {
    try {
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      toast.error("Failed to download file. Please try again.");
      console.error("Download error:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert severity="error" className="mb-4">
          {error}
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Typography variant="h4" className="mb-8 font-bold">
        Materials for {subjectName}
      </Typography>
      
      {materials.length === 0 ? (
        <Box className="text-center py-8">
          <Typography variant="h6" color="textSecondary">
            No materials available for this subject yet.
          </Typography>
        </Box>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {materials.map((material) => (
            <div
              key={material.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <Typography variant="h6" className="font-semibold mb-2">
                {material.title}
              </Typography>
              <Typography variant="body2" color="textSecondary" className="mb-4">
                {material.content}
              </Typography>
              
              {material.fileUrl && (
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <a
                      href={material.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                    >
                      <FaFilePdf className="mr-2" />
                      View PDF
                    </a>
                    <button
                      onClick={() => handleDownload(material.fileUrl, material.fileName)}
                      className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                    >
                      <FaDownload className="mr-2" />
                      Download
                    </button>
                  </div>
                  <Typography variant="caption" color="textSecondary" className="block">
                    {material.fileName} ({(material.fileSize / 1024 / 1024).toFixed(2)} MB)
                  </Typography>
                </div>
              )}
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <Typography variant="caption" color="textSecondary">
                  Uploaded by: {material.owner?.name || 'Unknown'}
                </Typography>
                <Typography variant="caption" color="textSecondary" className="block">
                  {new Date(material.createdAt).toLocaleDateString()}
                </Typography>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Material;