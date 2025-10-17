// import React, { useEffect, useState } from "react";
// import IconsData from "../../data/iconsdata";

// // Placeholder for the report popup component you will create
// // import { RobotReportPopup } from './RobotReportPopup';

// // A robust, Regex-based function to parse a single CSV row
// const parseCsvRow = (row) => {
//     const values = [];
//     const regex = /(?:"([^"]*(?:""[^"]*)*)"|([^,]*))(?:,|$)/g;
//     let match;
//     while ((match = regex.exec(row))) {
//         const value = match[1] !== undefined ? match[1].replace(/""/g, '"') : match[2];
//         values.push(value);
//         if (match[0].slice(-1) !== ',') break;
//     }
//     return values;
// };

// export const RobotReportsComponent = ({ division, section, city, onBack }) => {
//     const [robots, setRobots] = useState([]);
//     const [filteredRobots, setFilteredRobots] = useState([]);
//     const [selectedRobots, setSelectedRobots] = useState([]);
//     const [selectAll, setSelectAll] = useState(false);

//     // --- States for Backend Report Generation ---
//     const [isLoading, setIsLoading] = useState(false);
//     const [reportData, setReportData] = useState(null);
//     const [showPopup, setShowPopup] = useState(false);


//     // --- Step 1: Fetch and Parse CSV (Unchanged) ---
//     useEffect(() => {
//         const fetchCSV = async () => {
//             try {
//                 const response = await fetch("/datafiles/CSVs/Robo_Operations_copy.csv");
//                 const text = await response.text();
//                 const rows = text.replace(/\r/g, "").trim().split("\n").filter(Boolean);
//                 if (rows.length < 2) return;

//                 const headers = rows[0].split(",").map((h) => h.trim());
//                 const data = rows.slice(1).map((row) => {
//                     const values = parseCsvRow(row);
//                     const obj = headers.reduce((acc, header, i) => {
//                         acc[header] = values[i] || "";
//                         return acc;
//                     }, {});
//                     return {
//                         device_id: obj.device_id,
//                         City: obj.City,
//                         Division: obj.Division,
//                         Section: obj.Section,
//                     };
//                 });
//                 setRobots(data);
//             } catch (err) {
//                 console.error("Error loading CSV:", err);
//             }
//         };
//         fetchCSV();
//     }, []);

//     // --- Step 2: Filtering Logic (Unchanged) ---
//     useEffect(() => {
//         if (!robots.length) return;
//         const normalizeForComparison = (str) => str?.toLowerCase() || "";
//         const filtered = robots.filter((robot) => {
//             const robotDivision = normalizeForComparison(robot.Division);
//             const robotSection = normalizeForComparison(robot.Section);
//             const robotCity = normalizeForComparison(robot.City);
//             const checkDivision = () => {
//                 if (!division) return true;
//                 const searchParts = normalizeForComparison(division).match(/[a-z0-9]+/g) || [];
//                 return searchParts.every(part => robotDivision.includes(part));
//             };
//             const sectionMatch = section ? robotSection.includes(normalizeForComparison(section)) : true;
//             const cityMatch = city ? robotCity.includes(normalizeForComparison(city)) : true;
//             return checkDivision() && sectionMatch && cityMatch;
//         });
//         const uniqueRobots = Array.from(new Map(filtered.map((r) => [r.device_id, r])).values());
//         setFilteredRobots(uniqueRobots);
//         setSelectedRobots([]);
//         setSelectAll(false);
//     }, [robots, division, section, city]);

//     // --- Step 3: Selection Logic (Unchanged) ---
//     const handleCheckboxChange = (device_id) => {
//         setSelectedRobots((prev) =>
//             prev.includes(device_id) ? prev.filter((id) => id !== device_id) : [...prev, device_id]
//         );
//     };

//     const handleSelectAll = () => {
//         if (!selectAll) setSelectedRobots(filteredRobots.map((r) => r.device_id));
//         else setSelectedRobots([]);
//         setSelectAll(!selectAll);
//     };

//     // --- Step 4: Backend API Call ---
//     const handleViewReport = async () => {
//         if (selectedRobots.length === 0) {
//             alert("Please select at least one robot.");
//             return;
//         }

//         setIsLoading(true);
//         const payload = {
//             selectedRobots,
//             division,
//             section,
//             city,
//             command: "generate_robot_report", // Command for the backend
//         };
//         console.log("sending to backend",payload)
//         try {
//             // IMPORTANT: Update this URL to your actual robot analysis endpoint
//             const response = await fetch("http://10.188.1.28:5001/api/analyze/robot", {
//                 method: "POST",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify(payload),
//             });

//             if (!response.ok) throw new Error(`Server error: ${response.status}`);
//             const data = await response.json();
//             console.log("Backend response:", data);

//             setReportData(data);
//             setShowPopup(true); // Show the popup with the report data

//         } catch (error) {
//             console.error("Error fetching report data:", error);
//             alert("Failed to fetch report data. Check console for details.");
//         } finally {
//             setIsLoading(false);
//         }
//     };


//     return (
//         <>
//             {/* Render the popup when showPopup is true and reportData is available */}
//             {/* You will need to create this RobotReportPopup component */}
//             {/*
//             {showPopup && reportData && (
//                 <RobotReportPopup
//                     reportData={reportData}
//                     onClose={() => setShowPopup(false)}
//                 />
//             )}
//             */}

//             <div className="bg-white rounded-lg mx-[20px] p-[24px] border-[1.5px] border-[#E1E7EF] sm:p-6 max-h-[550px] h-[550px] overflow-y-auto">
//                 <div className="flex items-center justify-between mb-4 pb-4">
//                     <div className="flex gap-[20px] items-center">
//                         <button onClick={onBack} className="flex items-center justify-center border-[1.5px] h-[30px] w-[30px] border-[#1E9AB0] rounded-full hover:bg-[#E5F7FA] transition-colors">{IconsData.BackArrowIcon}</button>
//                         <div className="flex flex-col gap-[4px]">
//                             <h3 className="text-[20px] font-semibold text-gray-800">{section || division} - Select Robots</h3>
//                             <label className="inline-flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700">
//                                 <input type="checkbox" checked={selectAll} onChange={handleSelectAll} className="h-4 w-4 text-[15px] rounded border-gray-300 focus:ring-[#1E9AB0] accent-[#1E9AB0]" />
//                                 Select All
//                             </label>
//                         </div>
//                     </div>

//                     {/* --- New Button and Layout --- */}
//                     <div className='flex items-center gap-x-6'>
//                         <p className="text-sm text-gray-700 font-medium">{selectedRobots.length} of {filteredRobots.length} selected</p>
//                         <button
//                             onClick={handleViewReport}
//                             disabled={isLoading}
//                             className={`px-6 py-2.5 text-white font-semibold rounded-lg shadow-md transition-colors bg-[#1E9AB0] ${isLoading ? 'opacity-60 cursor-not-allowed' : 'hover:bg-[#187A8A]'}`}
//                         >
//                             {isLoading ? "Generating..." : "View Selected Report"}
//                         </button>
//                     </div>
//                 </div>

//                 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
//                     {filteredRobots.map((robot) => (
//                         <label key={robot.device_id} className="flex items-center gap-2 px-4 py-4 rounded-lg cursor-pointer bg-[#F9FAFB]">
//                             <input type="checkbox" checked={selectedRobots.includes(robot.device_id)} onChange={() => handleCheckboxChange(robot.device_id)} className="h-4 w-4 rounded border-[#1E9AB0] accent-[#1E9AB0]" />
//                             <span className="text-sm font-medium text-gray-800">{robot.device_id}</span>
//                         </label>
//                     ))}
//                 </div>
//             </div>
//         </>
//     );
// };


import React, { useEffect, useState } from "react";
import IconsData from "../../data/iconsdata";

// Placeholder for the report popup component
// import { RobotReportPopup } from './RobotReportPopup';

const parseCsvRow = (row) => {
    const values = [];
    const regex = /(?:"([^"]*(?:""[^"]*)*)"|([^,]*))(?:,|$)/g;
    let match;
    while ((match = regex.exec(row))) {
        const value = match[1] !== undefined ? match[1].replace(/""/g, '"') : match[2];
        values.push(value);
        if (match[0].slice(-1) !== ',') break;
    }
    return values;
};

export const RobotReportsComponent = ({ division, section, city, onBack }) => {
    const [robots, setRobots] = useState([]);
    const [filteredRobots, setFilteredRobots] = useState([]);
    const [selectedRobots, setSelectedRobots] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [reportData, setReportData] = useState(null);
    const [showPopup, setShowPopup] = useState(false);

    // --- Step 1 & 2: Data Fetching and Filtering (Unchanged) ---
    useEffect(() => {
        const fetchCSV = async () => {
            try {
                const response = await fetch("/datafiles/CSVs/Robo_Operations_copy.csv");
                const text = await response.text();
                const rows = text.replace(/\r/g, "").trim().split("\n").filter(Boolean);
                if (rows.length < 2) return;

                const headers = rows[0].split(",").map((h) => h.trim());
                const data = rows.slice(1).map((row) => {
                    const values = parseCsvRow(row);
                    const obj = headers.reduce((acc, header, i) => {
                        acc[header] = values[i] || "";
                        return acc;
                    }, {});
                    return {
                        device_id: obj.device_id,
                        City: obj.City,
                        Division: obj.Division,
                        Section: obj.Section,
                    };
                });
                setRobots(data);
            } catch (err) {
                console.error("Error loading CSV:", err);
            }
        };
        fetchCSV();
    }, []);

    useEffect(() => {
        if (!robots.length) return;
        const normalizeForComparison = (str) => str?.toLowerCase() || "";
        const filtered = robots.filter((robot) => {
            const robotDivision = normalizeForComparison(robot.Division);
            const robotSection = normalizeForComparison(robot.Section);
            const robotCity = normalizeForComparison(robot.City);
            const checkDivision = () => {
                if (!division) return true;
                const searchParts = normalizeForComparison(division).match(/[a-z0-9]+/g) || [];
                return searchParts.every(part => robotDivision.includes(part));
            };
            const sectionMatch = section ? robotSection.includes(normalizeForComparison(section)) : true;
            const cityMatch = city ? robotCity.includes(normalizeForComparison(city)) : true;
            return checkDivision() && sectionMatch && cityMatch;
        });
        const uniqueRobots = Array.from(new Map(filtered.map((r) => [r.device_id, r])).values());
        setFilteredRobots(uniqueRobots);
        setSelectedRobots([]);
        setSelectAll(false);
    }, [robots, division, section, city]);

    // --- Step 3: Selection Logic (Unchanged) ---
    const handleCheckboxChange = (device_id) => {
        setSelectedRobots((prev) =>
            prev.includes(device_id) ? prev.filter((id) => id !== device_id) : [...prev, device_id]
        );
    };

    const handleSelectAll = () => {
        if (!selectAll) setSelectedRobots(filteredRobots.map((r) => r.device_id));
        else setSelectedRobots([]);
        setSelectAll(!selectAll);
    };

    // --- Step 4: Corrected Backend API Call ---
    const handleViewReport = async () => {
        if (selectedRobots.length === 0) {
            alert("Please select at least one robot.");
            return;
        }

        setIsLoading(true);
        
        // ✅ **The Fix:** Grouping filter criteria into a 'userInputs' object.
        const payload = {
            selectedRobots,
            userInputs: { // The backend likely expects the filters grouped this way
                division,
                section,
                city,
            },
            command: "generate_robot_report",
        };

        try {
            const response = await fetch("http://10.188.1.28:5001/api/analyze/robot", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                // Provide more context on 400 errors
                if (response.status === 400) {
                    const errorData = await response.json().catch(() => ({ message: "Server returned a 400 Bad Request with no details." }));
                    console.error("Server validation error:", errorData);
                    throw new Error(`Server error 400: Bad Request. The server rejected the data. Details: ${JSON.stringify(errorData)}`);
                }
                throw new Error(`Server error: ${response.status}`);
            }

            const data = await response.json();
            console.log("Backend response:", data);
            setReportData(data);
            setShowPopup(true);

        } catch (error) {
            console.error("Error fetching report data:", error);
            alert(`Failed to fetch report data. ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <>
            {/* {showPopup && reportData && (
                <RobotReportPopup
                    reportData={reportData}
                    onClose={() => setShowPopup(false)}
                />
            )}
            */}

            <div className="bg-white rounded-lg mx-[20px] p-[24px] border-[1.5px] border-[#E1E7EF] sm:p-6 max-h-[550px] h-[550px] overflow-y-auto">
                <div className="flex items-center justify-between mb-4 pb-4">
                    <div className="flex gap-[20px] items-center">
                        <div className="flex flex-col gap-[4px]">
                            <h3 className="text-[20px] font-semibold text-gray-800">{section || division} - Select Robots</h3>
                            <label className="inline-flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700">
                                <input type="checkbox" checked={selectAll} onChange={handleSelectAll} className="h-4 w-4 text-[15px] rounded border-gray-300 focus:ring-[#1E9AB0] accent-[#1E9AB0]" />
                                Select All
                            </label>
                        </div>
                    </div>
                    
                    <div className='flex items-center gap-x-6'>
                        <p className="text-sm text-gray-700 font-medium">{selectedRobots.length} of {filteredRobots.length} selected</p>
                        <button
                            onClick={handleViewReport}
                            disabled={isLoading || selectedRobots.length === 0}
                            className={`px-6 py-2.5 text-white font-semibold rounded-lg shadow-md transition-colors bg-[#1E9AB0] ${(isLoading || selectedRobots.length === 0) ? 'opacity-60 cursor-not-allowed' : 'hover:bg-[#187A8A]'}`}
                        >
                            {isLoading ? "Generating..." : "View Selected Report"}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {filteredRobots.map((robot) => (
                        <label key={robot.device_id} className="flex items-center gap-2 px-4 py-4 rounded-lg cursor-pointer bg-[#F9FAFB]">
                            <input type="checkbox" checked={selectedRobots.includes(robot.device_id)} onChange={() => handleCheckboxChange(robot.device_id)} className="h-4 w-4 rounded border-[#1E9AB0] accent-[#1E9AB0]" />
                            <span className="text-sm font-medium text-gray-800">{robot.device_id}</span>
                        </label>
                    ))}
                </div>
            </div>
        </>
    );
};