import React, { useContext, useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import { BACKEND_URL_GENERAL, BACKEND_URL } from "../constant";
import { UserContext } from "../context/userContext";

const APP_ID = 1186325956;
const SERVER_SECRET = "13b5c5fa6c8480498890b55f7a13bd52";

function UserCallingPage() {
  const [otherPartyId, setOtherPartyId] = useState(null);
  const [callConnected, setCallConnected] = useState(false);
  const [roomId, setRoomId] = useState(null);
  const [recordedAudio, setRecordedAudio] = useState({});
  const socketRef = useRef(null);
  const mediaRecorderRef = useRef({});
  const audioChunksRef = useRef({});
  const { user } = useContext(UserContext);

  useEffect(() => {
    socketRef.current = io(BACKEND_URL_GENERAL, { transports: ["websocket"] });
    socketRef.current.emit("register_client");
    setRoomId(socketRef.current.id);

    socketRef.current.on("call_accepted", (data) => {
      setCallConnected(true);
      setOtherPartyId(data.agentId);
      setRoomId(data.roomId);
    });

    socketRef.current.on("no_agents_available", () => {
      alert("No agents available at the moment.");
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  // Start Zego Call & Handle Recording
  const startZegoCall = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });

      const userID = `client_${otherPartyId}`;
      const userName = "Client";

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

  // Start Recording
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

          setRecordedAudio((prev) => ({
            ...prev,
            [userId]: URL.createObjectURL(audioBlob),
          }));

          await uploadAudio(userId, audioFile, false);
        };

        mediaRecorder.start();
      })
      .catch((error) =>
        console.error("Error starting audio recording:", error)
      );
  };

  // Stop Recording
  const stopRecording = (userId) => {
    if (
      mediaRecorderRef.current[userId] &&
      mediaRecorderRef.current[userId].state === "recording"
    ) {
      mediaRecorderRef.current[userId].stop();
    }
  };

  // Upload Audio to Backend
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

  // Download Recorded Audio
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
      <h1 className="text-2xl font-semibold mb-4">Customer Support</h1>

      {/* Request Call Button */}
      {!callConnected && (
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

      {/* Call Connected */}
      {callConnected && (
        <div>
          <p className="text-lg font-semibold mb-2">
            Connected to agent: {otherPartyId}
          </p>
          <div
            id="zego-container"
            className="w-full h-96 bg-gray-200 rounded-lg mb-4"
          ></div>

          {/* Display and Download Recording */}
          {recordedAudio[user._id] && (
            <div className="bg-gray-100 p-4 rounded-lg mb-4">
              <p className="font-medium text-black">Your Recording:</p>
              <audio controls className="w-full">
                <source src={recordedAudio[user._id]} type="audio/mp3" />
              </audio>
              <button
                onClick={() => downloadAudio(user._id)}
                className="mt-2 bg-indigo-500 text-white py-2 px-4 rounded hover:bg-indigo-600"
              >
                Download Audio
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default UserCallingPage;
