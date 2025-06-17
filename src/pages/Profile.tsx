import React, { useEffect, useState } from 'react';
import { AuthService } from '../api/authService';
import { ActivityService } from '../api/activityService';
import { Link, useNavigate } from 'react-router-dom';
import { Activity } from '../models/activity';

interface User {
  id: number;
  userName: string;
  email: string;
  createdActivities?: Activity[];
  registeredActivities?: Activity[];
}

const Profile: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [createdActivities, setCreatedActivities] = useState<Activity[]>([]);
  const [registeredActivities, setRegisteredActivities] = useState<Activity[]>([]);
  const [activeTab, setActiveTab] = useState<'created' | 'registered'>('created');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      // 确保用户已登录
      if (!AuthService.isAuthenticated()) {
        navigate('/login', { state: { returnUrl: '/profile' } });
        return;
      }

      const userId = AuthService.getUserId();
      if (!userId) {
        setError('无法获取用户ID，请重新登录');
        setTimeout(() => navigate('/login'), 2000);
        return;
      }

      setLoading(true);
      try {
        // 获取用户基本信息
        const response = await fetch(`/api/users/${userId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error(`获取用户资料失败: ${response.status} ${response.statusText}`);
        }

        const userData = await response.json();
        setUser(userData);

        // 获取用户创建的活动
        const created = await ActivityService.getUserCreatedActivities(userId);
        setCreatedActivities(created);

        // 获取用户注册的活动
        const registered = await ActivityService.getUserRegisteredActivities(userId);
        setRegisteredActivities(registered);
      } catch (err: any) {
        console.error('加载用户资料失败:', err);
        setError(err.message || '加载用户资料失败');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate]);

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">加载中...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h1>Personal Details</h1>
      
      <div className="row">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              Basic Information
            </div>
            <div className="card-body">
              {user ? (
                <div>
                  <h4>{user.userName}</h4>
                  <p><strong>EMAIL:</strong> {user.email}</p>
                  {/* 可以添加更多用户信息 */}
                </div>
              ) : (
                <div className="alert alert-warning">
                  unable to load user information
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;