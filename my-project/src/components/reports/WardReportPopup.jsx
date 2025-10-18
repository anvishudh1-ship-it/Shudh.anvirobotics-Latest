import React from 'react';

export const WardReportPopup = ({ reportData, onClose }) => {
  // Function to trigger the browser's print dialog
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      {/* The @media print styles hide the popup's own container when printing */}
      <style>
        {`
          @media print {
            body > *:not(.printable-area) {
              display: none;
            }
            .no-print {
              display: none;
            }
            .printable-area {
              display: block;
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
            }
          }
        `}
      </style>

      <div className="bg-white w-full max-w-3xl rounded-lg shadow-xl relative printable-area">
        <div className="p-6">
          {/* --- Header & Close Button --- */}
          <div className="flex justify-between items-center mb-4 pb-4 border-b no-print">
            <h2 className="text-2xl font-bold text-gray-800">
              📄 Ward Report
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-900 text-2xl"
              title="Close"
            >
              &times;
            </button>
          </div>

          {/* --- Display Backend Data --- */}
          <div className="overflow-y-auto max-h-[60vh]">
            <pre className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap font-mono">
              {JSON.stringify(reportData, null, 2)}
            </pre>
          </div>

          {/* --- Action Buttons --- */}
          <div className="flex justify-end pt-4 mt-4 border-t no-print">
            <button
              onClick={handlePrint}
              className="px-6 py-2 bg-[#1E9AB0] text-white font-semibold rounded-lg hover:bg-[#187A8A] transition-colors"
            >
              Print Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};