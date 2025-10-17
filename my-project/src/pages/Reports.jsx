import React, { useState, useEffect } from "react";
import { RobotReportsComponent } from "../components/reports/robotReportsComponent";
import { ManholeReportsComponent } from "../components/reports/ManholeReportsComponent";
import { WardReportsComponent } from "../components/reports/wardReportsComponent";

export const Reports = () => {
    // --- STATE FOR LOCATION SELECTION ---
    const [locationsData, setLocationsData] = useState([]);
    const [cities, setCities] = useState([]);
    const [divisions, setDivisions] = useState([]);
    const [sections, setSections] = useState([]);
    const [userInputs, setUserInputs] = useState({ city: "", division: "", section: "" });
    const [errors, setErrors] = useState({ city: "", division: "", section: "" });

    // --- STATE FOR UI FLOW ---
    const [viewClicked, setViewClicked] = useState(false);
    const [activeReportType, setActiveReportType] = useState("Manhole Reports");

    // --- LOGIC FOR LOCATION DROPDOWNS & VALIDATION ---
    useEffect(() => {
        // Use fetch to populate location dropdowns
        fetch("/datafiles/CSVs/ManHoles_Data.csv")
            .then(response => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.text();
            })
            .then(text => {
                const rows = text.trim().split('\n').filter(Boolean);
                if (rows.length < 2) return; // Guard against empty or header-only file

                const headers = rows[0].split(',').map(h => h.trim());
                const data = rows.slice(1).map(row => {
                    const values = row.split(',').map(v => v.trim());
                    return headers.reduce((obj, header, i) => {
                        obj[header] = values[i] || '';
                        return obj;
                    }, {});
                });

                setLocationsData(data);
                setCities([...new Set(data.map(r => r.City).filter(Boolean))]);
            })
            .catch(error => console.error("Error fetching location data:", error));
    }, []);


    const handleInput = (field, value) => {
        setUserInputs(prev => {
            const next = { ...prev, [field]: value };
            if (field === "city") { next.division = ""; next.section = ""; }
            if (field === "division") { next.section = ""; }
            return next;
        });
        if (value) setErrors(prev => ({ ...prev, [field]: "" }));
    };

    useEffect(() => {
        if (userInputs.city)
            setDivisions([...new Set(locationsData.filter(r => r.City === userInputs.city).map(r => r.Division).filter(Boolean))]);
        else setDivisions([]);
    }, [userInputs.city, locationsData]);

    useEffect(() => {
        if (userInputs.division)
            setSections([...new Set(locationsData.filter(r => r.City === userInputs.city && r.Division === userInputs.division).map(r => r.Section).filter(Boolean))]);
        else setSections([]);
    }, [userInputs.division, userInputs.city, locationsData]);

    const validate = () => {
        const newErrors = { city: "", division: "", section: "" };
        let isValid = true;
        if (!userInputs.city) { newErrors.city = "*City is required"; isValid = false; }
        if (!userInputs.division) { newErrors.division = "*Division is required"; isValid = false; }
        if (!userInputs.section) { newErrors.section = "*Section is required"; isValid = false; }
        setErrors(newErrors);
        return isValid;
    };

    const handleViewReports = () => {
        if (validate()) {
            setViewClicked(true);
        }
    };

    // --- RENDER LOGIC ---
    // This function conditionally renders the correct report component
    const renderActiveReportComponent = () => {
        const reportProps = {
            city: userInputs.city,
            division: userInputs.division,
            section: userInputs.section,
        };

        switch (activeReportType) {
            case "Manhole Reports":
                return <ManholeReportsComponent {...reportProps} />;
            case "Robot Reports":
                return <RobotReportsComponent {...reportProps} />;
            case "Ward Reports":
                return <WardReportsComponent {...reportProps} />;
            default:
                return <p>Please select a report type.</p>;
        }
    };

    return (
        <section className="w-full">
            <section className="border-b-[1.5px] border-[#E1E7EF] py-[10px] px-[30px]">
                <h1 className="text-[24px] font-bold">Reports</h1>
                <p className="text-[14px] text-[#65758B]">Generate and manage system reports and data exports</p>
            </section>

            <section className="w-full p-6">
                <div className="flex flex-wrap items-end gap-6 p-6 border-[1.5px] border-[#E1E7EF] rounded-lg bg-white ">
                    {/* Location Selectors */}
                    <div className="flex-1 min-w-[250px] relative flex flex-col">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                            <select
                                value={userInputs.city}
                                onChange={(e) => handleInput("city", e.target.value)}
                                className={`w-full h-10 px-3 border rounded-md  border-gray-300`}>
                                <option value="">Select City</option>{cities.map((c) => (<option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                        <span className="absolute bottom-[-16px]">{errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}</span>
                    </div>
                    <div className="flex-1 min-w-[250px] relative flex flex-col">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Division</label>
                            <select
                                value={userInputs.division}
                                onChange={(e) => handleInput("division", e.target.value)}
                                disabled={!userInputs.city}
                                className={`w-full h-10 px-3 border rounded-md disabled:bg-gray-100   border-gray-300`}
                            >
                                <option value="">Select Division</option>
                                {divisions.map((d) => (<option key={d} value={d}>{d}</option>
                                ))}
                            </select>
                        </div>
                        <span className="absolute bottom-[-16px]">{errors.division && <p className="text-red-500 text-xs mt-1">{errors.division}</p>}</span>
                    </div>
                    <div className="flex-1 min-w-[250px] flex flex-col relative">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                            <select
                                value={userInputs.section}
                                onChange={(e) => handleInput("section", e.target.value)}
                                disabled={!userInputs.division}
                                className={`w-full h-10 px-3 border rounded-md disabled:bg-gray-100 focus:outline-none  border-gray-300`}>
                                <option value="">Select Section</option>
                                {sections.map((s) => (<option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>
                        <span className="absolute bottom-[-16px]">{errors.section && <p className="text-red-500 text-xs mt-1">{errors.section}</p>}</span>
                    </div>
                    <button onClick={handleViewReports} className="h-10 px-8 font-semibold text-white bg-[#1A8BA8] rounded-md hover:bg-[#15728a] transition-colors">View Reports</button>
                </div>

                {!viewClicked ? (
                    <div className="text-center py-10 px-6"><img src="/images/Report.png" alt="Robot waiting for input" className="mx-auto h-48 w-48 object-contain" /><p className="mt-4 text-[#65758B] text-center">No reports to display yet. Please select a Division and Section to generate reports.</p></div>
                ) : (
                    <div className="mt-6">
                        <div className="flex gap-2 ">
                            {["Manhole Reports", "Robot Reports", "Ward Reports"].map((type) => (
                                <button key={type} onClick={() => setActiveReportType(type)} className={`px-[16px] py-[12px] text-sm rounded-[8px] font-medium border-1 transition-colors ${activeReportType === type ? "bg-[#1A8BA8] text-white" : "border-[#1A8BA8] "}`}>{type}</button>
                            ))}
                        </div>
                        {/* The selected component will be rendered here */}
                        <div className="mt-4">
                            {renderActiveReportComponent()}
                        </div>
                    </div>
                )}
            </section>
        </section>
    );
};