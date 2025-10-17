import React, { useState, useEffect, useMemo, useCallback } from "react";

// SVG icon for the document
const DocumentIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-8 h-8 text-[#1A8BA8]"
    >
        <path
            fillRule="evenodd"
            d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0016.5 9h-1.875a.375.375 0 01-.375-.375V6.75A3.75 3.75 0 009 3h-.375c-1.036 0-1.875.84-1.875 1.875v1.5c0 .414.336.75.75.75h3a.75.75 0 00.75-.75v-1.5A1.875 1.875 0 0111.625 3h1.875a2.25 2.25 0 012.25 2.25v1.875c0 .414.336.75.75.75h1.875a2.25 2.25 0 012.25 2.25v9.375a.375.375 0 01-.375.375H5.625a.375.375 0 01-.375-.375V3.375c0-.414.336-.75.75-.75h.375a.75.75 0 000-1.5H5.625z"
            clipRule="evenodd"
        />
    </svg>
);

export const ManholeReportsComponent = ({ city, division, section }) => {
    const [reportData, setReportData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [dateRange, setDateRange] = useState({ from: "", to: "" });
    const [appliedDateRange, setAppliedDateRange] = useState({ from: "", to: "" });

    useEffect(() => {
        setIsLoading(true);
        fetch("/datafiles/CSVs/ManHoles_Data.csv")
            .then((response) => (response.ok ? response.text() : Promise.reject("Network error")))
            .then((text) => {
                const rows = text.trim().split("\n").filter(Boolean);
                if (rows.length < 2) {
                    setReportData([]);
                    return;
                }

                // Use tab separator (TSV)
                const headers = rows[0].split("\t").map((h) => h.trim());

                const parsedData = rows.slice(1).map((row) => {
                    const values = row.split("\t").map((v) => v.trim());
                    return headers.reduce((obj, header, i) => {
                        obj[header] = values[i] || "";
                        return obj;
                    }, {});
                });

                // Filter data based on user selection
                const filtered = parsedData.filter(
                    (item) =>
                        item.Division === division &&
                        item.Section === section &&
                        item.City === city
                );

                setReportData(filtered);
            })
            .catch((error) => console.error("Error parsing or fetching CSV:", error))
            .finally(() => setIsLoading(false));
    }, [city, division, section]);

    const handleApplyFilter = () => {
        setAppliedDateRange(dateRange);
    };

    const zoneWiseReports = useCallback(() => {
        const dateFiltered = reportData.filter((item) => {
            if (!appliedDateRange.from || !appliedDateRange.to) return true;
            return (
                new Date(item.last_operation_date) >= new Date(appliedDateRange.from) &&
                new Date(item.last_operation_date) <= new Date(appliedDateRange.to)
            );
        });

        // Group by Zone and count
        const grouped = dateFiltered.reduce((acc, item) => {
            const zone = item.Zone?.trim();
            if (zone) {
                if (!acc[zone]) {
                    acc[zone] = { name: zone, count: 0 };
                }
                acc[zone].count += 1;
            }
            return acc;
        }, {});

        // ✅ Sort zones alphabetically
        return Object.values(grouped).sort((a, b) => a.name.localeCompare(b.name));
    }, [reportData, appliedDateRange]);

    if (isLoading) {
        return <p className="text-center text-gray-500 py-8">Loading reports...</p>;
    }

    return (
        <div>
            {/* --- Date Filter --- */}
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
                    Apply Filters
                </button>
            </div>

            {/* --- Zone Reports --- */}
            <div className="space-y-3">
                {zoneWiseReports.length > 0 ? (
                    zoneWiseReports.map((report, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-between p-4 bg-white border rounded-lg shadow-sm"
                        >
                            <div className="flex items-center gap-4">
                                <DocumentIcon />
                                <div>
                                    <p className="font-semibold text-gray-800">
                                        {report.name} Zone Report
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {report.count} Manholes
                                    </p>
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
