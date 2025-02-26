import React, { useContext, useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import { BACKEND_URL_GENERAL, BACKEND_URL } from "../constant";
import { UserContext } from "../context/userContext";

const APP_ID = 1732474976;
const SERVER_SECRET = "1359f8ebc4b18686a67903a028ec194a";

function CallingPage() {
  const [isAgent, setIsAgent] = useState(false);
  const [callRequested, setCallRequested] = useState(false);
  const [otherPartyId, setOtherPartyId] = useState(null);
  const [callConnected, setCallConnected] = useState(false);
  const [roomId, setRoomId] = useState(null);
  const [recordedAudio, setRecordedAudio] = useState({});
  const socketRef = useRef(null);
  const mediaRecorderRef = useRef({});
  const audioChunksRef = useRef({});
  const { user } = useContext(UserContext);
  const [agentAudioAnalyzed, setAgentAudioAnalyzed] = useState("");
  const [clientAudioAnalyzed, setClientAudioAnalyzed] = useState("");

  useEffect(() => {
    setIsAgent(user.role == "Agent" ? true : false);
  }, []);

  useEffect(() => {
    socketRef.current = io(BACKEND_URL_GENERAL, { transports: ["websocket"] });

    if (isAgent) {
      socketRef.current.emit("register_agent");
    } else {
      socketRef.current.emit("register_client");
      setRoomId(socketRef.current.id);
    }

    socketRef.current.on("call_request", (data) => {
      setCallRequested(true);
      setOtherPartyId(data.clientId);
      setRoomId(data.roomId);
    });

    socketRef.current.on("call_accepted", (data) => {
      setCallConnected(true);
      setOtherPartyId(data.agentId || data.clientId);
      setRoomId(data.roomId);
    });

    socketRef.current.on("no_agents_available", () => {
      alert("No agents available at the moment.");
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [isAgent]);

  console.log("SOCKET ", socketRef.current);

  // ✅ Start Zego Call & Handle Recording
  const startZegoCall = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });

      const userID = isAgent
        ? `agent_${otherPartyId}`
        : `client_${otherPartyId}`;
      const userName = isAgent ? "Agent" : "Client";

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
          },

          onLeaveRoom: () => {
            stopRecording(user._id);
          },
        });
      }, 2000);
    } catch (error) {
      console.error("Error starting Zego call:", error);
    }
  };

  // ✅ Start Recording
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

          if (isAgent) {
            const clientData = await fetch(
              `${BACKEND_URL}/call/get-client-record/${roomId}`,
              {
                method: "GET",
              }
            );

            await analyzeEmotion(audioFile, "AGENT");

            if (clientData.ok) {
              // Convert the response to a Blob
              const clientAudioBlob = await clientData.blob();

              // Create a File object from the Blob
              const clientAudioFile = new File(
                [clientAudioBlob],
                `client_recording.mp3`,
                {
                  type: "audio/mp3",
                }
              );
              await analyzeEmotion(clientAudioFile, "CLIENT");
            }
          }

          setRecordedAudio((prev) => ({
            ...prev,
            [userId]: URL.createObjectURL(audioBlob),
          }));

          await uploadAudio(userId, audioFile, isAgent);
        };

        mediaRecorder.start();
      })
      .catch((error) =>
        console.error("Error starting audio recording:", error)
      );
  };

  // ✅ Stop Recording
  const stopRecording = (userId) => {
    if (
      mediaRecorderRef.current[userId] &&
      mediaRecorderRef.current[userId].state === "recording"
    ) {
      mediaRecorderRef.current[userId].stop();
    }
  };

  // ✅ Upload Audio to Backend
  const uploadAudio = async (userId, audioFile, isAgent) => {
    try {
      const formData = new FormData();
      formData.append("audio", audioFile);
      formData.append("userId", userId);
      formData.append("isAgent", isAgent);
      formData.append("roomId", roomId); // ✅ Include roomId

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

  // ✅ Analyze Emotion API Call
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
    } catch (error) {
      console.error(`Error analyzing ${role} emotion:`, error);
    }
  };

  // ✅ Download Recorded Audio
  const downloadAudio = (userId) => {
    const audioUrl = recordedAudio[userId];
    if (audioUrl) {
      const link = document.createElement("a");
      link.href = audioUrl;
      link.download = `${userId}_recorded_audio.mp3`;
      link.click();
    }
  };

  useEffect(() => {
    if (callConnected) {
      startZegoCall();
    }
  }, [callConnected]);

  return (
    <div className="w-screen min-h-screen bg-black text-white mx-auto p-6 ">
      {user && <h1>{user.name}</h1>}
      <h1 className="text-2xl font-semibold mb-4">
        {isAgent ? "Agent" : "Client"} View
      </h1>

      {/* Request Call Button */}
      {!isAgent && !callConnected && (
        <button
          onClick={() => {
            console.log("CLICKED");
            socketRef.current.emit("request_call");
          }}
          className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 mb-4"
        >
          Request Call
        </button>
      )}

      {/* Incoming Call UI */}
      {isAgent && callRequested && (
        <div className="bg-yellow-100 p-4 rounded-md mb-4">
          <p className="text-lg font-medium">
            Incoming call from: {otherPartyId}
          </p>
          <div className="flex space-x-4 mt-2">
            <button
              onClick={() =>
                socketRef.current.emit("accept_call", {
                  clientId: otherPartyId,
                })
              }
              className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
            >
              Accept
            </button>
            <button
              onClick={() => {
                socketRef.current.emit("reject_call", {
                  clientId: otherPartyId,
                });
                setCallRequested(false);
              }}
              className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
            >
              Reject
            </button>
          </div>
        </div>
      )}

      {/* Call Connected */}
      {callConnected && (
        <div>
          <p className="text-lg font-semibold mb-2">
            Connected to: {otherPartyId}
          </p>
          <div
            id="zego-container"
            className="w-full h-96 bg-gray-200 rounded-lg mb-4"
          ></div>

          {/* Display and Download Agent Recording */}
          {recordedAudio[`agent_${otherPartyId}`] && (
            <div className="bg-gray-100 p-4 rounded-lg mb-4">
              <p className="font-medium">Agent Recording:</p>
              <audio controls className="w-full">
                <source
                  src={recordedAudio[`agent_${otherPartyId}`]}
                  type="audio/mp3"
                />
              </audio>
              <button
                onClick={() => downloadAudio(`agent_${otherPartyId}`)}
                className="mt-2 bg-indigo-500 text-white py-2 px-4 rounded hover:bg-indigo-600"
              >
                Download Agent Audio
              </button>
            </div>
          )}

          {/* Display and Download Client Recording */}
          {recordedAudio[`client_${otherPartyId}`] && (
            <div className="bg-gray-100 p-4 rounded-lg mb-4">
              <p className="font-medium">Client Recording:</p>
              <audio controls className="w-full">
                <source
                  src={recordedAudio[`client_${otherPartyId}`]}
                  type="audio/mp3"
                />
              </audio>
              <button
                onClick={() => downloadAudio(`client_${otherPartyId}`)}
                className="mt-2 bg-indigo-500 text-white py-2 px-4 rounded hover:bg-indigo-600"
              >
                Download Client Audio
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default CallingPage;
