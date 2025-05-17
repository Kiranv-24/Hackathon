import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const API_URL = "http://localhost:5000/v1";

// Create axios instance with auth token
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      authorization: `Bearer ${token}`,
    },
  };
};

const getallSubjects = async () => {
  try {
    const response = await axios.get(`${API_URL}/user/get-subjects`, getAuthHeaders());
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: "Failed to fetch subjects" };
  }
};

const getmaterial = async (subjectName) => {
  try {
    const response = await axios.get(`${API_URL}/user/get-materials/${subjectName}`, {
      ...getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: "Failed to fetch materials" };
  }
};

const createMaterial = async (formData) => {
  try {
    const response = await axios.post(`${API_URL}/user/create-material`, formData, {
      ...getAuthHeaders(),
      headers: {
        ...getAuthHeaders().headers,
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: "Failed to create material" };
  }
};

const getSubjectsQuery = () =>
  useQuery({
    queryKey: ["get-subjects"],
    queryFn: () => getallSubjects(),
    select: (data) => {
      const res = data.message;
      return res;
    },
  });

export { getmaterial, getSubjectsQuery, createMaterial };