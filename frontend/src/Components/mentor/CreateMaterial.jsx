import React, { useState } from "react";
import Leftbar from "../Leftbar";
import { createMaterial } from "../../api/material";
import toast from "react-hot-toast";
import { FaFilePdf } from "react-icons/fa";

function CreateMaterial() {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    classname: "",
    subjectname: "",
  });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
    } else {
      toast.error("Please select a PDF file");
      e.target.value = null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("content", formData.content);
      formDataToSend.append("classname", formData.classname);
      formDataToSend.append("subjectname", formData.subjectname);
      
      if (file) {
        formDataToSend.append("pdfFile", file);
      }

      const data = await createMaterial(formDataToSend);
      if (data.success) {
        toast.success("Material added successfully");
        // Reset form
        setFormData({
          title: "",
          content: "",
          classname: "",
          subjectname: "",
        });
        setFile(null);
        e.target.reset();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create material");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="base-container py-[5vh]">
      <h2 className="text-3xl font-merri">Create Material</h2>
      <form onSubmit={handleSubmit} className="base-container py-[5vh] w-3/4 font-comf">
        <div className="mb-4">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="mt-1 p-2 border rounded-md w-full"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="content" className="block text-sm font-medium text-gray-700">
            Content
          </label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            rows="4"
            className="mt-1 p-2 border rounded-md w-full"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="classname" className="block text-sm font-medium text-gray-700">
            Class Name
          </label>
          <input
            type="text"
            id="classname"
            name="classname"
            value={formData.classname}
            onChange={handleChange}
            className="mt-1 p-2 border rounded-md w-full"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="subjectname" className="block text-sm font-medium text-gray-700">
            Subject Name
          </label>
          <input
            type="text"
            id="subjectname"
            name="subjectname"
            value={formData.subjectname}
            onChange={handleChange}
            className="mt-1 p-2 border rounded-md w-full"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="pdfFile" className="block text-sm font-medium text-gray-700">
            PDF File
          </label>
          <div className="mt-1 flex items-center">
            <label className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer">
              <FaFilePdf className="mr-2 text-red-500" />
              Choose PDF
              <input
                type="file"
                id="pdfFile"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
            {file && (
              <span className="ml-3 text-sm text-gray-500">
                {file.name}
              </span>
            )}
          </div>
        </div>
        <div className="mt-4">
          <button
            type="submit"
            className="primary-btn text-sm"
            disabled={uploading}
          >
            {uploading ? "Uploading..." : "Create Material"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateMaterial;