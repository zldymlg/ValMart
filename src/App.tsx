import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AuthPage from "./Auth";
import Dashboard from "./AppContent";
import Dashboard1 from "./HeaderContent";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard1" element={<Dashboard1 />} />
      </Routes>
    </Router>
  );
}

export default App;
