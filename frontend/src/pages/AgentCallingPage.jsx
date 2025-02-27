import React, { useContext, useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import { BACKEND_URL_GENERAL, BACKEND_URL } from "../constant";
import { UserContext } from "../context/userContext";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const APP_ID = 1732474976;
const SERVER_SECRET = "1359f8ebc4b18686a67903a028ec194a";

function AgentCallingPage() {
  const [callRequested, setCallRequested] = useState(false);
  const [otherPartyId, setOtherPartyId] = useState(null);
  const [callConnected, setCallConnected] = useState(false);
  const [roomId, setRoomId] = useState(null);
  const [recordedAudio, setRecordedAudio] = useState({});
  const [roomAudio, setRoomAudio] = useState(null);
  const socketRef = useRef(null);
  const mediaRecorderRef = useRef({});
  const roomRecorderRef = useRef(null);
  const audioChunksRef = useRef({});
  const roomAudioChunksRef = useRef([]);
  const { user } = useContext(UserContext);
  const [agentAudioAnalyzed, setAgentAudioAnalyzed] = useState(null);
  const [clientAudioAnalyzed, setClientAudioAnalyzed] = useState(null);
  const [callEnded, setCallEnded] = useState(false);
  const [showScheduler, setShowScheduler] = useState(false);
  const [scheduleDate, setScheduleDate] = useState(getTomorrowDate());
  const [scheduling, setScheduling] = useState(false);

  function getTomorrowDate() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  }

  useEffect(() => {
    socketRef.current = io(BACKEND_URL_GENERAL, { transports: ["websocket"] });
    socketRef.current.emit("register_agent");

    socketRef.current.on("call_request", (data) => {
      setCallRequested(true);
      setOtherPartyId(data.clientId);
      setRoomId(data.roomId);
    });

    socketRef.current.on("call_accepted", (data) => {
      setCallConnected(true);
      setOtherPartyId(data.clientId);
      setRoomId(data.roomId);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  const startZegoCall = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });

      const userID = `agent_${otherPartyId}`;
      const userName = "Agent";

      const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
        APP_ID,
        SERVER_SECRET,
        roomId,
        userID,
        userName
      );

      setTimeout(() => {
        const zp = ZegoUIKitPrebuilt.create(kitToken);
        zp.joinRoom({
          container: document.getElementById("zego-container"),
          scenario: { mode: ZegoUIKitPrebuilt.OneONoneCall },

          onJoinRoom: () => {
            startRecording(user._id);
            startRoomRecording();
          },

          onLeaveRoom: () => {
            stopRecording(user._id);
            stopRoomRecording();
            setCallEnded(true);
          },
        });
      }, 2000);
    } catch (error) {
      console.error("Error starting Zego call:", error);
    }
  };

  const startRecording = (userId) => {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current[userId] = mediaRecorder;

        const audioChunks = [];
        audioChunksRef.current[userId] = audioChunks;

        mediaRecorder.ondataavailable = (event) => {
          audioChunks.push(event.data);
        };

        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunks, { type: "audio/mp3" });
          const audioFile = new File([audioBlob], `${userId}_recording.mp3`, {
            type: "audio/mp3",
          });

          // Agent-specific logic
          const clientData = await fetch(
            `${BACKEND_URL}/call/get-client-record/${roomId}`,
            {
              method: "GET",
            }
          );

          await analyzeEmotion(audioFile, "AGENT");

          if (clientData.ok) {
            const clientAudioBlob = await clientData.blob();
            const clientAudioFile = new File(
              [clientAudioBlob],
              `client_recording.mp3`,
              {
                type: "audio/mp3",
              }
            );
            await analyzeEmotion(clientAudioFile, "CLIENT");
          }

          setRecordedAudio((prev) => ({
            ...prev,
            [userId]: URL.createObjectURL(audioBlob),
          }));

          await uploadAudio(userId, audioFile, true);
        };

        mediaRecorder.start();
      })
      .catch((error) =>
        console.error("Error starting audio recording:", error)
      );
  };

  // Function to record the entire room audio
  const startRoomRecording = () => {
    // Get audio context and create a merger for all audio in the call
    const audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();
    const destination = audioContext.createMediaStreamDestination();

    // This is a simplified approach - in a real implementation, you would need to
    // get all audio streams from Zego SDK, but here we'll use what's available
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        // Create a source from the stream
        const source = audioContext.createMediaStreamSource(stream);
        source.connect(destination);

        // Create a recorder for the combined stream
        const roomRecorder = new MediaRecorder(destination.stream);
        roomRecorderRef.current = roomRecorder;

        roomRecorder.ondataavailable = (event) => {
          roomAudioChunksRef.current.push(event.data);
        };

        roomRecorder.onstop = async () => {
          const audioBlob = new Blob(roomAudioChunksRef.current, {
            type: "audio/mp3",
          });
          const roomAudioFile = new File(
            [audioBlob],
            `room_${roomId}_recording.mp3`,
            {
              type: "audio/mp3",
            }
          );

          setRoomAudio(URL.createObjectURL(audioBlob));

          // Upload room audio
          await uploadRoomAudio(roomAudioFile);
        };

        roomRecorder.start();
      })
      .catch((error) => console.error("Error starting room recording:", error));
  };

  const stopRoomRecording = () => {
    if (
      roomRecorderRef.current &&
      roomRecorderRef.current.state === "recording"
    ) {
      roomRecorderRef.current.stop();
    }
  };

  const uploadRoomAudio = async (audioFile) => {
    try {
      const formData = new FormData();
      formData.append("audio", audioFile);
      formData.append("roomId", roomId);

      const response = await fetch(`${BACKEND_URL}/call/upload-room-audio`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      console.log("Room audio uploaded:", data);
    } catch (error) {
      console.error("Error uploading room audio:", error);
    }
  };

  const stopRecording = (userId) => {
    if (
      mediaRecorderRef.current[userId] &&
      mediaRecorderRef.current[userId].state === "recording"
    ) {
      mediaRecorderRef.current[userId].stop();
    }
  };

  const uploadAudio = async (userId, audioFile, isAgent) => {
    try {
      const formData = new FormData();
      formData.append("audio", audioFile);
      formData.append("userId", userId);
      formData.append("isAgent", isAgent);
      formData.append("roomId", roomId);

      console.log("UPLOADING AUDIO ", formData);

      const response = await fetch(
        `${BACKEND_URL}/call/upload-audio-after-call`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();
      console.log("Audio uploaded:", data);
    } catch (error) {
      console.error("Error uploading audio:", error);
    }
  };

  const analyzeEmotion = async (audioBlob, role) => {
    try {
      console.log(audioBlob);
      const formData = new FormData();
      formData.append("file", audioBlob);

      const response = await fetch(`http://127.0.0.1:5000/predict`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      console.log(`${role} Emotion Analysis:`, data);

      if (role === "AGENT") {
        setAgentAudioAnalyzed(data);
      } else if (role === "CLIENT") {
        setClientAudioAnalyzed(data);
      }
    } catch (error) {
      console.error(`Error analyzing ${role} emotion:`, error);
    }
  };

  const downloadAudio = (userId) => {
    const audioUrl = recordedAudio[userId];
    if (audioUrl) {
      const link = document.createElement("a");
      link.href = audioUrl;
      link.download = `${userId}_recorded_audio.mp3`;
      link.click();
    }
  };

  const downloadRoomAudio = () => {
    if (roomAudio) {
      const link = document.createElement("a");
      link.href = roomAudio;
      link.download = `room_${roomId}_recording.mp3`;
      link.click();
    }
  };

  const scheduleFollowUp = async () => {
    try {
      setScheduling(true);

      const scheduleData = {
        agentId: user._id,
        clientId: otherPartyId,
        roomCallAudio: roomId, // This assumes the backend can use roomId to find the recording
        scheduleDate: scheduleDate.toISOString(),
      };

      const response = await fetch(`${BACKEND_URL}/call/schedule/call`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(scheduleData),
      });

      const data = await response.json();
      console.log("Follow-up scheduled:", data);

      // Close scheduler UI after successful scheduling
      setShowScheduler(false);
    } catch (error) {
      console.error("Error scheduling follow-up:", error);
    } finally {
      setScheduling(false);
    }
  };

  useEffect(() => {
    if (callConnected) {
      startZegoCall();
    }
  }, [callConnected]);

  console.log("AGENT emotion data:", agentAudioAnalyzed);
  console.log("CLIENT emotion data:", clientAudioAnalyzed);

  return (
    <div className="w-screen min-h-screen bg-gray-900 text-white mx-auto p-8">
      {user && (
        <div className="flex items-center mb-6 bg-gray-800 p-4 rounded-lg shadow-md">
          <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mr-4">
            <span className="text-xl font-bold">{user.name.charAt(0)}</span>
          </div>
          <div>
            <h1 className="text-xl font-semibold">{user.name}</h1>
            <p className="text-gray-400">Agent ID: {user._id}</p>
          </div>
        </div>
      )}

      <h1 className="text-3xl font-bold mb-6 text-blue-400 border-b border-gray-700 pb-2">
        Agent Dashboard
      </h1>

      {/* Pre-call Information Section */}
      <div className="mb-8 bg-gray-800 rounded-lg p-6 shadow-lg">
        <h2 className="text-xl font-semibold mb-4 text-blue-300">
          Active Status
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-700 p-4 rounded-lg">
            <p className="text-gray-400 text-sm">Current Status</p>
            <p className="text-lg font-medium flex items-center">
              <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
              Available
            </p>
          </div>
          <div className="bg-gray-700 p-4 rounded-lg">
            <p className="text-gray-400 text-sm">Today's Calls</p>
            <p className="text-lg font-medium">12</p>
          </div>
          <div className="bg-gray-700 p-4 rounded-lg">
            <p className="text-gray-400 text-sm">Avg. Call Duration</p>
            <p className="text-lg font-medium">8m 24s</p>
          </div>
        </div>
      </div>

      {/* Incoming Call UI */}
      {callRequested && !callConnected && (
        <div className="bg-yellow-900 border border-yellow-700 p-6 rounded-lg mb-6 shadow-lg animate-pulse">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-yellow-600 rounded-full flex items-center justify-center mr-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
            </div>
            <div>
              <p className="text-lg font-medium text-yellow-300">
                Incoming Call
              </p>
              <p className="text-yellow-100 text-xl font-bold">
                Client ID: {otherPartyId}
              </p>
            </div>
          </div>
          <div className="flex space-x-4 mt-4">
            <button
              onClick={() =>
                socketRef.current.emit("accept_call", {
                  clientId: otherPartyId,
                })
              }
              className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
              Accept Call
            </button>
            <button
              onClick={() => {
                socketRef.current.emit("reject_call", {
                  clientId: otherPartyId,
                });
                setCallRequested(false);
              }}
              className="flex-1 bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
              Reject
            </button>
          </div>
        </div>
      )}

      {/* Call Connected */}
      {callConnected && (
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg mb-6">
          <div className="flex justify-between items-center mb-4">
            <p className="text-xl font-semibold flex items-center">
              <span className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></span>
              Connected to client: {otherPartyId}
            </p>
            <div className="text-gray-400 text-sm bg-gray-700 px-3 py-1 rounded-full">
              Call Duration: 00:12:34
            </div>
          </div>

          <div
            id="zego-container"
            className="w-full h-96 bg-black rounded-lg mb-6 shadow-inner flex items-center justify-center"
          >
            <div className="text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 mx-auto mb-2 text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              <p className="text-gray-500">Video feed will appear here</p>
            </div>
          </div>

          {/* Display Agent Recording */}
          {recordedAudio[user._id] && (
            <div className="bg-gray-700 p-4 rounded-lg mb-6 shadow-inner">
              <p className="font-medium text-blue-300 mb-2">Agent Recording:</p>
              <audio controls className="w-full mb-4">
                <source src={recordedAudio[user._id]} type="audio/mp3" />
              </audio>

              {agentAudioAnalyzed && (
                <div className="p-4 bg-gray-800 rounded-lg border border-gray-600">
                  <p className="font-medium text-blue-300 mb-2">
                    Agent Emotion Analysis:
                  </p>

                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-gray-300">Overall Emotion:</p>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium 
                      ${
                        agentAudioAnalyzed.overall_emotion === "Happy/Satisfied"
                          ? "bg-green-900 text-green-300"
                          : agentAudioAnalyzed.overall_emotion ===
                            "Angry/Disgust"
                          ? "bg-red-900 text-red-300"
                          : "bg-blue-900 text-blue-300"
                      }`}
                      >
                        {agentAudioAnalyzed.overall_emotion}
                      </span>
                    </div>
                  </div>

                  <div>
                    <p className="text-gray-300 mb-2">Emotion Timeline:</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {agentAudioAnalyzed &&
                        agentAudioAnalyzed.chunk_predictions &&
                        Object.entries(
                          agentAudioAnalyzed.chunk_predictions
                        ).map(([chunk, emotion], index) => (
                          <div
                            key={index}
                            className={`p-2 rounded text-sm 
                        ${
                          emotion === "Happy/Satisfied"
                            ? "bg-green-900 text-green-300"
                            : emotion === "Angry/Disgust"
                            ? "bg-red-900 text-red-300"
                            : "bg-gray-700 text-gray-300"
                        }`}
                          >
                            <span className="font-medium">
                              Chunk {chunk.split("_").pop().split(".")[0]}:
                            </span>{" "}
                            {emotion}
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Display Room Recording */}
          {roomAudio && (
            <div className="bg-gray-700 p-4 rounded-lg mb-6 shadow-inner">
              <p className="font-medium text-blue-300 mb-2">
                Room Recording (Both Agent & Client):
              </p>
              <audio controls className="w-full">
                <source src={roomAudio} type="audio/mp3" />
              </audio>
            </div>
          )}

          {/* Display Client Emotion Analysis */}
          {clientAudioAnalyzed && (
            <div className="bg-gray-700 p-4 rounded-lg shadow-inner">
              <p className="font-medium text-blue-300 mb-4">
                Client Emotion Analysis:
              </p>

              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-gray-300">Overall Emotion:</p>
                  <span
                    className={`px-4 py-2 rounded-full text-sm font-medium 
                  ${
                    clientAudioAnalyzed.overall_emotion === "Happy/Satisfied"
                      ? "bg-green-900 text-green-300"
                      : clientAudioAnalyzed.overall_emotion === "Angry/Disgust"
                      ? "bg-red-900 text-red-300"
                      : "bg-blue-900 text-blue-300"
                  }`}
                  >
                    {clientAudioAnalyzed.overall_emotion}
                  </span>
                </div>

                <div className="w-full bg-gray-800 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full 
                  ${
                    clientAudioAnalyzed.overall_emotion === "Happy/Satisfied"
                      ? "bg-green-500"
                      : clientAudioAnalyzed.overall_emotion === "Angry/Disgust"
                      ? "bg-red-500"
                      : "bg-blue-500"
                  }`}
                    style={{ width: "75%" }}
                  ></div>
                </div>
              </div>

              <div>
                <p className="text-gray-300 mb-2">Emotion Timeline:</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {clientAudioAnalyzed &&
                    clientAudioAnalyzed.chunk_predictions &&
                    Object.entries(clientAudioAnalyzed.chunk_predictions).map(
                      ([chunk, emotion], index) => (
                        <div
                          key={index}
                          className={`p-3 rounded-lg text-sm 
                    ${
                      emotion === "Happy/Satisfied"
                        ? "bg-green-900 text-green-300 border border-green-700"
                        : emotion === "Angry/Disgust"
                        ? "bg-red-900 text-red-300 border border-red-700"
                        : "bg-gray-700 text-gray-300 border border-gray-600"
                    }`}
                        >
                          <span className="font-medium block mb-1">
                            Chunk {chunk.split("_").pop().split(".")[0]}
                          </span>
                          <span>{emotion}</span>
                        </div>
                      )
                    )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Schedule Follow-up UI - shown after call ends */}
      {callEnded && !showScheduler && (
        <div className="mt-6 bg-gray-800 p-6 rounded-lg shadow-lg text-center">
          <p className="text-xl mb-4">
            Call with client {otherPartyId} has ended
          </p>
          <button
            onClick={() => setShowScheduler(true)}
            className="bg-green-600 text-white py-3 px-8 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center mx-auto"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                clipRule="evenodd"
              />
            </svg>
            Schedule Follow-up
          </button>
        </div>
      )}

      {/* Scheduler with Date Picker */}
      {showScheduler && (
        <div className="mt-6 p-6 bg-gray-800 rounded-lg shadow-lg border border-gray-700">
          <h3 className="text-2xl font-semibold mb-6 text-blue-300">
            Schedule Follow-up Call
          </h3>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 text-gray-300">
              Select Date and Time:
            </label>
            <DatePicker
              selected={scheduleDate}
              onChange={(date) => setScheduleDate(date)}
              showTimeSelect
              dateFormat="MMMM d, yyyy h:mm aa"
              minDate={new Date()}
              className="p-3 rounded-lg w-full text-black bg-gray-100 border-0"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={scheduleFollowUp}
              disabled={scheduling}
              className={`bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium ${
                scheduling ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {scheduling ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Scheduling...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Schedule Follow-up
                </span>
              )}
            </button>

            <button
              onClick={() => setShowScheduler(false)}
              className="bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AgentCallingPage;
