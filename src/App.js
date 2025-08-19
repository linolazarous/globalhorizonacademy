// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { LocalizationProvider } from './hooks/useLocalization';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { OfflineIndicator } from './components/common/OfflineIndicator';
import { AccessibilityControls } from './components/accessibility/AccessibilityControls';
import Navigation from './components/layout/Navigation';
import Dashboard from './pages/Dashboard';
import Course from './pages/Course';
import Admin from './pages/Admin';
import './styles/main.css';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <LocalizationProvider>
          <Router>
            <div className="app">
              <OfflineIndicator />
              <AccessibilityControls />
              <Navigation />
              
              <main className="main-content">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/course/:id" element={<Course />} />
                  <Route path="/admin/*" element={<Admin />} />
                  {/* Add more routes as needed */}
                </Routes>
              </main>
            </div>
          </Router>
        </LocalizationProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
