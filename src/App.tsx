import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthService } from './api/authService';
import NavBar from './components/Navbar';
import Home from './pages/Home';
// import Login from './pages/Login';
// import Register from './pages/Register';
// import Activities from './pages/Activities';
// import { Activity, Registration } from '../models/activity';
import ActivityList from './components/ActivityList';
import ActivityDetail from './components/ActivityDetail';
import CreateActivity from './pages/CreateActivity';
import MyActivities from './pages/MyActivities';
import Profile from './pages/Profile'; // 导入
import ActivityRegistrationPage from './pages/ActivityRegistrationPage'; // 导入新的注册页面
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// 路由守卫组件
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (!AuthService.isAuthenticated()) {
    // 保存当前URL，以便登录后重定向回来
    sessionStorage.setItem('returnUrl', window.location.pathname);
    return <Navigate to="/login" />;
  }
  return <>{children}</>;
};

const App: React.FC = () => {
  // 在应用启动时检查认证状态
  useEffect(() => {
    AuthService.ensureAuthenticated();
  }, []);

  return (
    <Router>
      <NavBar />
      <div className="container mt-4">
        <Routes>
          <Route path="/" element={<Home />} />
          {/* <Route path="/login" element={<Login />} /> */}
          {/* <Route path="/register" element={<Register />} /> */}
          <Route path="/activities" element={<ActivityList />}/>
          <Route path="/activities/:id" element={<ActivityDetail />} />
          <Route 
            path="/create-activity" 
            element={
              <ProtectedRoute>
                <CreateActivity />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/my-activities" 
            element={
              <ProtectedRoute>
                <MyActivities />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
          {/* 添加新的注册活动路由 */}
          <Route path="/register-activity/:id" element={
            <ProtectedRoute>
              <ActivityRegistrationPage />
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
