import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ActivityService } from '../api/activityService';
import { AuthService } from '../api/authService';
import { Activity } from '../models/activity';

const MyActivities: React.FC = () => {
  const [createdActivities, setCreatedActivities] = useState<Activity[]>([]);
  const [registeredActivities, setRegisteredActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'created' | 'registered'>('created');
  
  useEffect(() => {
    const fetchActivities = async () => {
      const userId = AuthService.getUserId();
      if (!userId) {
        setError('User not authenticated');
        setLoading(false);
        return;
      }
      
      try {
        console.log('Fetching activities for user ID:', userId);
        
        // 使用Promise.all并行获取两种活动
        const [created, registered] = await Promise.all([
          ActivityService.getUserCreatedActivities(userId),
          ActivityService.getUserRegisteredActivities(userId)
        ]);
        
        console.log('Created activities:', created);
        console.log('Registered activities:', registered);
        
        setCreatedActivities(created);
        setRegisteredActivities(registered);
        setLoading(false);
      } catch (err: any) {
        console.error('Failed to load activities:', err);
        
        // 提供更详细的错误信息
        if (err.response) {
          setError(`Failed to load activities: ${err.response.status} ${err.response.statusText}`);
        } else if (err.request) {
          setError('Failed to load activities: No response from server');
        } else {
          setError(`Failed to load activities: ${err.message}`);
        }
        
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  const handleDeleteActivity = async (activityId: number) => {
    if (!window.confirm('Are you sure you want to delete this activity?')) {
      return;
    }
    
    try {
      await ActivityService.deleteActivity(activityId);
      setCreatedActivities(prev => prev.filter(a => a.id !== activityId));
    } catch (err: any) {
      console.error('Failed to delete activity:', err);
      setError('Failed to delete activity');
    }
  };

  if (loading) return <div className="text-center">Loading...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="container">
      <h1>My Activities</h1>
      
      <ul className="nav nav-tabs mb-3">
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'created' ? 'active' : ''}`}
            onClick={() => setActiveTab('created')}
          >
            Activities I Created
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'registered' ? 'active' : ''}`}
            onClick={() => setActiveTab('registered')}
          >
            Activities I Registered For
          </button>
        </li>
      </ul>
      
      <div className="tab-content">
        {activeTab === 'created' && (
          <div>
            <div className="mb-3">
              <Link to="/create-activity" className="btn btn-primary">
                Create New Activity
              </Link>
            </div>
            
            {createdActivities.length === 0 ? (
              <p>You haven't created any activities yet.</p>
            ) : (
              <div className="list-group">
                {createdActivities.map(activity => (
                  <div className="list-group-item" key={activity.id}>
                    <div className="d-flex w-100 justify-content-between">
                      <h5 className="mb-1">{activity.title}</h5>
                      <small>{new Date(activity.date).toLocaleDateString()}</small>
                    </div>
                    <p className="mb-1">
                      {activity.description.substring(0, 100)}
                      {activity.description.length > 100 ? '...' : ''}
                    </p>
                    <small>
                      Location: {activity.location} | 
                      Registrations: {activity.registrationsCount || 0}
                    </small>
                    <div className="mt-2">
                      <Link 
                        to={`/activities/${activity.id}`} 
                        className="btn btn-sm btn-info me-2"
                      >
                        View Details
                      </Link>
                      <button 
                        className="btn btn-sm btn-danger" 
                        onClick={() => handleDeleteActivity(activity.id)}
                      >
                        Delete Activity
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'registered' && (
          <div>
            {registeredActivities.length === 0 ? (
              <p>You haven't registered for any activities yet.</p>
            ) : (
              <div className="list-group">
                {registeredActivities.map(activity => (
                  <div className="list-group-item" key={activity.id}>
                    <div className="d-flex w-100 justify-content-between">
                      <h5 className="mb-1">{activity.title}</h5>
                      <small>{new Date(activity.date).toLocaleDateString()}</small>
                    </div>
                    <p className="mb-1">
                      {activity.description.substring(0, 100)}
                      {activity.description.length > 100 ? '...' : ''}
                    </p>
                    <small>
                      Location: {activity.location} | 
                      Created by: {activity.creatorUserName || 'Unknown'}
                    </small>
                    <div className="mt-2">
                      <Link 
                        to={`/activities/${activity.id}`} 
                        className="btn btn-sm btn-info"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyActivities;