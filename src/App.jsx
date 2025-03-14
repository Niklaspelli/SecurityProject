import React from "react";
import { AuthProvider } from "./context/AuthContext"; // Import the context
import Navbar from "./components/Navbar";
import { Routes, Route, Navigate } from "react-router-dom"; // Add Navigate for redirection
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Forum from "./pages/Forum";
import Home from "./pages/Home";
import Settings from "./pages/settings/Settings.jsx";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./auth/ProtectedRoute";
import CreateThread from "./components/thread/CreateThread"; // Adjust the path accordingly
import ThreadList from "./components/thread/ThreadList"; // Adjust the path accordingly
import ThreadDetail from "./components/thread/ThreadDetail"; // Adjust the path accordingly
import UserProfile from "./pages/userprofile/UserProfile"; // Import the UserProfile component
import EditProfile from "./pages/settings/EditProfile.jsx";
import CreateProfile from "./pages/settings/CreateProfile.jsx";

function App() {
  return (
    <AuthProvider>
      <Navbar />
      <Routes>
        {/* Redirect the root route to the login page */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Public routes */}
        <Route path="/login" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/forum" element={<Forum />} />
          <Route path="/user/:id" element={<UserProfile />} />{" "}
          {/* Ensure UserProfile is imported */}
          <Route path="/settings/:id" element={<Settings />} />
          <Route path="/create-profile" element={<CreateProfile />} />
          <Route path="/settings/edit-profile/:id" element={<EditProfile />} />
          <Route path="/threads" element={<ThreadList />} />
          <Route path="/threads/:threadId" element={<ThreadDetail />} />
          <Route path="/create-thread" element={<CreateThread />} />
        </Route>

        {/* Fallback for undefined routes */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
