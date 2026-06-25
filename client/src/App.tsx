import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import Header from './components/Header';
import { AdminRoute } from './components/AdminRoute';
import { ProtectedRoute } from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Statistics from './pages/Statistics';
import LocationHistory from './pages/LocationHistory';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import AdminPanel from './pages/AdminPanel';
import Comments from './pages/Comments';
import Feedback from './pages/Feedback';
import { LocationProvider } from './contexts/LocationContext';

const AppContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: row;
`;

const MainContent = styled.main`
  flex: 1;
  padding: 24px;
  width: calc(100% - 260px);
  margin-left: 260px;
  max-width: 1600px;

  @media (max-width: 900px) {
    width: 100%;
    margin-left: 0;
    padding: 16px;
  }
`;

const App: React.FC = () => {
    const location = useLocation();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Имитация загрузки
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    if (isLoading) {
        return (
            <AppContainer>
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                    fontSize: '24px',
                    color: '#66c0f4'
                }}>
                    Загрузка Geo Steam...
                </div>
            </AppContainer>
        );
    }

    return (
        <LocationProvider>
            <AppContainer>
                <Header />
                <MainContent>
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route
                            path="/profile"
                            element={
                                <ProtectedRoute>
                                    <Profile />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/admin"
                            element={
                                <AdminRoute>
                                    <AdminPanel />
                                </AdminRoute>
                            }
                        />
                        <Route
                            path="/"
                            element={
                                <ProtectedRoute>
                                    <Dashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/statistics"
                            element={
                                <ProtectedRoute>
                                    <Statistics />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/history"
                            element={
                                <ProtectedRoute>
                                    <LocationHistory />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/comments"
                            element={<Comments />}
                        />
                        <Route
                            path="/feedback"
                            element={<Feedback />}
                        />
                        <Route
                            path="/settings"
                            element={
                                <ProtectedRoute>
                                    <Settings />
                                </ProtectedRoute>
                            }
                        />
                    </Routes>
                </MainContent>
            </AppContainer>
        </LocationProvider>
    );
};

export default App; 