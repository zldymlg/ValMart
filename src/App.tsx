import { Routes, Route } from "react-router-dom";
import AuthPage from "./Auth";
import Dashboard from "./Dashboard/HeaderContent";

function App() {
  return (
    <Routes>
      <Route path="/" element={<AuthPage />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  );
}

export default App;
