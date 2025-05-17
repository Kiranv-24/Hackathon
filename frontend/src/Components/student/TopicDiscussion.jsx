import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import axios from "axios";

function TopicDiscussion() {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = "http://localhost:5000/v1";

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      headers: {
        authorization: `Bearer ${token}`,
      },
    };
  };

  const fetchTopics = async () => {
    try {
      const response = await axios.get(`${API_URL}/user/get-topics`, getAuthHeaders());
      if (response.data.success) {
        setTopics(response.data.message);
      }
    } catch (error) {
      toast.error("Failed to fetch topics");
      console.error("Error fetching topics:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopics();
    // Set up polling to check for new topics every 30 seconds
    const interval = setInterval(fetchTopics, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">Topics of Discussion</h2>
        
        {/* Topics list */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-4">Loading topics...</div>
          ) : topics.length > 0 ? (
            topics.map((topic) => (
              <div
                key={topic.id}
                className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-lg">{topic.owner?.name || "Unknown"}</h3>
                    <p className="text-sm text-gray-500">
                      {new Date(topic.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap">{topic.message}</p>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-gray-500">
              No topics posted yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TopicDiscussion; 