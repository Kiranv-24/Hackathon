import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import { IoSend } from 'react-icons/io5';
import { FaRobot } from 'react-icons/fa';
import { BsPersonCircle } from 'react-icons/bs';
import { AiOutlineLike, AiOutlineDislike } from 'react-icons/ai';

const VirtualAssistant = () => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState([
    { type: 'assistant', content: t('virtual_assistant.welcome_message') }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { type: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/v1/assistant/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ message: userMessage })
      });

      const data = await response.json();
      if (data.response) {
        setMessages(prev => [...prev, { 
          type: 'assistant', 
          content: data.response,
          id: Date.now()
        }]);
      } else {
        throw new Error('No response from assistant');
      }
    } catch (error) {
      console.error(error);
      toast.error(t('virtual_assistant.error_message'));
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = async (messageId, isPositive) => {
    try {
      await fetch(`${import.meta.env.VITE_BASE_URL}/v1/assistant/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          messageId,
          feedback: isPositive ? 'positive' : 'negative'
        })
      });
      toast.success(t('virtual_assistant.feedback.thanks'));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-primary flex items-center">
              <FaRobot className="mr-2 text-theme" />
              {t('virtual_assistant.title')}
            </h1>
          </div>

          <div className="h-[600px] flex flex-col">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.type === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`flex items-start space-x-2 max-w-[70%] ${
                      message.type === 'user' ? 'flex-row-reverse' : ''
                    }`}
                  >
                    {message.type === 'user' ? (
                      <BsPersonCircle className="text-2xl text-primary" />
                    ) : (
                      <FaRobot className="text-2xl text-theme" />
                    )}
                    <div
                      className={`rounded-lg p-3 ${
                        message.type === 'user'
                          ? 'bg-theme text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                      {message.type === 'assistant' && message.id && (
                        <div className="mt-2 flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleFeedback(message.id, true)}
                            className="text-gray-500 hover:text-green-500"
                          >
                            <AiOutlineLike />
                          </button>
                          <button
                            onClick={() => handleFeedback(message.id, false)}
                            className="text-gray-500 hover:text-red-500"
                          >
                            <AiOutlineDislike />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg p-3 flex items-center space-x-2">
                    <FaRobot className="text-2xl text-theme" />
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100" />
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-gray-200">
              <form onSubmit={handleSubmit} className="flex space-x-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={t('virtual_assistant.input_placeholder')}
                  className="flex-1 rounded-lg border-gray-300 focus:border-theme focus:ring-theme"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="px-4 py-2 bg-theme text-white rounded-lg hover:bg-theme-dark disabled:opacity-50"
                >
                  <IoSend />
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-primary mb-4">
            {t('virtual_assistant.suggestions.title')}
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {t('virtual_assistant.suggestions.items', { returnObjects: true }).map((item, index) => (
              <div
                key={index}
                className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                onClick={() => setInput(item)}
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VirtualAssistant; 