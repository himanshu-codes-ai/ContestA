import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import UserDashboard from './pages/UserDashboard';
import TopicAnalysis from './pages/TopicAnalysis';
import UpsolvingTracker from './pages/UpsolvingTracker';
import SubmissionHeatmap from './pages/SubmissionHeatmap';
import Compare from './pages/Compare';
import Recommendations from './pages/Recommendations';
import SearchProfile from './pages/SearchProfile';
import Login from './pages/Login';
import Profile from './pages/Profile';
import { AuthProvider, useAuth } from './context/AuthContext';

function RequireAuth({ children }) {
    const { user, loading } = useAuth();
    if (loading) return null;
    if (!user) return <Navigate to="/login" replace />;
    return children;
}

export default function App() {
    const location = useLocation();
    const authOnlyRoutes = ['/login'];
    const showShell = !authOnlyRoutes.includes(location.pathname);

    return (
        <AuthProvider>
            <div className="app-layout">
            {/* Terminal background grid + scanlines */}
            {showShell && <div className="bg-grid" />}
            {showShell && <div className="orb orb-1" />}
            {showShell && <div className="orb orb-2" />}

            {showShell && <Navbar />}
                <main className={showShell ? 'main-content' : 'auth-fullpage'}>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/user" element={<UserDashboard />} />
                        <Route path="/user/:handle" element={<UserDashboard />} />
                        <Route path="/search" element={<SearchProfile />} />
                        <Route path="/topics" element={<TopicAnalysis />} />
                        <Route path="/topics/:handle" element={<TopicAnalysis />} />

                        <Route path="/upsolving" element={<UpsolvingTracker />} />
                        <Route path="/upsolving/:handle" element={<UpsolvingTracker />} />
                        <Route path="/heatmap" element={<SubmissionHeatmap />} />
                        <Route path="/heatmap/:handle" element={<SubmissionHeatmap />} />
                        <Route path="/compare" element={<Compare />} />
                        <Route path="/recommend" element={<Recommendations />} />
                        <Route path="/recommend/:handle" element={<Recommendations />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
                    </Routes>
                </main>
            </div>
        </AuthProvider>
    );
}
