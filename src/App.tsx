import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AuthPage from "./Auth";

import Dashboard from "./Dashboard/AppContent";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
