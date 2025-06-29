import React from 'react';
import { Activity } from '../models/activity';

interface ActivityInfoProps {
  activity: Activity;
}

const ActivityInfo: React.FC<ActivityInfoProps> = ({ activity }) => (
  <>
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
  </>
);

export default ActivityInfo;