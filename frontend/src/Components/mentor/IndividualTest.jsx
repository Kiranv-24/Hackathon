import React, { useEffect, useState } from "react";
import { getSubmissionsByTestId } from "../../api/test";
import { useParams } from "react-router";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
} from "@mui/material";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { Check, CheckCheck, Clock, Eye } from "lucide-react";
import Loading from "../Loading";
import toast from "react-hot-toast";

function IndividualTest() {
  const { testId } = useParams();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setloading] = useState(false);

  const getSubmissions = async () => {
    try {
      setloading(true);
      const data = await getSubmissionsByTestId(testId);
      console.log("Test submissions:", data);
      if (data.success) {
        setSubmissions(data.message || []);
      } else {
        toast.error(data.message || "Failed to load submissions");
      }
    } catch (error) {
      console.error("Error fetching submissions:", error);
      toast.error("Failed to load test submissions");
    } finally {
      setloading(false);
    }
  };

  useEffect(() => {
    getSubmissions();
  }, [testId]);

  const getStatus = (submission) => {
    if (submission.completedAt) {
      return "Completed";
    }
    return "In Progress";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "PPpp");
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString || "N/A";
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-3xl font-merri mb-5">Test Submissions</h1>
      {!loading ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Student Name</TableCell>
                <TableCell>Started At</TableCell>
                <TableCell>Completed At</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Score</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {submissions.length > 0 ? (
                submissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell>{submission.user?.name || "Unknown"}</TableCell>
                    <TableCell>{formatDate(submission.startedAt)}</TableCell>
                    <TableCell>{formatDate(submission.completedAt)}</TableCell>
                    <TableCell>
                      <Chip 
                        label={getStatus(submission)}
                        color={submission.completedAt ? "success" : "warning"}
                        size="small"
                        icon={submission.completedAt ? <Check size={14} /> : <Clock size={14} />}
                      />
                    </TableCell>
                    <TableCell>
                      {submission.score !== null && submission.score !== undefined 
                        ? <Chip 
                            label={submission.score}
                            color="primary"
                            size="small"
                          />
                        : "Not Scored"}
                    </TableCell>
                    <TableCell>
                      {submission.completedAt ? (
                        <Link 
                          to={`/mentor/submission-details/${submission.id}`}
                          style={{ textDecoration: 'none' }}
                        >
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={submission.score !== null ? <Eye size={14} /> : <Check size={14} />}
                            color={submission.score !== null ? "primary" : "success"}
                          >
                            {submission.score !== null ? "View Details" : "Score Test"}
                          </Button>
                        </Link>
                      ) : (
                        <Chip 
                          label="In Progress"
                          color="warning"
                          size="small"
                          icon={<Clock size={14} />}
                        />
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No submissions found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Loading />
      )}
    </div>
  );
}

export default IndividualTest;
