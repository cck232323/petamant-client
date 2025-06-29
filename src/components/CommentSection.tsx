
// export default CommentSection;
import React, { useState, useRef } from 'react';
import { AuthService } from '../api/authService';
import { CommentService } from '../api/commentService';
import { Activity } from '../models/activity';
import { useNavigate } from 'react-router-dom';

interface Comment {
  id: number;
  activityId: number;
  userId: number;
  content: string;
  userName: string;
  createdAt: string;
  user?: {
    id: number;
    userName: string;
    email: string;
  };
  parentCommentId: number | null;
  replyToUserId: number | null;
  replyToUserName: string | null;
  replies: Comment[];
  rating?: number;
  date?: string;
}

const adaptComments = (comments: any[]): Comment[] => {
  return comments.map(comment => ({
    id: comment.id,
    activityId: comment.activityId,
    userId: comment.userId,
    content: comment.content,
    userName: comment.userName || 'Anonymous User',
    createdAt: comment.createdAt || comment.date || new Date().toISOString(),
    user: comment.user,
    parentCommentId: comment.parentCommentId || null,
    replyToUserId: comment.replyToUserId || null,
    replyToUserName: comment.replyToUserName || null,
    replies: comment.replies ? adaptComments(comment.replies) : [],
    rating: comment.rating,
    date: comment.date
  }));
};

interface ReplyBoxProps {
  activityId: number;
  parentComment: Comment;
  onReplySuccess: () => void;
}

const ReplyBox: React.FC<ReplyBoxProps> = ({ activityId, parentComment, onReplySuccess }) => {
  const [replyText, setReplyText] = useState('');
  const [replyRating, setReplyRating] = useState(5);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const isAuthenticated = AuthService.isAuthenticated();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login', { state: { returnUrl: `/activities/${activityId}` } });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const userId = AuthService.getUserId();
      const userName = AuthService.getUserName();
      if (!token || !userId) throw new Error('Authentication failed');

      const commentData = {
        activityId,
        userId,
        userName: userName || 'Anonymous User',
        content: replyText,
        rating: replyRating,
        parentCommentId: parentComment.id,
        replyToUserId: parentComment.userId,
        replyToUserName: parentComment.userName
      };

      await CommentService.createComment(commentData);
      setReplyText('');
      setReplyRating(5);
      onReplySuccess();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-3">
      <textarea
        className="form-control mb-2"
        rows={2}
        value={replyText}
        onChange={e => setReplyText(e.target.value)}
        placeholder={`Reply to @${parentComment.userName}`}
        required
      />
      {/* <select
        className="form-select mb-2"
        value={replyRating}
        onChange={e => setReplyRating(parseInt(e.target.value))}
      >
        {[1, 2, 3, 4, 5].map(r => (
          <option key={r} value={r}>{r} Stars</option>
        ))}
      </select> */}
      <button className="btn btn-sm btn-primary" type="submit" disabled={loading}>
        {loading ? 'Submitting...' : 'Submit Reply'}
      </button>
    </form>
  );
};

interface CommentSectionProps {
  activity: Activity;
  show: boolean;
  toggle: () => void;
  comments: any[];
  onCommentSuccess: () => void;
}

const CommentSection: React.FC<CommentSectionProps> = ({ activity, show, toggle, comments, onCommentSuccess }) => {
  const navigate = useNavigate();
  const isAuthenticated = AuthService.isAuthenticated();
  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [loading, setLoading] = useState(false);
  const [replyBoxId, setReplyBoxId] = useState<number | null>(null);
  const adaptedComments = adaptComments(comments);
  const topLevelComments = adaptedComments.filter(c => !c.parentCommentId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login', { state: { returnUrl: `/activities/${activity.id}` } });
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const userId = AuthService.getUserId();
      const userName = AuthService.getUserName();
      if (!token || !userId) throw new Error('Authentication failed');

      const commentData = {
        activityId: activity.id,
        userId,
        userName: userName || 'Anonymous User',
        content: newComment,
        rating: newRating,
        parentCommentId: null,
        replyToUserId: null,
        replyToUserName: null
      };

      await CommentService.createComment(commentData);
      setNewComment('');
      setNewRating(5);
      onCommentSuccess();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4">
      <div className="d-flex align-items-center mb-3">
        <h4 className="mb-0 me-2">Comments</h4>
        <button className="btn btn-sm btn-outline-secondary" onClick={toggle}>
          {show ? 'Hide' : 'Show'} ({comments.length})
        </button>
      </div>

      {show && (
        <>
          {topLevelComments.length === 0 ? (
            <p>No comments yet.</p>
          ) : (
            <ul className="list-group">
              {topLevelComments.map(comment => (
                <li className="list-group-item" key={comment.id}>
                  <div className="d-flex justify-content-between">
                    <div>
                      <strong>@{comment.userName}</strong> 
                    </div>
                    <small>{new Date(comment.createdAt).toLocaleString()}</small>
                  </div>
                  <p>{comment.content}</p>
                  <button className="btn btn-sm btn-outline-primary" onClick={() => setReplyBoxId(comment.id)}>
                    Reply
                  </button>
                  {replyBoxId === comment.id && (
                    <ReplyBox
                      activityId={activity.id}
                      parentComment={comment}
                      onReplySuccess={() => {
                        setReplyBoxId(null);
                        onCommentSuccess();
                      }}
                    />
                  )}

                  {comment.replies.length > 0 && (
                    <ul className="list-group mt-3 ms-4">
                      {comment.replies.map(reply => (
                        <li className="list-group-item" key={reply.id}>
                          <div className="d-flex justify-content-between">
                            <div>
                              <strong>@{reply.userName}</strong> → @{reply.replyToUserName}
                            </div>
                            <small>{new Date(reply.createdAt).toLocaleString()}</small>
                          </div>
                          <p>{reply.content}</p>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          )}

          <form onSubmit={handleSubmit} className="mt-4">
            <h5>Leave a comment</h5>
            <textarea
              className="form-control mb-2"
              rows={3}
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              placeholder="Share your thoughts..."
              required
            />
            <select
              className="form-select mb-2"
              value={newRating}
              onChange={e => setNewRating(parseInt(e.target.value))}
            >
              {[1, 2, 3, 4, 5].map(r => (
                <option key={r} value={r}>{r} Stars</option>
              ))}
            </select>
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Comment'}
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default CommentSection;