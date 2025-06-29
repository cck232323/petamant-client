// import React, { useEffect, useState } from 'react';
// import { useParams, useNavigate, Link } from 'react-router-dom';
// import { ActivityService } from '../api/activityService';
// import { AuthService } from '../api/authService';
// import { Activity } from '../models/activity';
// import { CommentService } from '../api/commentService';
// import { User } from '../models/user';
// const ActivityDetail: React.FC = () => {
//   const { id } = useParams<{ id: string }>();
//   const navigate = useNavigate();
//   const [activity, setActivity] = useState<Activity | null>(null);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);
//   const [isRegistered, setIsRegistered] = useState(false);
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [showRegistrations, setShowRegistrations] = useState(false);
//   const [showComments, setShowComments] = useState(false);
//   const [newComment, setNewComment] = useState('');
//   const [newRating, setNewRating] = useState(5);  // 默认评分为5
//   const [submittingComment, setSubmittingComment] = useState(false);

//   useEffect(() => {
//     const fetchComments = async () => {
//       if (activity && activity.id) {
//         try {
//           const activitycomments = await ActivityService.getUserComments(activity.id);
//           console.log("Fetched comments:", activitycomments);
//         } catch (err) {
//         }
//       }
//     };
//     fetchComments();
//   }, [activity]);

//   useEffect(() => {
//     AuthService.ensureAuthenticated();
//     setIsAuthenticated(AuthService.isAuthenticated());

//     console.log('Authentication status:', AuthService.isAuthenticated());
//     console.log('User ID:', AuthService.getUserId());
//   }, []);

//   useEffect(() => {
//     const fetchActivity = async () => {
//       if (!id) {
//         setLoading(false);
//         setError('No activity ID provided');
//         return null;
//       }

//       try {
//         const activityId = parseInt(id);
//         const data = await ActivityService.getActivityById(activityId);
//         console.log('Fetched activity data:', data);
//         setActivity(data);
//         const currentUserId = AuthService.getUserId();
      
//         const isCreator = currentUserId && data.creatorUserId === currentUserId;
        
//         if (isCreator) {
//           setIsRegistered(true);
//           console.log('User is the creator of this activity, automatically marked as registered');
//         } else 
//         if (AuthService.isAuthenticated()) {
//           const userId = AuthService.getUserId();

//           if (userId) {
//             try {
//               console.log('Fetching user registered activities, User ID:', userId);
//               const userRegisteredActivities = await ActivityService.getUserRegisteredActivities(userId);
//               console.log('User registered activities:', userRegisteredActivities);

//               setIsRegistered(userRegisteredActivities.some(activity => activity.id === activityId));
//             } catch (regErr: any) {
//               console.error('Failed to get user registered activities:', regErr);

//               if (regErr.response && regErr.response.status === 404) {
//                 console.warn('Registration API might not exist, assuming user is not registered');
//                 setIsRegistered(false);
//               } else {
//                 console.error(`Failed to check registration status: ${regErr.message}`);
//                 setIsRegistered(false);
//               }
//             }
//           } else {
//             console.warn('User is authenticated but no userId, trying to fix auth state');
//             const sessionUserId = sessionStorage.getItem('userId');
//             if (sessionUserId) {
//               localStorage.setItem('userId', sessionUserId);
//               try {
//                 const userRegisteredActivities = await ActivityService.getUserRegisteredActivities(parseInt(sessionUserId));
//                 setIsRegistered(userRegisteredActivities.some(activity => activity.id === activityId));
//               } catch (regErr) {
//                 console.error('Failed to get user registered activities with session ID:', regErr);
//                 setIsRegistered(false);
//               }
//             } else {
//               setIsRegistered(false);
//               setIsAuthenticated(false);
//             }
//           }
//         }
//       } catch (err: any) {
//         console.error('Failed to load activity details:', err);
//         setError('Failed to load activity details');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchActivity();
//   }, [id]);

//   const handleDelete = async () => {
//     if (!activity || !window.confirm('Are you sure you want to delete this activity?')) {
//       return;
//     }
    
//     try {
//       await ActivityService.deleteActivity(activity.id);
//       navigate('/activities');
//     } catch (err) {
//       setError('Failed to delete activity');
//     }
//   };

//   const handleRegisterClick = () => {
//     if (!id) return;
    
//     if (!isAuthenticated) {
//       sessionStorage.setItem('returnUrl', `/activities/${id}`);
//       navigate('/login');
//       return;
//     }
    
//     navigate(`/register-activity/${id}`);
//   };

//   const handleCommentSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
    
//     // 首先检查用户是否已登录
//     if (!AuthService.isAuthenticated()) {
//       setError('您需要登录才能提交评论');
//       setTimeout(() => {
//         navigate('/login', { state: { returnUrl: `/activities/${id}` } });
//       }, 2000);
//       return;
//     }
    
//     if (!activity || !newComment.trim()) {
//       return;
//     }
    
//     setSubmittingComment(true);
    
//     try {
//       const userId = AuthService.getUserId();
//       if (!userId) {
//         setError('用户未登录，无法提交评论');
//         return;
//       }
      
//       // 检查令牌是否存在
//       const token = localStorage.getItem('token');
//       if (!token) {
//         setError('认证令牌不存在，请重新登录');
//         setTimeout(() => {
//           navigate('/login', { state: { returnUrl: `/activities/${id}` } });
//         }, 2000);
//         return;
//       }
      
//       console.log('提交评论，使用令牌:', token.substring(0, 10) + '...');
      
//       const commentData = {
//         activityId: activity.id,
//         userId: userId,
//         userName: AuthService.getUserName() || '匿名用户',
//         content: newComment,
//         rating: newRating
//       };
//       console.log('提交评论的完整数据:', JSON.stringify(commentData, null, 2));
//       await CommentService.createComment(commentData);
      
//       setNewComment('');
//       setNewRating(5);
      
//       const updatedActivity = await ActivityService.getActivityById(activity.id);
//       setActivity(updatedActivity);
      
//       setShowComments(true);
//     } catch (err: any) {
//       console.error('提交评论失败:', err);
//       setError('提交评论失败: ' + (err.message || '未知错误'));
//     } finally {
//       setSubmittingComment(false);
//     }
//   };

//   if (loading) return <div className="text-center">Loading...</div>;
//   if (error) return <div className="alert alert-danger">{error}</div>;
//   if (!activity) return <div className="alert alert-warning">Activity not found</div>;

//   const registrations = activity.registrations || [];
//   const comments = activity.comments || [];
//   const currentUserId = AuthService.getUserId();
//   const currentUserName = AuthService.getUserName();
//   console.log('Current user ID:', currentUserId);
//   console.log('Current user name:', currentUserName);
//   const isCreator = activity?.creatorUserId === currentUserId;
  
//   return (
//     <div className="container mt-4">
//       <div className="card">
//         <div className="card-header d-flex justify-content-between align-items-center">
//           <h2>{activity.title}</h2>
//           {isCreator && (
//             <div>
//               <button className="btn btn-danger ml-2" onClick={handleDelete}>
//                 Delete Activity
//               </button>
//             </div>
//           )}
//         </div>
//         <div className="card-body">
//           <p className="lead">{activity.description}</p>
//           <div className="row">
//             <div className="col-md-6">
//               <p><strong>Date:</strong> {new Date(activity.date).toLocaleDateString()}</p>
//               <p><strong>Location:</strong> {activity.location}</p>
//               <p><strong>Created by:</strong> {activity.creatorUserName || 'Unknown'}</p>
//             </div>
//             <div className="col-md-6">
//               <p><strong>Registrations:</strong> {activity.registrationsCount || 0}</p>
//             </div>
//           </div>
          
//           {isAuthenticated ? (
//             isRegistered ? (
//               <div className="alert alert-success">
//                 You are registered for this activity!
//               </div>
//             ) : (
//               <div className="d-grid gap-2 col-6 mx-auto mt-3 mb-3">
//                 <button 
//                   className="btn btn-primary btn-lg" 
//                   onClick={handleRegisterClick}
//                 >
//                   Register for this Activity
//                 </button>
//               </div>
//             )
//           ) : (
//             <div className="alert alert-warning">
//               Please <Link to="/login">login</Link> to register for this activity.
//             </div>
//           )}
          
//           <div className="d-flex align-items-center mt-4">
//             <h4 className="mb-0 me-2">Registered Pets</h4>
//             <button 
//               className="btn btn-sm btn-outline-secondary d-flex align-items-center"
//               onClick={() => setShowRegistrations(!showRegistrations)}
//             >
//               <span className="me-1">{showRegistrations ? 'Hide' : 'Show'}</span>
//               <span className="badge bg-secondary me-1">{registrations.length}</span>
//               <i className={`bi bi-chevron-${showRegistrations ? 'up' : 'down'}`}></i>
//             </button>
//           </div>

//           {Array.isArray(registrations) && registrations.length > 0 ? (
//             <div className={`collapse ${showRegistrations ? 'show' : ''}`}>
//               <ul className="list-group">
//                 {registrations.map((reg: any, index: number) => {
//                   let petInfo = { name: '', type: '' };
//                   if (reg && reg.petInfo && typeof reg.petInfo === 'string') {
//                     try {
//                       petInfo = JSON.parse(reg.petInfo);
//                     } catch (e) {
//                       console.warn('Failed to parse pet info:', reg.petInfo);
//                     }
//                   }
                  
//                   const petName = petInfo.name || 'Unknown Pet';
//                   const petType = petInfo.type || 'Unknown Type';
                  
//                   return (
//                     <li className="list-group-item" key={reg?.id || `registration-${index}`}>
//                       <div className="d-flex justify-content-between align-items-center">
//                         <div>
//                           <strong>{petName}</strong> 
//                           <span className="badge bg-info ms-2">{petType}</span>
//                         </div>
//                       </div>
//                     </li>
//                   );
//                 })}
//               </ul>
//             </div>
//           ) : (
//             <p>No registrations yet.</p>
//           )}

//           <div className="d-flex align-items-center mt-4">
//             <h4 className="mb-0 me-2">Comments</h4>
//             <button 
//               className="btn btn-sm btn-outline-secondary d-flex align-items-center"
//               onClick={() => setShowComments(!showComments)}
//             >
//               <span className="me-1">{showComments ? 'Hide' : 'Show'}</span>
//               <span className="badge bg-secondary me-1">{comments.length}</span>
//               <i className={`bi bi-chevron-${showComments ? 'up' : 'down'}`}></i>
//             </button>
//           </div>
         
//           {Array.isArray(comments) && comments.length > 0 ? (
//             <div className={`collapse ${showComments ? 'show' : ''}`}>
//               <ul className="list-group">
//                 {comments.map((comment: any, index: number) => (
//                   <li className="list-group-item" key={comment?.id || `comment-${index}`}>
//                     <div className="d-flex justify-content-between align-items-center">
//                       <div>
//                         {/* <strong>{comment.userName || '匿名用户'}</strong> */}
                        
//                         <span className="badge bg-info ms-2">{comment.userName || '匿名用户'}</span>
//                         {comment.rating && <span className="badge bg-info ms-2">{comment.rating}分</span>}
//                       </div>
//                       <div>
//                         <small>{new Date(comment.createdAt || comment.date).toLocaleString()}</small>
//                       </div>
//                     </div>
//                     <p className="mt-2">{comment.content}</p>
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           ) : (
//             <p>No comments yet.</p>
//           )}
          
//           {isAuthenticated && (
//             <div className="mt-4">
//               {/* <h4>Add Comments</h4> */}
//               <form onSubmit={handleCommentSubmit}>
//                 <div className="mb-3">
//                   <div className="d-flex align-items-center mb-2">
//           <span className="me-2">Comment User:</span>
//           <span className="badge bg-primary">{AuthService.getUserName() || '匿名用户'}</span>
//         </div>
//                   <textarea 
//                     className="form-control" 
//                     rows={3} 
//                     value={newComment} 
//                     onChange={(e) => setNewComment(e.target.value)} 
//                     placeholder="please add your comment here..."
//                     required
//                   />
//                 </div>
//                 <div className="mb-3">
//                   <label htmlFor="rating" className="form-label">score:</label>
//                   <select 
//                     className="form-select" 
//                     id="rating" 
//                     value={newRating} 
//                     onChange={(e) => setNewRating(parseInt(e.target.value))}
//                   >
//                     {[1, 2, 3, 4, 5].map((rating) => (
//                       <option key={rating} value={rating}>{rating}</option>
//                     ))}
//                   </select>
//                 </div>
//                 <button 
//                   type="submit" 
//                   className="btn btn-primary" 
//                   disabled={submittingComment}
//                 >
//                   {submittingComment ? '提交中...' : '提交评论'}
//                 </button>
//               </form>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ActivityDetail;

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