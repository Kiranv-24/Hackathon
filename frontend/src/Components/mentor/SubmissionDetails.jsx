import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { getSubmissionDetails, scoreTestAttempt } from "../../api/test";
import {
  Card,
  CardContent,
  Typography,
  CircularProgress,
  TextField,
  Button,
  Alert,
  Box,
  Chip,
} from "@mui/material";
import toast from "react-hot-toast";
import { Check, Clock } from "lucide-react";

function SubmissionDetails() {
  const [details, setDetails] = useState([]);
  const [attemptInfo, setAttemptInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const [score, setScore] = useState("");
  
  const fetchDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSubmissionDetails(id);
      console.log("Submission details:", data);
      
      if (data.success) {
        setDetails(data.message || []);
        setAttemptInfo(data.attemptInfo);
        
        if (data.attemptInfo?.score !== null && data.attemptInfo?.score !== undefined) {
          setScore(data.attemptInfo.score.toString());
        }
      } else {
        setError("Failed to load submission details: " + data.message);
        toast.error(data.message || "Failed to load submission details");
      }
    } catch (error) {
      console.error("Error fetching submission details:", error);
      setError("Failed to load submission details: " + (error.message || "Unknown error"));
      toast.error("Failed to load submission details");
    } finally {
      setLoading(false);
    }
  };

  const validateScore = (value) => {
    const numScore = parseFloat(value);
    if (isNaN(numScore)) return false;
    if (numScore < 0 || numScore > 100) return false;
    return true;
  };

  const scoreTest = async () => {
    if (!validateScore(score)) {
      toast.error("Please enter a valid score between 0 and 100");
      return;
    }
    
    try {
      setSubmitting(true);
      setError(null);
      console.log("Submitting score:", { attemptId: id, score });
      const data = await scoreTestAttempt(id, score);
      
      if (data.success) {
        toast.success("Score submitted successfully");
        
        // Refresh the details to show updated score
        await fetchDetails();
        
        // Navigate back after a short delay
        setTimeout(() => {
          if (attemptInfo?.test?.id) {
            navigate(`/mentor/submission/${attemptInfo.test.id}`);
          } else {
            navigate(-1);
          }
        }, 1500);
      } else {
        setError(data.message || "Failed to submit score");
        toast.error(data.message || "Failed to submit score");
      }
    } catch (err) {
      console.error("Error submitting score:", err);
      setError("Failed to submit score: " + (err.message || "Unknown error"));
      toast.error("Failed to submit score: " + (err.message || "Unknown error"));
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="p-5 flex justify-center items-center h-[50vh]">
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-5">
        <h1 className="text-3xl font-merri mb-5">Submission Details</h1>
        <Alert severity="error" className="mb-4">
          {error}
        </Alert>
        <Button 
          variant="contained" 
          onClick={() => navigate(-1)}
          className="mt-4"
        >
          Go Back
        </Button>
      </div>
    );
  }

  if (!attemptInfo) {
    return (
      <div className="p-5">
        <h1 className="text-3xl font-merri mb-5">Submission Details</h1>
        <Alert severity="warning" className="mb-4">
          Test attempt not found
        </Alert>
        <Button 
          variant="contained" 
          onClick={() => navigate(-1)}
          className="mt-4"
        >
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="p-5">
      <h1 className="text-3xl font-merri mb-5">Submission Details</h1>
      
      <Box className="bg-white p-4 rounded-lg shadow-md mb-6">
        <Typography variant="h6" className="font-semibold">
          Student: {attemptInfo.user?.name || "Unknown"}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Test: {attemptInfo.test?.title || "Unknown"}
        </Typography>
        <Box className="flex flex-col md:flex-row gap-4 mt-2">
          <Typography variant="body2" color="text.secondary">
            Started: {attemptInfo.startedAt ? new Date(attemptInfo.startedAt).toLocaleString() : "N/A"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Completed: {attemptInfo.completedAt ? new Date(attemptInfo.completedAt).toLocaleString() : "Not completed"}
          </Typography>
          {attemptInfo.score !== null && attemptInfo.score !== undefined && (
            <Chip 
              label={`Score: ${attemptInfo.score}`}
              color="primary"
              size="small"
              icon={<Check size={14} />}
            />
          )}
        </Box>
      </Box>
      
      <div className="details-container space-y-4">
        {details.length > 0 ? (
          <>
            {details.map((item, index) => (
              <Card
                key={item.id}
                className="mb-4 shadow-md rounded-lg hover:shadow-lg transition-shadow duration-300"
              >
                <CardContent>
                  <Typography
                    variant="h6"
                    component="div"
                    className="font-semibold"
                  >
                    Question {index + 1}: {item.question.question}
                  </Typography>
                  <Typography
                    variant="body1"
                    className="mt-2 p-3 bg-gray-50 rounded-md"
                  >
                    <strong>Answer:</strong>{" "}
                    {item.answer || "No answer provided"}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    className="mt-1 block"
                  >
                    <strong>Submitted At:</strong>{" "}
                    {new Date(item.submittedAt).toLocaleString()}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </>
        ) : (
          <Alert severity="info" className="mb-4">
            No answers submitted yet for this test attempt.
          </Alert>
        )}
        
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <Typography variant="h6" className="mb-2">
            Score Submission
          </Typography>
          <div className="flex flex-col md:flex-row gap-4 items-start">
            <TextField
              label="Score (0-100)"
              variant="outlined"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              className="w-full md:w-1/3"
              type="number"
              inputProps={{ min: 0, max: 100, step: "0.1" }}
              size="small"
              disabled={submitting || (attemptInfo.score !== null && attemptInfo.score !== undefined)}
              error={score !== "" && !validateScore(score)}
              helperText={score !== "" && !validateScore(score) ? "Please enter a valid score between 0 and 100" : ""}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={scoreTest}
              disabled={submitting || (attemptInfo.score !== null && attemptInfo.score !== undefined) || !validateScore(score)}
              className="ml-2"
            >
              {submitting ? "Submitting..." : (attemptInfo.score !== null && attemptInfo.score !== undefined) ? "Already Scored" : "Submit Score"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SubmissionDetails;
