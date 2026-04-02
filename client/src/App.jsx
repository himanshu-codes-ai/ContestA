import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import UserDashboard from './pages/UserDashboard';
import TopicAnalysis from './pages/TopicAnalysis';
import UpsolvingTracker from './pages/UpsolvingTracker';
import SubmissionHeatmap from './pages/SubmissionHeatmap';
import Compare from './pages/Compare';
import Recommendations from './pages/Recommendations';

export default function App() {
    return (
        <div className="app-layout">
            {/* Terminal background grid + scanlines */}
            <div className="bg-grid" />
            <div className="orb orb-1" />
            <div className="orb orb-2" />

            <Navbar />
            <main className="main-content">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/user" element={<Home />} />
                    <Route path="/user/:handle" element={<UserDashboard />} />
                    <Route path="/topics" element={<TopicAnalysis />} />
                    <Route path="/topics/:handle" element={<TopicAnalysis />} />
                    <Route path="/upsolving" element={<UpsolvingTracker />} />
                    <Route path="/upsolving/:handle" element={<UpsolvingTracker />} />
                    <Route path="/heatmap" element={<SubmissionHeatmap />} />
                    <Route path="/heatmap/:handle" element={<SubmissionHeatmap />} />
                    <Route path="/compare" element={<Compare />} />
                    <Route path="/recommend" element={<Recommendations />} />
                    <Route path="/recommend/:handle" element={<Recommendations />} />
                </Routes>
            </main>
        </div>
    );
}
