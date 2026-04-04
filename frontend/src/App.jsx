import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";
import PrivateRoute from "./components/Auth/PrivateRoute";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import Layout from "./components/Layout/Layout";
import Dashboard from "./components/Dashboard/Dashboard";
import SemanticSearch from "./components/SemanticSearch/SemanticSearch";
import ResumeUpload from "./components/Upload/ResumeUpload";
import ResumeTailoring from "./components/ResumeTailoring/ResumeTailoring";
import CoverLetterGenerator from "./components/CoverLetter/CoverLetterGenerator";
import InterviewInsights from "./components/InterviewInsights/InterviewInsights";
import JobMatcher from "./components/JobMatcher/JobMatcher";
import LandingPage from "./components/LandingPage/LandingPage";
import ChangePassword from "./components/Auth/ChangePassword";
import ApplicationTracker from "./components/ApplicationTracker/ApplicationTracker";

function App() {
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: "#363636",
                color: "#fff",
              },
              success: {
                iconTheme: {
                  primary: "#10b981",
                  secondary: "#fff",
                },
              },
            }}
          />
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} /> {/* ✅ landing page */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            {/* Protected routes */}
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/semantic-search"
              element={
                <PrivateRoute>
                  <Layout>
                    <SemanticSearch />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/upload"
              element={
                <PrivateRoute>
                  <Layout>
                    <ResumeUpload />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/resume-tailoring"
              element={
                <PrivateRoute>
                  <Layout>
                    <ResumeTailoring />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/cover-letter"
              element={
                <PrivateRoute>
                  <Layout>
                    <CoverLetterGenerator />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/interview-insights"
              element={
                <PrivateRoute>
                  <Layout>
                    <InterviewInsights />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/job-matcher"
              element={
                <PrivateRoute>
                  <Layout>
                    <JobMatcher />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/change-password"
              element={
                <PrivateRoute>
                  <Layout>
                    <ChangePassword />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/application-tracker"
              element={
                <PrivateRoute>
                  <Layout>
                    <ApplicationTracker />
                  </Layout>
                </PrivateRoute>
              }
            />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
