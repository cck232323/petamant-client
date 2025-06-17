
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ActivityService } from '../api/activityService';
import { AuthService } from '../api/authService';
import { Activity } from '../models/activity';

const ActivityDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // 添加到其他状态声明旁边
  const [showRegistrations, setShowRegistrations] = useState(false);

  // 检查用户是否已登录
  useEffect(() => {
    // 确保认证状态
    AuthService.ensureAuthenticated();
    setIsAuthenticated(AuthService.isAuthenticated());

    // 记录认证状态和用户ID，用于调试
    console.log('Authentication status:', AuthService.isAuthenticated());
    console.log('User ID:', AuthService.getUserId());
  }, []);

  // 获取活动详情
  useEffect(() => {
    const fetchActivity = async () => {
      if (!id) {
        setLoading(false);
        setError('No activity ID provided');
        return null;
      }

      try {
        const activityId = parseInt(id);
        const data = await ActivityService.getActivityById(activityId);
        setActivity(data);
        const currentUserId = AuthService.getUserId();
      
      // 检查用户是否是活动创建者
        const isCreator = currentUserId && data.creatorUserId === currentUserId;
        
        // 如果用户是创建者，自动设置为已注册
        if (isCreator) {
          setIsRegistered(true);
          console.log('User is the creator of this activity, automatically marked as registered');
        } else 
        if (AuthService.isAuthenticated()) {
          const userId = AuthService.getUserId();

          if (userId) {
            try {
              console.log('Fetching user registered activities, User ID:', userId);
              // 使用正确的API获取用户注册的活动
              const userRegisteredActivities = await ActivityService.getUserRegisteredActivities(userId);
              console.log('User registered activities:', userRegisteredActivities);

              // 检查用户是否注册了当前活动
              setIsRegistered(userRegisteredActivities.some(activity => activity.id === activityId));
            } catch (regErr: any) {
              console.error('Failed to get user registered activities:', regErr);

              // 如果是404错误，可能是API路径问题
              if (regErr.response && regErr.response.status === 404) {
                console.warn('Registration API might not exist, assuming user is not registered');
                setIsRegistered(false);
              } else {
                // 其他错误，显示错误消息但不阻止用户体验
                console.error(`Failed to check registration status: ${regErr.message}`);
                setIsRegistered(false);
              }
            }
          } else {
            console.warn('User is authenticated but no userId, trying to fix auth state');
            // 尝试从 sessionStorage 恢复 userId
            const sessionUserId = sessionStorage.getItem('userId');
            if (sessionUserId) {
              localStorage.setItem('userId', sessionUserId);
              try {
                const userRegisteredActivities = await ActivityService.getUserRegisteredActivities(parseInt(sessionUserId));
                setIsRegistered(userRegisteredActivities.some(activity => activity.id === activityId));
              } catch (regErr) {
                console.error('Failed to get user registered activities with session ID:', regErr);
                setIsRegistered(false);
              }
            } else {
              setIsRegistered(false);
              setIsAuthenticated(false);
            }
          }
        }
      } catch (err: any) {
        console.error('Failed to load activity details:', err);
        setError('Failed to load activity details');
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, [id]);

  const handleDelete = async () => {
    if (!activity || !window.confirm('Are you sure you want to delete this activity?')) {
      return;
    }
    
    try {
      await ActivityService.deleteActivity(activity.id);
      navigate('/activities');
    } catch (err) {
      setError('Failed to delete activity');
    }
  };

  // 处理注册按钮点击
  const handleRegisterClick = () => {
    if (!id) return;
    
    // 如果用户未登录，先保存当前URL，然后跳转到登录页面
    if (!isAuthenticated) {
      sessionStorage.setItem('returnUrl', `/activities/${id}`);
      navigate('/login');
      return;
    }
    
    // 跳转到注册页面
    navigate(`/register-activity/${id}`);
  };

  if (loading) return <div className="text-center">Loading...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!activity) return <div className="alert alert-warning">Activity not found</div>;

  // Ensure registrations array exists
  const registrations = activity.registrations || [];
  const currentUserId = AuthService.getUserId();
  const isCreator = activity?.creatorUserId === currentUserId;

  return (
    <div className="container mt-4">
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h2>{activity.title}</h2>
          {isCreator && (
            <div>
              <button className="btn btn-danger ml-2" onClick={handleDelete}>
                Delete Activity
              </button>
            </div>
          )}
        </div>
        <div className="card-body">
          <p className="lead">{activity.description}</p>
          <div className="row">
            <div className="col-md-6">
              <p><strong>Date:</strong> {new Date(activity.date).toLocaleDateString()}</p>
              <p><strong>Location:</strong> {activity.location}</p>
              <p><strong>Created by:</strong> {activity.creatorUserName || 'Unknown'}</p>
            </div>
            <div className="col-md-6">
              <p><strong>Registrations:</strong> {activity.registrationsCount || 0}</p>
            </div>
          </div>
          
          {isAuthenticated ? (
            isRegistered ? (
              <div className="alert alert-success">
                You are registered for this activity!
              </div>
            ) : (
              <div className="d-grid gap-2 col-6 mx-auto mt-3 mb-3">
                <button 
                  className="btn btn-primary btn-lg" 
                  onClick={handleRegisterClick}
                >
                  Register for this Activity
                </button>
              </div>
            )
          ) : (
            <div className="alert alert-warning">
              Please <Link to="/login">login</Link> to register for this activity.
            </div>
          )}
          
          {/* <h4 className="mt-4">Registered Pets</h4>
          
          {Array.isArray(registrations) && registrations.length > 0 ? (
            <ul className="list-group">
              {registrations.map((reg: any, index: number) => {
                // 解析宠物信息，尝试从可能的格式中获取数据
                
                let petInfo = { name: '', type: '' };
                if (reg && reg.petInfo && typeof reg.petInfo === 'string') {
                  try {
                    petInfo = JSON.parse(reg.petInfo);
                  } catch (e) {
                    console.warn('Failed to parse pet info:', reg.petInfo);
                  }
                }
                
                // 使用解析的宠物信息或回退到默认值
                const petName = petInfo.name || 'Unknown Pet';
                const petType = petInfo.type || 'Unknown Type';
                
                return (
                  <li className="list-group-item" key={reg?.id || `registration-${index}`}>
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <strong>{petName}</strong> 
                        <span className="badge bg-info ms-2">{petType}</span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p>No registrations yet.</p>
          )} */}
          <div className="d-flex align-items-center mt-4">
            <h4 className="mb-0 me-2">Registered Pets</h4>
            <button 
              className="btn btn-sm btn-outline-secondary d-flex align-items-center"
              onClick={() => setShowRegistrations(!showRegistrations)}
            >
              <span className="me-1">{showRegistrations ? 'Hide' : 'Show'}</span>
              <span className="badge bg-secondary me-1">{registrations.length}</span>
              <i className={`bi bi-chevron-${showRegistrations ? 'up' : 'down'}`}></i>
            </button>
          </div>

          {Array.isArray(registrations) && registrations.length > 0 ? (
            <div className={`collapse ${showRegistrations ? 'show' : ''}`}>
              <ul className="list-group">
                {registrations.map((reg: any, index: number) => {
                  // 解析宠物信息，尝试从可能的格式中获取数据
                  
                  let petInfo = { name: '', type: '' };
                  if (reg && reg.petInfo && typeof reg.petInfo === 'string') {
                    try {
                      petInfo = JSON.parse(reg.petInfo);
                    } catch (e) {
                      console.warn('Failed to parse pet info:', reg.petInfo);
                    }
                  }
                  
                  // 使用解析的宠物信息或回退到默认值
                  const petName = petInfo.name || 'Unknown Pet';
                  const petType = petInfo.type || 'Unknown Type';
                  
                  return (
                    <li className="list-group-item" key={reg?.id || `registration-${index}`}>
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <strong>{petName}</strong> 
                          <span className="badge bg-info ms-2">{petType}</span>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : (
            <p>No registrations yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityDetail;