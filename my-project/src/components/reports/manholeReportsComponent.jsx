import React, { useState, useEffect, useMemo } from "react";


export const ManholeReportsComponent = ({ city, division, section }) => {
  const [reportData, setReportData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [appliedDateRange, setAppliedDateRange] = useState({ from: "", to: "" });

  useEffect(() => {
    setIsLoading(true);

    fetch("/datafiles/CSVs/ManHoles_Data.csv")
      .then((response) =>
        response.ok ? response.text() : Promise.reject("Network error")
      )
      .then((text) => {
        const rows = text.trim().split("\n").filter(Boolean);
        if (rows.length < 2) {
          setReportData([]);
          return;
        }

        // ✅ comma-separated CSV
        const headers = rows[0].split(",").map((h) => h.trim());

        const parsedData = rows.slice(1).map((row) => {
          const values = row.split(",").map((v) => v.trim());
          return headers.reduce((obj, header, i) => {
            obj[header] = values[i] || "";
            return obj;
          }, {});
        });

        console.log("CSV Sample:", parsedData.slice(0, 3));
        console.log("Props received:", { city, division, section });

        // ✅ robust filtering: trim + lowercase
        const filtered = parsedData.filter(
          (item) =>
            item.City?.trim().toLowerCase() === city?.trim().toLowerCase() &&
            item.Division?.trim().toLowerCase() === division?.trim().toLowerCase() &&
            item.Section?.trim().toLowerCase() === section?.trim().toLowerCase()
        );

        console.log("Filtered data:", filtered);

        setReportData(filtered);
      })
      .catch((error) => console.error("Error parsing or fetching CSV:", error))
      .finally(() => setIsLoading(false));
  }, [city, division, section]);

  const handleApplyFilter = () => {
    setAppliedDateRange(dateRange);
  };

  const zoneWiseReports = useMemo(() => {
    const dateFiltered = reportData.filter((item) => {
      if (!appliedDateRange.from || !appliedDateRange.to) return true;
      return (
        new Date(item.last_operation_date) >= new Date(appliedDateRange.from) &&
        new Date(item.last_operation_date) <= new Date(appliedDateRange.to)
      );
    });

    const grouped = dateFiltered.reduce((acc, item) => {
      const zone = item.Zone?.trim();
      if (zone) {
        if (!acc[zone]) acc[zone] = { name: `${zone} Zone Report`, count: 0 };
        acc[zone].count += 1;
      }
      return acc;
    }, {});

    // ✅ sort zones alphabetically
    return Object.values(grouped).sort((a, b) => a.name.localeCompare(b.name));
  }, [reportData, appliedDateRange]);

  if (isLoading) {
    return <p className="text-center text-gray-500 py-8">Loading reports...</p>;
  }

  return (
    <div>
      {/* Date Filter */}
      <div className="flex flex-wrap items-end gap-4 my-6">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">From</label>
          <input
            type="date"
            value={dateRange.from}
            onChange={(e) => setDateRange((p) => ({ ...p, from: e.target.value }))}
            className="h-10 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#1A8BA8]"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">To</label>
          <input
            type="date"
            value={dateRange.to}
            onChange={(e) => setDateRange((p) => ({ ...p, to: e.target.value }))}
            className="h-10 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#1A8BA8]"
          />
        </div>
        <button
          onClick={handleApplyFilter}
          className="h-10 px-6 text-sm font-semibold text-white bg-[#1A8BA8] rounded-md hover:bg-[#15728a]"
        >
          Apply Filter
        </button>
      </div>

      {/* Zone Reports */}
      <div className="space-y-3">
        {zoneWiseReports.length > 0 ? (
          zoneWiseReports.map((report, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-white border rounded-lg shadow-sm"
            >
              <div className="flex items-center gap-4">
               
                <div>
                  <p className="font-semibold text-gray-800">{report.name}</p>
                  <p className="text-sm text-gray-500">{`${report.count} Manholes`}</p>
                </div>
              </div>
              <button className="px-5 py-2 font-semibold text-[#1A8BA8] bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100">
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
