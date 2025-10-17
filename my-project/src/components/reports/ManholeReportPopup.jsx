import React from "react";

export const ManholeReportPopup = ({ reportData, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white w-[80%] max-w-3xl rounded-lg shadow-xl p-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-600 hover:text-gray-800"
        >
          ✕
        </button>

        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          📊 Manhole Report Data
        </h2>

        {/* Display backend data */}
        <div className="overflow-y-auto max-h-[400px]">
          <pre className="bg-gray-100 rounded-lg p-4 text-sm text-gray-800 whitespace-pre-wrap">
            {JSON.stringify(reportData, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};
