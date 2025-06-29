import React from 'react';

interface ActivityHeaderProps {
  title: string;
  isCreator: boolean;
  onDelete: () => void;
}

const ActivityHeader: React.FC<ActivityHeaderProps> = ({ title, isCreator, onDelete }) => (
  <div className="card-header d-flex justify-content-between align-items-center">
    <h2>{title}</h2>
    {isCreator && (
      <div>
        <button className="btn btn-danger ml-2" onClick={onDelete}>
          Delete Activity
        </button>
      </div>
    )}
  </div>
);

export default ActivityHeader;