// import React from "react";

// export const ManholeReportPopup = ({ reportData, onClose }) => {
//   return (
//     <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
//       <div className="bg-white w-[80%] max-w-3xl rounded-lg shadow-xl p-6 relative">
//         {/* Close Button */}
//         <button
//           onClick={onClose}
//           className="absolute top-3 right-3 text-gray-600 hover:text-gray-800"
//         >
//           ✕
//         </button>

//         <h2 className="text-xl font-semibold text-gray-800 mb-4">
//           📊 Manhole Report Data
//         </h2>

//         {/* Display backend data */}
//         <div className="overflow-y-auto max-h-[400px]">
//           <pre className="bg-gray-100 rounded-lg p-4 text-sm text-gray-800 whitespace-pre-wrap">
//             {JSON.stringify(reportData, null, 2)}
//           </pre>
//         </div>
//       </div>
//     </div>
//   );
// };
import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { useReactToPrint } from 'react-to-print';

// Note: Ensure chartjs-plugin-datalabels is loaded via <script> in your index.html

export const ManholeReportPopup = ({ reportData, onClose }) => {
  const chartRefs = useRef({});
  // ✅ FIX #1: This ref is essential for react-to-print
  const printableComponentRef = useRef();

  // --- Reusable Chart Drawing Logic ---
  const updateChart = (id, type, labels, data, config) => {
    // ✅ FIX #2: Always destroy the old chart before drawing a new one
    // This prevents memory leaks and rendering errors.
    if (chartRefs.current[id]) {
      chartRefs.current[id].destroy();
    }
    const ctx = document.getElementById(id);
    if (ctx) {
      chartRefs.current[id] = new Chart(ctx, {
        type,
        data: { labels, datasets: [{ data, ...config }] },
        options: { responsive: true, maintainAspectRatio: false, ...config.options },
      });
    }
  };

  const updatePieChart = (id, labels, data, colors) => {
    updateChart(id, 'pie', labels, data, {
      backgroundColor: colors,
      options: { plugins: { legend: { position: 'bottom' }, datalabels: { color: '#fff', formatter: (v, ctx) => { const total = ctx.chart.data.datasets[0].data.reduce((a, b) => a + b, 0); return total > 0 ? `${(v / total * 100).toFixed(1)}%` : '0%'; } } } },
    });
  };

  const updateBarChart = (id, labels, data, label) => {
    updateChart(id, 'bar', labels, data, {
      label,
      backgroundColor: '#3b82f6',
      options: { plugins: { legend: { display: false }, datalabels: { anchor: 'end', align: 'top', color: '#4b5563' } }, scales: { y: { beginAtZero: true } } },
    });
  };

  // --- Effect to Draw Charts from Aggregate Data ---
  useEffect(() => {
    if (reportData && reportData.data) {
      // ✅ FIX #3: Delay chart drawing slightly with a timeout.
      // This ensures the <canvas> elements are ready in the DOM before we try to draw on them.
      const timer = setTimeout(() => {
        const data = reportData.data;
        const wasteData = data["Waste Collected(Kg) by Blockage Level"];
        if (wasteData) updatePieChart('aggWastePie', Object.keys(wasteData), Object.values(wasteData), ['#f97316', '#eab308', '#ef4444']);
        
        const conditionData = data["Manhole Condition Distribution"];
        if (conditionData) updatePieChart('aggConditionPie', Object.keys(conditionData), Object.values(conditionData), ['#22c55e', '#60a5fa', '#ef4444', '#8b5cf6']);
        
        const sewerData = data["Sewer Length by Area Distribution"];
        if (sewerData) updatePieChart('aggSewerPie', Object.keys(sewerData), Object.values(sewerData), ['#3b82f6', '#14b8a6', '#a855f7', '#ec4899']);
        
        const junctionData = data["Junction Type Distribution"];
        if (junctionData) updateBarChart('aggJunctionBar', Object.keys(junctionData), Object.values(junctionData), 'Count');
        
        const cloggingData = data["Clogging Incidents by Junction Type"];
        if (cloggingData) updateBarChart('aggCloggingBar', Object.keys(cloggingData), Object.values(cloggingData), 'Incidents');
      }, 100); // A small delay of 100ms is usually enough

      // Cleanup function to clear the timer
      return () => clearTimeout(timer);
    }
  }, [reportData]);

  // ✅ FIX #4: Correctly configure the useReactToPrint hook
  const handlePrint = useReactToPrint({
    content: () => printableComponentRef.current,
    documentTitle: `Aggregate-Manhole-Report-${new Date().toISOString().split('T')[0]}`
  });

  if (!reportData || !reportData.data) return null;

  const summary = reportData.data;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-6xl rounded-lg shadow-xl relative flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-2xl font-bold text-gray-800">📈 Aggregate Manhole Analysis</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-900 text-2xl font-bold">&times;</button>
        </div>

        {/* --- Scrollable & Printable Content --- */}
        {/* The ref is attached to this div */}
        <div ref={printableComponentRef} className="p-6 overflow-y-auto max-h-[80vh]">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
            <InfoCard title="Manholes Analyzed" value={summary["Total Manholes"]} />
            <InfoCard title="Total Operations" value={summary["Total Operations"]} />
            <InfoCard title="Waste Collected" value={`${summary["Total Waste Collected (kg)"]} kg`} />
            <InfoCard title="Clogging Incidents" value={summary["Total Clogging Incidents Reported"]} />
            <InfoCard title="Avg. Op Time" value={`${summary["Average Operation Time (min)"].toFixed(2)} min`} />
          </div>

          {/* Charts Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            <ChartCard title="Waste by Blockage Level (Kg)" chartId="aggWastePie" />
            <ChartCard title="Manhole Condition" chartId="aggConditionPie" />
            <ChartCard title="Sewer Length by Area (km)" chartId="aggSewerPie" />
            <ChartCard title="Junction Type Distribution" chartId="aggJunctionBar" />
            <ChartCard title="Clogging Incidents by Junction" chartId="aggCloggingBar" />
          </div>
        </div>

        {/* --- Footer & Print Button --- */}
        <div className="flex justify-end p-4 border-t bg-gray-50 rounded-b-lg">
          <button onClick={handlePrint} className="px-6 py-2 bg-[#1E9AB0] text-white font-semibold rounded-lg hover:bg-[#187A8A]">
            Print Report
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Helper Sub-components ---
const InfoCard = ({ title, value }) => (
  <div className="bg-gray-50 rounded-lg p-4 text-center border border-gray-200">
    <p className="text-sm text-gray-600 font-medium">{title}</p>
    <p className="text-2xl font-bold text-gray-900">{value}</p>
  </div>
);

const ChartCard = ({ title, chartId }) => (
  <div className="bg-white border border-gray-200 rounded-xl shadow-md p-4">
    <h3 className="m-0 mb-3 text-base text-center font-semibold">{title}</h3>
    <div className="h-64"><canvas id={chartId}></canvas></div>
  </div>
);