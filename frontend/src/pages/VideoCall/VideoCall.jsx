import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';
import {
  MdMicOff,
  MdMic,
  MdVideocamOff,
  MdVideocam,
  MdScreenShare,
  MdStopScreenShare,
  MdContentCopy,
  MdCallEnd
} from 'react-icons/md';

const VideoCall = () => {
  const { t } = useTranslation();
  const [roomId, setRoomId] = useState('');
  const [name, setName] = useState('');
  const [joined, setJoined] = useState(false);
  const [stream, setStream] = useState(null);
  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [loading, setLoading] = useState(false);

  const localVideoRef = useRef();
  const peerConnections = useRef({});
  const socket = useRef();

  useEffect(() => {
    // Initialize WebSocket connection
    socket.current = new WebSocket(`${import.meta.env.VITE_WS_URL}/video-call`);

    socket.current.onmessage = handleSocketMessage;
    socket.current.onclose = () => {
      toast.error(t('video_call.connection_error'));
    };

    return () => {
      if (socket.current) {
        socket.current.close();
      }
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleSocketMessage = async (event) => {
    const data = JSON.parse(event.data);
    switch (data.type) {
      case 'offer':
        handleOffer(data);
        break;
      case 'answer':
        handleAnswer(data);
        break;
      case 'ice-candidate':
        handleIceCandidate(data);
        break;
      case 'user-joined':
        handleUserJoined(data);
        break;
      case 'user-left':
        handleUserLeft(data);
        break;
    }
  };

  const createRoom = () => {
    setRoomId(uuidv4());
  };

  const joinRoom = async () => {
    if (!roomId || !name) return;
    setLoading(true);

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      setStream(mediaStream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = mediaStream;
      }

      socket.current.send(JSON.stringify({
        type: 'join-room',
        roomId,
        name
      }));

      setJoined(true);
    } catch (error) {
      console.error(error);
      if (error.name === 'NotFoundError') {
        toast.error(t('video_call.no_devices'));
      } else if (error.name === 'NotAllowedError') {
        toast.error(t('video_call.permission_denied'));
      } else {
        toast.error(t('video_call.join_error'));
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleMic = () => {
    if (stream) {
      stream.getAudioTracks().forEach(track => {
        track.enabled = !micEnabled;
      });
      setMicEnabled(!micEnabled);
    }
  };

  const toggleCamera = () => {
    if (stream) {
      stream.getVideoTracks().forEach(track => {
        track.enabled = !cameraEnabled;
      });
      setCameraEnabled(!cameraEnabled);
    }
  };

  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      // Stop screen sharing and revert to camera
      stream.getTracks().forEach(track => track.stop());
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      setStream(newStream);
      localVideoRef.current.srcObject = newStream;
      setIsScreenSharing(false);
    } else {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true
        });
        setStream(screenStream);
        localVideoRef.current.srcObject = screenStream;
        setIsScreenSharing(true);
      } catch (error) {
        console.error(error);
      }
    }
  };

  const leaveCall = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    if (socket.current) {
      socket.current.close();
    }
    setJoined(false);
    setStream(null);
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    toast.success(t('video_call.room_id_copied'));
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-primary mb-8">
          {t('video_call.title')}
        </h1>

        {!joined ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {t('video_call.room_id')}
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <input
                    type="text"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    placeholder={t('video_call.enter_room_id')}
                    className="flex-1 rounded-l-md border-gray-300 focus:border-theme focus:ring-theme"
                  />
                  <button
                    type="button"
                    onClick={createRoom}
                    className="px-4 py-2 bg-theme text-white rounded-r-md hover:bg-theme-dark"
                  >
                    {t('video_call.create_room')}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {t('video_call.your_name')}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('video_call.enter_name')}
                  className="mt-1 block w-full rounded-md border-gray-300 focus:border-theme focus:ring-theme"
                />
              </div>

              <button
                onClick={joinRoom}
                disabled={!roomId || !name || loading}
                className="w-full px-4 py-2 bg-theme text-white rounded-md hover:bg-theme-dark disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    {t('video_call.join')}...
                  </span>
                ) : (
                  t('video_call.join')
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={copyRoomId}
                    className="flex items-center space-x-2 text-gray-600 hover:text-theme"
                  >
                    <MdContentCopy className="text-xl" />
                    <span>{roomId}</span>
                  </button>
                </div>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={toggleMic}
                    className={`p-2 rounded-full ${
                      micEnabled ? 'bg-theme text-white' : 'bg-red-500 text-white'
                    }`}
                  >
                    {micEnabled ? <MdMic /> : <MdMicOff />}
                  </button>
                  <button
                    onClick={toggleCamera}
                    className={`p-2 rounded-full ${
                      cameraEnabled ? 'bg-theme text-white' : 'bg-red-500 text-white'
                    }`}
                  >
                    {cameraEnabled ? <MdVideocam /> : <MdVideocamOff />}
                  </button>
                  <button
                    onClick={toggleScreenShare}
                    className={`p-2 rounded-full ${
                      isScreenSharing ? 'bg-red-500 text-white' : 'bg-theme text-white'
                    }`}
                  >
                    {isScreenSharing ? <MdStopScreenShare /> : <MdScreenShare />}
                  </button>
                  <button
                    onClick={leaveCall}
                    className="p-2 rounded-full bg-red-500 text-white"
                  >
                    <MdCallEnd />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full rounded-lg"
                  />
                  <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded">
                    {name} (You)
                  </div>
                </div>
                {/* Remote videos will be added here dynamically */}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoCall; 