import React, { useState } from 'react';
import IconsData from '../../data/iconsdata';
import { ManholeReportPopup } from './ManholeReportPopup';

// Helper to format date range
const formatDateRange = (dateRange) => {
  if (!dateRange || (!dateRange.from && !dateRange.to)) return 'N/A';
  const from = dateRange.from ? new Date(dateRange.from).toLocaleDateString('en-GB') : '...';
  const to = dateRange.to ? new Date(dateRange.to).toLocaleDateString('en-GB') : '...';
  return `${from} - ${to}`;
};

export const ZoneWiseManholeReports = ({ zone, filteredData, userInputs, onBack }) => {
  const [selectedManholes, setSelectedManholes] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [reportData, setReportData] = useState(null); // 👈 store backend data
  const [showPopup, setShowPopup] = useState(false); // 👈 controls popup visibility

  const handleCheckboxChange = (id) => {
    setSelectedManholes((prev) =>
      prev.includes(id) ? prev.filter((mid) => mid !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (!selectAll) {
      const allIds = filteredData.map((m) => m.id);
      setSelectedManholes(allIds);
    } else {
      setSelectedManholes([]);
    }
    setSelectAll(!selectAll);
  };

  const handleViewReport = async () => {
    if (selectedManholes.length === 0) {
      alert("Please select at least one manhole.");
      return;
    }

    setIsLoading(true);
    const payload = {
      selectedManholes,
      userInputs,
      zone,
      formatDateRange,
      command: "generate_manhole_report",
    };

    try {
      const response = await fetch("http://10.188.1.28:5001/api/analyze/manhole", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error(`Server error: ${response.status}`);
      const data = await response.json();
      console.log("Backend response:", data);

      // ✅ Save and show popup
      setReportData(data);
      setShowPopup(true);
    } catch (error) {
      console.error("Error sending data:", error);
      alert("Failed to fetch report data. Check console for details.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Popup shown when data is ready */}
      {showPopup && reportData && (
        <ManholeReportPopup
          reportData={reportData}
          onClose={() => setShowPopup(false)}
        />
      )}

      {/* Main UI */}
      <div className="bg-white rounded-lg mx-[20px] p-[24px] border-[1.5px] border-[#E1E7EF] sm:p-6 max-h-[550px] h-[550px] overflow-y-auto">
        <div className="flex items-center justify-between mb-4 pb-4">
          <div className='flex gap-[20px] items-center'>
            <button
              onClick={onBack}
              className="flex items-center justify-center border-[1.5px] h-[30px] w-[30px] border-[#1E9AB0] rounded-full hover:bg-[#E5F7FA] transition-colors"
            >
              {IconsData.BackArrowIcon}
            </button>

            <div className='flex flex-col gap-[4px]'>
              <h3 className="text-[20px] font-semibold text-gray-800">{zone} - Select Manholes</h3>
              <label className="inline-flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                  className="h-4 w-4 text-[15px] rounded border-gray-300 focus:ring-[#1E9AB0] accent-[#1E9AB0]"
                />
                Select All
              </label>
            </div>
          </div>

          <div className='flex items-center gap-x-[45px]'>
            <p className="text-sm text-gray-700 font-medium">
              {selectedManholes.length} of {filteredData.length} selected
            </p>
            <button
              onClick={handleViewReport}
              disabled={isLoading}
              className={`px-8 py-3 text-white font-semibold rounded-lg shadow-md transition-colors bg-[#1E9AB0] cursor-pointer ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              {isLoading ? "Generating..." : "View Selected Report"}
            </button>
          </div>
        </div>

        {/* Manhole Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {filteredData.map((manhole) => (
            <label
              key={manhole.id}
              className="flex items-center gap-2 px-[15px] py-[15px] rounded-[7px] cursor-pointer bg-[#F9FAFB]"
            >
              <input
                type="checkbox"
                checked={selectedManholes.includes(manhole.id)}
                onChange={() => handleCheckboxChange(manhole.id)}
                className="h-4 w-4 rounded border-[#1E9AB0] accent-[#1E9AB0]"
              />
              <span className="text-sm font-medium text-gray-800">{manhole.id}</span>
            </label>
          ))}
        </div>
      </div>
    </>
  );
};
