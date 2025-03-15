import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AuthPage from "./Auth";
import Dashboard from "./Dashboard/AppContent";
import Order from "./Dashboard/Content/OrderPreview";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route
          path="/Order"
          element={<Order product={undefined} userId={""} />}
        />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}
s;

export default App;
