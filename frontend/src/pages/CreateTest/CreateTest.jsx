import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { IoMdAdd, IoMdRemove } from 'react-icons/io';
import axios from 'axios';

const CreateTest = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    testName: '',
    description: '',
    subject: '',
    class: '',
    questions: [
      {
        question: '',
        options: ['', ''],
        correctAnswer: 0
      }
    ]
  });

  const subjects = [
    'Mathematics',
    'Science',
    'English',
    'History',
    'Geography',
    'Physics',
    'Chemistry',
    'Biology'
  ];

  const classes = Array.from({ length: 12 }, (_, i) => i + 1);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleQuestionChange = (index, field, value) => {
    setFormData(prev => {
      const newQuestions = [...prev.questions];
      if (field === 'question') {
        newQuestions[index].question = value;
      } else if (field === 'correctAnswer') {
        newQuestions[index].correctAnswer = parseInt(value);
      }
      return {
        ...prev,
        questions: newQuestions
      };
    });
  };

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    setFormData(prev => {
      const newQuestions = [...prev.questions];
      newQuestions[questionIndex].options[optionIndex] = value;
      return {
        ...prev,
        questions: newQuestions
      };
    });
  };

  const addOption = (questionIndex) => {
    setFormData(prev => {
      const newQuestions = [...prev.questions];
      newQuestions[questionIndex].options.push('');
      return {
        ...prev,
        questions: newQuestions
      };
    });
  };

  const removeOption = (questionIndex, optionIndex) => {
    setFormData(prev => {
      const newQuestions = [...prev.questions];
      newQuestions[questionIndex].options.splice(optionIndex, 1);
      return {
        ...prev,
        questions: newQuestions
      };
    });
  };

  const addQuestion = () => {
    setFormData(prev => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          question: '',
          options: ['', ''],
          correctAnswer: 0
        }
      ]
    }));
  };

  const removeQuestion = (index) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    if (!formData.testName) {
      toast.error(t('create_test.required_field'));
      return false;
    }
    if (!formData.subject) {
      toast.error(t('create_test.required_field'));
      return false;
    }
    if (!formData.class) {
      toast.error(t('create_test.required_field'));
      return false;
    }
    if (formData.questions.length === 0) {
      toast.error(t('create_test.min_questions'));
      return false;
    }
    for (const question of formData.questions) {
      if (!question.question) {
        toast.error(t('create_test.required_field'));
        return false;
      }
      if (question.options.length < 2) {
        toast.error(t('create_test.min_options'));
        return false;
      }
      for (const option of question.options) {
        if (!option) {
          toast.error(t('create_test.required_field'));
          return false;
        }
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/v1/test/create`,
        formData,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.data) {
        toast.success(t('create_test.success'));
        navigate('/mentor/tests');
      }
    } catch (error) {
      console.error(error);
      toast.error(t('create_test.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-primary mb-8">
          {t('create_test.title')}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {t('create_test.test_name')} *
            </label>
            <input
              type="text"
              name="testName"
              value={formData.testName}
              onChange={handleChange}
              placeholder={t('create_test.test_name_placeholder')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-theme focus:ring-theme"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              {t('create_test.description')}
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder={t('create_test.description_placeholder')}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-theme focus:ring-theme"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t('create_test.subject')} *
              </label>
              <select
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-theme focus:ring-theme"
                required
              >
                <option value="">{t('create_test.select_subject')}</option>
                {subjects.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t('create_test.class')} *
              </label>
              <select
                name="class"
                value={formData.class}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-theme focus:ring-theme"
                required
              >
                <option value="">{t('create_test.select_class')}</option>
                {classes.map(cls => (
                  <option key={cls} value={cls}>Class {cls}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-primary">
                {t('create_test.questions')}
              </h2>
              <button
                type="button"
                onClick={addQuestion}
                className="flex items-center space-x-2 px-4 py-2 bg-theme text-white rounded-md hover:bg-theme-dark"
              >
                <IoMdAdd />
                <span>{t('create_test.add_question')}</span>
              </button>
            </div>

            <div className="space-y-6">
              {formData.questions.map((question, qIndex) => (
                <div key={qIndex} className="p-4 border rounded-lg space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700">
                        {t('create_test.new_question')} *
                      </label>
                      <input
                        type="text"
                        value={question.question}
                        onChange={(e) => handleQuestionChange(qIndex, 'question', e.target.value)}
                        placeholder={t('create_test.question_placeholder')}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-theme focus:ring-theme"
                        required
                      />
                    </div>
                    {formData.questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeQuestion(qIndex)}
                        className="ml-4 text-red-500 hover:text-red-700"
                      >
                        <IoMdRemove />
                      </button>
                    )}
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        {t('create_test.options')}
                      </label>
                      <button
                        type="button"
                        onClick={() => addOption(qIndex)}
                        className="text-theme hover:text-theme-dark"
                      >
                        <IoMdAdd />
                      </button>
                    </div>
                    {question.options.map((option, oIndex) => (
                      <div key={oIndex} className="flex items-center space-x-2 mt-2">
                        <input
                          type="radio"
                          name={`correct-${qIndex}`}
                          checked={question.correctAnswer === oIndex}
                          onChange={() => handleQuestionChange(qIndex, 'correctAnswer', oIndex)}
                          className="focus:ring-theme h-4 w-4 text-theme border-gray-300"
                        />
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                          placeholder={`${t('create_test.option_placeholder')} ${oIndex + 1}`}
                          className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-theme focus:ring-theme"
                          required
                        />
                        {question.options.length > 2 && (
                          <button
                            type="button"
                            onClick={() => removeOption(qIndex, oIndex)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <IoMdRemove />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              {t('create_test.cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-theme text-white rounded-md hover:bg-theme-dark disabled:opacity-50"
            >
              {loading ? t('create_test.submitting') : t('create_test.create_test_button')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTest; 