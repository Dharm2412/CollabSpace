import React from "react";

const CallPopup = ({ type, caller, responses, isVideo, onAccept, onDecline, onCancel, show }) => {
  if (!show) return null;

  if (type === "incoming") {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-lg font-semibold">
            Incoming {isVideo ? "Video" : "Audio"} Call
          </h2>
          <p className="mt-2">From: {caller}</p>
          <div className="mt-4 flex justify-center gap-4">
            <button
              onClick={onAccept}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Accept
            </button>
            <button
              onClick={onDecline}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Decline
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-lg font-semibold">
          Outgoing {isVideo ? "Video" : "Audio"} Call
        </h2>
        <p className="mt-2">Waiting for participants to join...</p>
        {responses && (
          <div className="mt-2">
            {Array.from(responses).map(([user, { status }]) => (
              <div key={user} className="flex items-center gap-2">
                <span>{user}:</span>
                <span className={
                  status === 'accepted' ? 'text-green-600' : 
                  status === 'declined' ? 'text-red-600' : 
                  'text-yellow-600'
                }>
                  {status === 'accepted' ? 'Joined' : 
                   status === 'declined' ? 'Declined' : 
                   'Waiting...'}
                </span>
              </div>
            ))}
          </div>
        )}
        <div className="mt-4 flex justify-center">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default CallPopup;


