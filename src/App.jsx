import React from 'react';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Landing from './pages/Landing';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import Explore from './pages/Explore';
import Dashboard from './pages/Dashboard';
import DashboardLayout from './components/layout/DashboardLayout';
import Agents from './pages/Agents';
import TeamOverview from './pages/TeamOverview';
import Account from './pages/Account';
import Billing from './pages/Billing';
import { DarkModeProvider } from './contexts/DarkModeContext';
import './utils/fontawesome';
import VerifyOTP from './pages/VerifyOTP';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/layout/Navbar';
import PreBuiltAgentsPage from './pages/PreBuiltAgentsPage';
import TasksPage from './components/TasksPage';
import TeamTasksPage from './components/TeamTasksPage';
// import Credentials from './pages/Credentials';
// import Accounts from './pages/Accounts';
// import Billing from './pages/Billing';

function App() {
  return (
    <AuthProvider>
      <DarkModeProvider>
        <Toaster position="top-right" />
        <BrowserRouter>
          {/* <ConditionalNavbar /> */}
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/verify-otp" element={<VerifyOTP />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Dashboard routes */}
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="prebuilt-agents" element={<PreBuiltAgentsPage />} />
              <Route path="agents" element={<Agents />} />
              <Route path="team/:teamId" element={<TeamOverview />} />
              <Route path="account" element={<Account />} />
              <Route path="billing" element={<Billing />} />
              <Route path="agents/prebuilt" element={<PreBuiltAgentsPage />} />
              <Route path="tasks" element={<TasksPage />} />
              <Route path="team-tasks/:teamId" element={<TeamTasksPage />} />
            </Route>

            {/* Catch all route - 404 */}
            <Route path="*" element={
              <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                  <p className="text-gray-600 mb-4">Page not found</p>
                  <a href="/" className="text-blue-600 hover:underline">
                    Go back home
                  </a>
                </div>
              </div>
            } />
          </Routes>
        </BrowserRouter>
      </DarkModeProvider>
    </AuthProvider>
  );
}

function ConditionalNavbar() {
  const location = useLocation();
  const hideNavbarPaths = ['/dashboard']; // Add any other paths where you want to hide the Navbar

  return !hideNavbarPaths.includes(location.pathname) ? <Navbar /> : null;
}

export default App;