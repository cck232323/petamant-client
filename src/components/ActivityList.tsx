import React, { useEffect, useState } from 'react';
import { Activity } from '../models/activity';
import { ActivityService } from '../api/activityService';
import { Link } from 'react-router-dom';

const ActivityList: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const data = await ActivityService.getAllActivities();
        setActivities(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load activities');
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  if (loading) return <div className="text-center">Loading...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="container mt-4">
      <h2>Pet Activities</h2>
      <div className="row">
        {activities.length === 0 ? (
          <div className="col-12">
            <p>No activities found.</p>
          </div>
        ) : (
          activities.map(activity => (
            <div className="col-md-4 mb-4" key={activity.id}>
              <div className="card h-100">
                <div className="card-body">
                  <h5 className="card-title">{activity.title}</h5>
                  <h6 className="card-subtitle mb-2 text-muted">
                    {new Date(activity.date).toLocaleDateString()}
                  </h6>
                  <p className="card-text">
                    {activity.description.substring(0, 100)}
                    {activity.description.length > 100 ? '...' : ''}
                  </p>
                  <p className="card-text">
                    <small className="text-muted">
                      Location: {activity.location} | 
                      Registrations: {activity.registrationsCount}
                    </small>
                  </p>
                </div>
                <div className="card-footer">
                  <Link to={`/activities/${activity.id}`} className="btn btn-primary">
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ActivityList;