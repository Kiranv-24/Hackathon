import React from "react";
import { getSubmissionQuery } from "../../api/user";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Typography,
  Box,
} from "@mui/material";
import { Check, Clock, AlertTriangle } from "lucide-react";

function MySubmissions() {
  const { data: submissionData, isLoading } = getSubmissionQuery();

  const formatter = (data) => {
    if (!data) return "N/A";
    return new Date(data).toLocaleString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
  };

  const getStatusChip = (submission) => {
    if (!submission.startedAt) {
      return (
        <Chip
          label="Not Started"
          color="default"
          size="small"
          icon={<AlertTriangle size={14} />}
        />
      );
    }
    if (!submission.completedAt) {
      return (
        <Chip
          label="In Progress"
          color="warning"
          size="small"
          icon={<Clock size={14} />}
        />
      );
    }
    return (
      <Chip
        label="Completed"
        color="success"
        size="small"
        icon={<Check size={14} />}
      />
    );
  };

  const getScoreChip = (submission) => {
    if (!submission.completedAt) {
      return (
        <Chip
          label="Test not completed"
          color="default"
          size="small"
        />
      );
    }
    if (submission.score === null || submission.score === undefined) {
      return (
        <Chip
          label="Pending evaluation"
          color="warning"
          size="small"
          icon={<Clock size={14} />}
        />
      );
    }
    return (
      <Chip
        label={`Score: ${submission.score}`}
        color="primary"
        size="small"
        icon={<Check size={14} />}
      />
    );
  };

  if (isLoading) {
    return (
      <Box className="flex justify-center items-center h-[50vh]">
        <CircularProgress />
      </Box>
    );
  }

  if (!submissionData || submissionData.length === 0) {
    return (
      <Box className="max-w-7xl mx-auto p-4">
        <Typography variant="h4" className="mb-4">
          My Test Submissions
        </Typography>
        <Paper className="p-4">
          <Typography variant="body1" color="text.secondary">
            No test submissions found.
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box className="max-w-7xl mx-auto p-4">
      <Typography variant="h4" className="mb-4">
        My Test Submissions
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Test Name</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Started At</TableCell>
              <TableCell>Completed At</TableCell>
              <TableCell>Score</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {submissionData.map((submission) => (
              <TableRow
                key={submission.id}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  <Typography variant="body1">
                    {submission.test?.title || "Unknown Test"}
                  </Typography>
                  {submission.test?.subject && (
                    <Typography variant="caption" color="text.secondary" display="block">
                      Subject: {submission.test.subject.name}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>{getStatusChip(submission)}</TableCell>
                <TableCell>{formatter(submission.startedAt)}</TableCell>
                <TableCell>{formatter(submission.completedAt)}</TableCell>
                <TableCell>{getScoreChip(submission)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default MySubmissions;
