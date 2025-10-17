import React, { useState, useEffect, useMemo } from "react";
import IconsData from "../../data/iconsdata"; 
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ZoneWiseManholeReports } from "./ZoneWiseManholeReports";

export const ManholeReportsComponent = ({ city, division, section }) => {
  const [reportData, setReportData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [appliedDateRange, setAppliedDateRange] = useState({ from: "", to: "" });

  // State to hold selected zone
  const [selectedZoneData, setSelectedZoneData] = useState(null);

  useEffect(() => {
    setIsLoading(true);

    fetch("/datafiles/CSVs/ManHoles_Data.csv")
      .then((response) =>
        response.ok ? response.text() : Promise.reject("Network error")
      )
      .then((text) => {
        const rows = text.trim().split("\n").filter(Boolean);
        if (rows.length < 2) { setReportData([]); return; }

        const headers = rows[0].split(",").map((h) => h.trim());

        const parsedData = rows.slice(1).map((row) => {
          const values = row.split(",").map((v) => v.trim());
          return headers.reduce((obj, header, i) => {
            obj[header] = values[i] || "";
            return obj;
          }, {});
        });

        const filtered = parsedData.filter(
          (item) =>
            item.City?.trim().toLowerCase() === city?.trim().toLowerCase() &&
            item.Division?.trim().toLowerCase() === division?.trim().toLowerCase() &&
            item.Section?.trim().toLowerCase() === section?.trim().toLowerCase()
        );

        setReportData(filtered);
      })
      .catch((error) => console.error("Error parsing or fetching CSV:", error))
      .finally(() => setIsLoading(false));
  }, [city, division, section]);

  const handleApplyFilter = () => setAppliedDateRange(dateRange);

 const zoneWiseReports = useMemo(() => {
  // Convert CSV date string "DD-MM-YYYY" to JS Date
  const parseDDMMYYYY = (dateStr) => {
    if (!dateStr) return null;
    const [day, month, year] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day); // month is 0-indexed
  };

  const dateFiltered = reportData.filter((item) => {
    if (!appliedDateRange.from || !appliedDateRange.to) return true;

    const itemDate = parseDDMMYYYY(item.last_operation_date);
    const fromDate = appliedDateRange.from; // Date object from DatePicker
    const toDate = appliedDateRange.to;     // Date object from DatePicker

    if (!itemDate) return false;
    return itemDate >= fromDate && itemDate <= toDate;
  });

  const grouped = dateFiltered.reduce((acc, item) => {
    const zone = item.Zone?.trim();
    if (zone) {
      if (!acc[zone]) acc[zone] = { name: zone, count: 0 };
      acc[zone].count += 1;
    }
    return acc;
  }, {});

  return Object.values(grouped).sort((a, b) => a.name.localeCompare(b.name));
}, [reportData, appliedDateRange]);


  // ✅ Conditional render: if a zone is selected, show ZoneWiseManholeReports
  if (selectedZoneData) {
    return (
      <ZoneWiseManholeReports
        zone={selectedZoneData.zone}
        manholes={selectedZoneData.manholes}
        filteredData={selectedZoneData.filteredData}
        userInputs={selectedZoneData.userInputs}
        onBack={() => setSelectedZoneData(null)} // callback to go back
      />
    );
  }

  if (isLoading) return <p className="text-center text-gray-500 py-8">Loading reports...</p>;

  return (
    <div>
      {/* Date Filter */}
      <div className="flex flex-wrap items-end gap-4 my-6">
     
<div className="w-full md:w-auto">
  <label className="block text-xs font-medium text-gray-600 mb-1">From</label>
  <DatePicker
    selected={dateRange.from}
    onChange={(date) => setDateRange((p) => ({ ...p, from: date }))}
    placeholderText="Select From Date"
    dateFormat="dd-MM-yyyy"
    maxDate={new Date()}
    className="w-full h-10 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#1A8BA8]"
  />
</div>

<div className="w-full md:w-auto">
  <label className="block text-xs font-medium text-gray-600 mb-1">To</label>
  <DatePicker
    selected={dateRange.to}
    onChange={(date) => setDateRange((p) => ({ ...p, to: date }))}
    placeholderText="Select To Date"
    dateFormat="dd-MM-yyyy"
    maxDate={new Date()}
    className="w-full h-10 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#1A8BA8]"
  />
</div>

        <button
          onClick={handleApplyFilter}
          className="h-10 px-6 text-sm font-semibold text-white bg-[#1E9AB0] rounded-[8px]"
        >
          Apply Filter
        </button>
      </div>

      {/* Zone Reports */}
      <div className="space-y-3">
        {zoneWiseReports.length > 0 ? (
          zoneWiseReports.map((report) => (
            <div
              key={report.name}
              className="flex items-center justify-between p-[24px] bg-white border-[1.5px] border-[#E1E7EF] rounded-[16px]"
            >
              <div className="flex items-center gap-4">
                <p className="text-white p-[10px] bg-[#2777f8b2] rounded-[8px]">{IconsData.Reports}</p>
                <div>
                  <p className="font-semibold text-[16px] text-[#0F1729]">{report.name} Manholes Report</p>
                  <p className="text-sm text-gray-500">{`${report.count} Manholes`}</p>
                </div>
              </div>
              <button
                className="px-5 py-2 bg-[#F9FAFB] border-[#E1E7EF] border-[1.5px] rounded-[12px]"
                onClick={() =>
                  setSelectedZoneData({
                    zone: report.name,
                    manholes: report.count,
                    filteredData: reportData.filter((item) => item.Zone === report.name.split(" ")[0]),
                    userInputs: { city, division, section, dateRange: appliedDateRange },
                  })
                }
              >
                Open Report
              </button>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 py-8">
            No zone data available for the selected filters.
          </p>
        )}
      </div>
    </div>
  );
};
