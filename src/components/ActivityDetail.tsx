

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ActivityService } from '../api/activityService';
import { AuthService } from '../api/authService';
import { Activity } from '../models/activity';
import ActivityHeader from './ActivityHeader';
import ActivityInfo from './ActivityInfo';
import RegistrationList from './RegistrationList';
import CommentSection from './CommentSection';

const ActivityDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showRegistrations, setShowRegistrations] = useState(false);
  const [showComments, setShowComments] = useState(false);

  useEffect(() => {
    const fetchComments = async () => {
      if (activity && activity.id) {
        try {
          await ActivityService.getUserComments(activity.id);
        } catch (err) {}
      }
    };
    fetchComments();
  }, [activity]);

  useEffect(() => {
    AuthService.ensureAuthenticated();
    setIsAuthenticated(AuthService.isAuthenticated());
  }, []);

  useEffect(() => {
    const fetchActivity = async () => {
      if (!id) {
        setLoading(false);
        setError('No activity ID provided');
        return;
      }

      try {
        const activityId = parseInt(id);
        const data = await ActivityService.getActivityById(activityId);
        setActivity(data);
        const currentUserId = AuthService.getUserId();
        const isCreator = currentUserId && data.creatorUserId === currentUserId;

        if (isCreator) {
          setIsRegistered(true);
        } else if (AuthService.isAuthenticated()) {
          const userId = AuthService.getUserId();
          if (userId) {
            try {
              const userRegisteredActivities = await ActivityService.getUserRegisteredActivities(userId);
              setIsRegistered(userRegisteredActivities.some(activity => activity.id === activityId));
            } catch (regErr: any) {
              setIsRegistered(false);
            }
          } else {
            const sessionUserId = sessionStorage.getItem('userId');
            if (sessionUserId) {
              localStorage.setItem('userId', sessionUserId);
              try {
                const userRegisteredActivities = await ActivityService.getUserRegisteredActivities(parseInt(sessionUserId));
                setIsRegistered(userRegisteredActivities.some(activity => activity.id === activityId));
              } catch {
                setIsRegistered(false);
              }
            } else {
              setIsRegistered(false);
              setIsAuthenticated(false);
            }
          }
        }
      } catch (err: any) {
        setError('Failed to load activity details');
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, [id]);

  const handleDelete = async () => {
    if (!activity || !window.confirm('Are you sure you want to delete this activity?')) return;
    try {
      await ActivityService.deleteActivity(activity.id);
      navigate('/activities');
    } catch {
      setError('Failed to delete activity');
    }
  };

  const handleRegisterClick = () => {
    if (!id) return;
    if (!isAuthenticated) {
      sessionStorage.setItem('returnUrl', `/activities/${id}`);
      navigate('/login');
      return;
    }
    navigate(`/register-activity/${id}`);
  };

  if (loading) return <div className="text-center">Loading...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!activity) return <div className="alert alert-warning">Activity not found</div>;

  const isCreator = activity.creatorUserId === AuthService.getUserId();

  return (
    <div className="container mt-4">
      <div className="card">
        <ActivityHeader 
          title={activity.title} 
          isCreator={isCreator} 
          onDelete={handleDelete} 
        />
        <div className="card-body">
          <ActivityInfo activity={activity} />

          {isAuthenticated ? (
            isRegistered ? (
              <div className="alert alert-success">You are registered for this activity!</div>
            ) : (
              <div className="d-grid gap-2 col-6 mx-auto mt-3 mb-3">
                <button className="btn btn-primary btn-lg" onClick={handleRegisterClick}>
                  Register for this Activity
                </button>
              </div>
            )
          ) : (
            <div className="alert alert-warning">
              Please <Link to="/login">login</Link> to register for this activity.
            </div>
          )}

          <RegistrationList
            show={showRegistrations}
            toggle={() => setShowRegistrations(!showRegistrations)}
            registrations={activity.registrations || []}
          />

          <CommentSection
            activity={activity}
            show={showComments}
            toggle={() => setShowComments(!showComments)}
            comments={activity.comments || []}
            onCommentSuccess={async () => {
              const updated = await ActivityService.getActivityById(activity.id);
              setActivity(updated);
              setShowComments(true);
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default ActivityDetail;