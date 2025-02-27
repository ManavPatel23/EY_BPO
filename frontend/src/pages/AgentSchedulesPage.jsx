import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { format } from "date-fns";
import { UserContext } from "@/context/userContext";
import { BACKEND_URL } from "@/constant";

const AgentSchedulesPage = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useContext(UserContext);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const agentId = user._id;

        const response = await axios.get(
          `${BACKEND_URL}/call/schedules/agent/${agentId}`
        );
        setSchedules(response.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch schedules. Please try again later.");
        setLoading(false);
        console.error("Error fetching schedules:", err);
      }
    };

    fetchSchedules();
  }, []);

  // Open modal with selected schedule details
  const openScheduleDetails = (scheduleId) => {
    const schedule = schedules.find((s) => s._id === scheduleId);
    if (schedule) {
      setSelectedSchedule(schedule);
      setShowModal(true);
    }
  };

  // Group schedules by date
  const groupedSchedules = schedules.reduce((groups, schedule) => {
    const date = format(new Date(schedule.scheduleDate), "yyyy-MM-dd");
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(schedule);
    return groups;
  }, {});

  // Sort dates in ascending order
  const sortedDates = Object.keys(groupedSchedules).sort(
    (a, b) => new Date(a) - new Date(b)
  );

  // For each date, sort schedules by priorityScore in descending order
  sortedDates.forEach((date) => {
    groupedSchedules[date].sort((a, b) => b.priorityScore - a.priorityScore);
  });

  const closeModal = () => {
    setShowModal(false);
    setSelectedSchedule(null);
  };

  if (loading)
    return <div className="text-center p-6">Loading schedules...</div>;
  if (error) return <div className="text-center p-6 text-red-500">{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">My Schedules</h1>

      {sortedDates.length === 0 ? (
        <div className="text-center p-6">No schedules found.</div>
      ) : (
        sortedDates.map((date) => (
          <div key={date} className="mb-8">
            <h2 className="text-xl font-semibold mb-4 bg-gray-100 p-2 rounded">
              {format(new Date(date), "MMMM d, yyyy")}
            </h2>
            <div className="space-y-4">
              {groupedSchedules[date].map((schedule) => (
                <div
                  key={schedule._id}
                  className="border rounded p-4 shadow-sm hover:shadow-md transition"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">
                        Time:{" "}
                        {format(new Date(schedule.scheduleDate), "h:mm a")}
                      </p>
                      <p>Priority Score: {schedule.priorityScore}</p>
                      <p className="mt-2">
                        Client Query:{" "}
                        {schedule.summaryOfClientQuery ||
                          "No summary available"}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                        onClick={() => openScheduleDetails(schedule._id)}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                  {schedule.summary && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-sm text-gray-700">
                        {schedule.summary}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      {/* Modal for Schedule Details */}
      {showModal && selectedSchedule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Schedule Details</h2>
              <button
                onClick={closeModal}
                className="text-gray-600 hover:text-gray-800"
              >
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="border-b pb-4 mb-4">
              <p className="font-medium text-lg">
                Date & Time:{" "}
                {format(
                  new Date(selectedSchedule.scheduleDate),
                  "MMMM d, yyyy 'at' h:mm a"
                )}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="border rounded p-4">
                <h3 className="font-bold text-lg mb-2">Client Information</h3>
                {selectedSchedule.clientId ? (
                  <div>
                    <p>
                      <span className="font-medium">Name:</span>{" "}
                      {selectedSchedule.clientId.name}
                    </p>
                    <p>
                      <span className="font-medium">Email:</span>{" "}
                      {selectedSchedule.clientId.email}
                    </p>
                  </div>
                ) : (
                  <p>Client information not available</p>
                )}
              </div>

              <div className="border rounded p-4">
                <h3 className="font-bold text-lg mb-2">Agent Information</h3>
                {selectedSchedule.agentId ? (
                  <div>
                    <p>
                      <span className="font-medium">Name:</span>{" "}
                      {selectedSchedule.agentId.name}
                    </p>
                    <p>
                      <span className="font-medium">Email:</span>{" "}
                      {selectedSchedule.agentId.email}
                    </p>
                  </div>
                ) : (
                  <p>Agent information not available</p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-bold">Priority Score</h3>
                <p>{selectedSchedule.priorityScore}</p>
              </div>

              {selectedSchedule.summaryOfClientQuery && (
                <div>
                  <h3 className="font-bold">Client Query</h3>
                  <p>{selectedSchedule.summaryOfClientQuery}</p>
                </div>
              )}

              {selectedSchedule.summary && (
                <div>
                  <h3 className="font-bold">Summary</h3>
                  <p>{selectedSchedule.summary}</p>
                </div>
              )}

              {selectedSchedule.howAgentHandled && (
                <div>
                  <h3 className="font-bold">How Agent Handled</h3>
                  <p>{selectedSchedule.howAgentHandled}</p>
                </div>
              )}

              {selectedSchedule.roomCallAudio && (
                <div>
                  <h3 className="font-bold">Call Audio</h3>
                  <audio controls className="mt-2 w-full">
                    <source
                      src={selectedSchedule.roomCallAudio}
                      type="audio/mpeg"
                    />
                    Your browser does not support the audio element.
                  </audio>
                </div>
              )}
            </div>

            {selectedSchedule.transcript && (
              <div className="mt-6">
                <h3 className="font-bold mb-2">Transcript</h3>
                <div className="border p-4 bg-gray-50 rounded max-h-64 overflow-y-auto">
                  <pre className="whitespace-pre-wrap">
                    {selectedSchedule.transcript}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentSchedulesPage;
