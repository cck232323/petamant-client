// import React, { useState, useRef } from 'react';
// import { AuthService } from '../api/authService';
// import { CommentService } from '../api/commentService';
// import { Activity } from '../models/activity';
// import { useNavigate } from 'react-router-dom';

// interface Comment {
//   id: number;
//   activityId: number;
//   userId: number;
//   content: string;
//   userName: string;
//   createdAt: string;
//   user?: {
//     id: number;
//     userName: string;
//     email: string;
//   };
//   parentCommentId: number | null;
//   replyToUserId: number | null;
//   replyToUserName: string | null;
//   replies: Comment[];
//   rating?: number;
//   date?: string;
// }

// const adaptComments = (comments: any[]): Comment[] => {
//   return comments.map(comment => ({
//     id: comment.id,
//     activityId: comment.activityId,
//     userId: comment.userId,
//     content: comment.content,
//     userName: comment.userName || 'Anonymous User',
//     createdAt: comment.createdAt || comment.date || new Date().toISOString(),
//     user: comment.user,
//     parentCommentId: comment.parentCommentId || null,
//     replyToUserId: comment.replyToUserId || null,
//     replyToUserName: comment.replyToUserName || null,
//     replies: comment.replies ? adaptComments(comment.replies) : [],
//     rating: comment.rating,
//     date: comment.date
//   }));
// };

// interface CommentSectionProps {
//   activity: Activity;
//   show: boolean;
//   toggle: () => void;
//   comments: any[];
//   onCommentSuccess: () => void;
// }

// const CommentSection: React.FC<CommentSectionProps> = ({ 
//   activity, 
//   show, 
//   toggle, 

//   comments, 
//   onCommentSuccess 
// }) => {
//   const navigate = useNavigate();
//   const [newComment, setNewComment] = useState('');
//   const [newRating, setNewRating] = useState(5);
//   const [submittingComment, setSubmittingComment] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [replyingTo, setReplyingTo] = useState<{commentId: number, userName: string, userId: number} | null>(null);
//   const commentTextareaRef = useRef<HTMLTextAreaElement>(null);
//   const isAuthenticated = AuthService.isAuthenticated();

//   const adaptedComments = adaptComments(comments);

//   const organizedComments = adaptedComments.filter(comment => !comment.parentCommentId);

//   const handleCommentSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
    
//     if (!isAuthenticated) {
//       setError('You need to be logged in to submit a comment');
//       setTimeout(() => {
//         navigate('/login', { state: { returnUrl: `/activities/${activity.id}` } });
//       }, 2000);
//       return;
//     }
    
//     if (!newComment.trim()) {
//       return;
//     }
    
//     setSubmittingComment(true);
    
//     try {
//       const userId = AuthService.getUserId();
//       if (!userId) {
//         setError('User not logged in, cannot submit comment');
//         return;
//       }
      
//       const token = localStorage.getItem('token');
//       if (!token) {
//         setError('Authentication token does not exist, please log in again');
//         setTimeout(() => {
//           navigate('/login', { state: { returnUrl: `/activities/${activity.id}` } });
//         }, 2000);
//         return;
//       }
      
//       const commentData = {
//         activityId: activity.id,
//         userId: userId,
//         userName: AuthService.getUserName() || 'Anonymous User',
//         content: newComment,
//         rating: newRating,
//         parentCommentId: replyingTo?.commentId || null,
//         replyToUserId: replyingTo?.userId || null,
//         replyToUserName: replyingTo?.userName || null
//       };
      
//       await CommentService.createComment(commentData);
      
//       setNewComment('');
//       setNewRating(5);
//       setReplyingTo(null);
//       onCommentSuccess();
//     } catch (err: any) {
//       console.error('Failed to submit comment:', err);
//       setError('Failed to submit comment: ' + (err.message || 'Unknown error'));
//     } finally {
//       setSubmittingComment(false);
//     }
//   };

//   const handleReply = (commentId: number, userName: string, userId: number) => {
//     setReplyingTo({ commentId, userName, userId });
//     setNewComment(`@${userName} `);
//     if (!show) {
//       toggle();
//     }
    
//     // 使用setTimeout确保DOM已更新
//     setTimeout(() => {
//       // 滚动到评论框并设置焦点
//       if (commentTextareaRef.current) {
//         commentTextareaRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
//         commentTextareaRef.current.focus();
//       }
//     }, 100);
//   };


//   const cancelReply = () => {
//     setReplyingTo(null);
//     setNewComment('');
//   };

//   const CommentItem = ({ comment }: { comment: Comment }) => (
//     <li className="list-group-item">
//       <div className="d-flex justify-content-between align-items-center">
//         <div>
//           <span className="badge bg-info ms-2">{comment.userName || 'Anonymous'}</span>
//           {comment.rating && <span className="badge bg-info ms-2">{comment.rating} stars</span>}
//           {comment.replyToUserName && (
//             <span className="text-muted ms-2">replying to @{comment.replyToUserName}</span>
//           )}
//         </div>
//         <div>
//           <small>{new Date(comment.createdAt || comment.date || '').toLocaleString()}</small>
//         </div>
//       </div>
//       <p className="mt-2">{comment.content}</p>
      
//       {isAuthenticated && (
//         <button 
//           className="btn btn-sm btn-outline-primary mt-1"
//           onClick={() => handleReply(comment.id, comment.userName, comment.userId)}
//         >
//           Reply
//         </button>
//       )}
      
//       {comment.replies && comment.replies.length > 0 && (
//         <ul className="list-group mt-3 ms-4">
//           {comment.replies.map(reply => (
//             <CommentItem key={reply.id} comment={reply} />
//           ))}
//         </ul>
//       )}
//     </li>
//   );

//   return (
//     <>
//       <div className="d-flex align-items-center mt-4">
//         <h4 className="mb-0 me-2">Comments</h4>
//         <button 
//           className="btn btn-sm btn-outline-secondary d-flex align-items-center"
//           onClick={toggle}
//         >
//           <span className="me-1">{show ? 'Hide' : 'Show'}</span>
//           <span className="badge bg-secondary me-1">{comments.length}</span>
//           <i className={`bi bi-chevron-${show ? 'up' : 'down'}`}></i>
//         </button>
//       </div>
      
//       {Array.isArray(comments) && comments.length > 0 ? (
//         <div className={`collapse ${show ? 'show' : ''}`}>
//           <ul className="list-group">
//             {organizedComments.map((comment) => (
//               <CommentItem key={comment.id} comment={comment} />
//             ))}
//           </ul>
//         </div>
//       ) : (
//         <p>No comments yet.</p>
//       )}
      
//       {isAuthenticated && (
//         <div className="mt-4">
//           {error && <div className="alert alert-danger">{error}</div>}
//           <form onSubmit={handleCommentSubmit}>
//             {replyingTo && (
//               <div className="alert alert-info d-flex justify-content-between align-items-center">
//                 <span>Replying to @{replyingTo.userName}</span>
//                 <button 
//                   type="button" 
//                   className="btn-close" 
//                   onClick={cancelReply}
//                   aria-label="Close"
//                 ></button>
//               </div>
//             )}
//             <div className="mb-3">
//               <div className="d-flex align-items-center mb-2">
//                 <span className="me-2">Comment User:</span>
//                 <span className="badge bg-primary">{AuthService.getUserName() || 'Anonymous User'}</span>
//               </div>
//               <textarea 
//                 className="form-control" 
//                 rows={3} 
//                 value={newComment} 
//                 onChange={(e) => setNewComment(e.target.value)} 
//                 placeholder="Please add your comment here..."
//                 required
//                 ref={commentTextareaRef}
//               />
//             </div>
//             <div className="mb-3">
//               <label htmlFor="rating" className="form-label">Score:</label>
//               <select 
//                 className="form-select" 
//                 id="rating" 
//                 value={newRating} 
//                 onChange={(e) => setNewRating(parseInt(e.target.value))}
//               >
//                 {[1, 2, 3, 4, 5].map((rating) => (
//                   <option key={rating} value={rating}>{rating}</option>
//                 ))}
//               </select>
//             </div>
//             <button 
//               type="submit" 
//               className="btn btn-primary" 
//               disabled={submittingComment}
//             >
//               {submittingComment ? 'Submitting...' : 'Submit Comment'}
//             </button>
//           </form>
//         </div>
//       )}
//     </>
//   );
// };

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