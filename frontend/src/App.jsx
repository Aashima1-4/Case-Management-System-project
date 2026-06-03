import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./dashboard/Dashboard";
import CaseTrackingPage from "./pages/caseTracking/CaseTrackingPage";
import DashboardLayout from "./layouts/DashboardLayout";
import { auth } from "./utils/auth";
import { canAccessRoute } from "./utils/permissions";

import EvidenceDatabase from "./pages/EvidenceDatabase";
import DataUpload from "./pages/DataUpload";
import Analytics from "./pages/Analytics";

const ProtectedRoute = ({ children, path }) => {
  const user = auth.getCurrentUser();
  if (!user) return <Navigate to="/login" />;
  if (path && !canAccessRoute(user, path)) return <Navigate to="/dashboard" />;
  return <DashboardLayout>{children}</DashboardLayout>;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute path="/dashboard">
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/case-tracking"
          element={
            <ProtectedRoute path="/case-tracking">
              <CaseTrackingPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/evidence"
          element={
            <ProtectedRoute path="/evidence">
              <EvidenceDatabase />
            </ProtectedRoute>
          }
        />

        <Route
          path="/upload"
          element={
            <ProtectedRoute path="/upload">
              <DataUpload />
            </ProtectedRoute>
          }
        />

        <Route
          path="/analytics"
          element={
            <ProtectedRoute path="/analytics">
              <Analytics />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
