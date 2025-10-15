import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import { Dashboard } from "./pages/Dashboard";
import { Robots } from "./pages/Robots";
import { Reports } from "./pages/Reports";
import { Highlights } from "./pages/Highlights";

function App() {
  return (
    <Router>


      {/* Routes */}
      <main className="bg-[#fff] max-w-[1400px] m-auto min-h-screen pt-[100px] font-[inter] place-items-center">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/robots" element={<Robots />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/highlights" element={<Highlights />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
