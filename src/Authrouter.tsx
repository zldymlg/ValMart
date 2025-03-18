import { HashRouter as Router, Routes, Route } from "react-router-dom";
import AuthPage from "./Auth";
import Content from "./AppContent";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Content />} />
        <Route path="/dashboard" element={<AuthPage />} />
      </Routes>
    </Router>
  );
}

export default App;
