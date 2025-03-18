import { HashRouter as Router, Routes, Route } from "react-router-dom";
import AuthPage from "./Auth";
import Content from "./AppContent";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/dashboard" element={<Content />} />
      </Routes>
    </Router>
  );
}

export default App;
