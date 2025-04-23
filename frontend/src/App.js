import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignIn from "./pages/SignIn";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import Profile from "./pages/Profile"
import ProfileMock from "./pages/ProfileMock"
import ChatPage from './pages/ChatPage';
import FriendsList from './pages/FriendsList';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<h1>Welcome to the Social Platform API</h1>} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/profile/:userId?" element={<Profile />} />
        <Route path="/profile-mock" element={<ProfileMock />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/friends" element={<FriendsList />} />
      </Routes>
    </Router>
  );
}

export default App;
