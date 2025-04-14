import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignIn from "./pages/SignIn";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import Profile from "./pages/Profile"
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<h1>Welcome to the Social Platform API</h1>} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/profile/:userId?" element={<Profile />} />
      </Routes>
    </Router>
  );
}

export default App;
