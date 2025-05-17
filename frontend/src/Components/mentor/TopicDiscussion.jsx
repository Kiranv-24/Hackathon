import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import axios from "axios";
import { FaPaperPlane } from "react-icons/fa";

function TopicDiscussion() {
  const [topics, setTopics] = useState([]);
  const [newTopic, setNewTopic] = useState("");
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newTopic.trim()) {
      toast.error("Please enter a topic");
      return;
    }

    try {
      const response = await axios.post(
        `${API_URL}/user/create-topic`,
        { message: newTopic },
        getAuthHeaders()
      );

      if (response.data.success) {
        toast.success("Topic posted successfully");
        setNewTopic("");
        fetchTopics(); // Refresh the topics list
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to post topic");
      console.error("Error posting topic:", error);
    }
  };

  useEffect(() => {
    fetchTopics();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">Topic of Discussion</h2>
        
        {/* Post new topic form */}
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex gap-4">
            <textarea
              value={newTopic}
              onChange={(e) => setNewTopic(e.target.value)}
              placeholder="Write a topic for discussion..."
              className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
            >
              <FaPaperPlane />
              Post
            </button>
          </div>
        </form>

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
              No topics posted yet. Be the first to start a discussion!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TopicDiscussion; 