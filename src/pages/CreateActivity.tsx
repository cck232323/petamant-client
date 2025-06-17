import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ActivityService } from '../api/activityService';
import { AuthService } from '../api/authService';

const CreateActivity: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // 获取当前用户ID和用户名
      const userId = AuthService.getUserId();
      
      if (!userId) {
        setError('You must be logged in to create an activity');
        setLoading(false);
        return;
      }
      let formattedDate = date;
      try {
        // 将本地日期时间转换为ISO字符串（UTC格式）
        const dateObj = new Date(date);
        formattedDate = dateObj.toISOString();
        console.log('原始日期:', date);
        console.log('格式化后的UTC日期:', formattedDate);
      } catch (dateErr) {
        console.error('日期格式化错误:', dateErr);
        setError('Invalid date format. Please check the date and try again.');
        setLoading(false);
        return;
      }
      const newActivity = {
        title,
        description,
        date: formattedDate,
        location,
        creatorUserId: userId,
        creatorUserName: '', // 这个可能需要从用户信息中获取，或者由后端填充
        registrationsCount: 0, // 新活动初始注册数为0
        creator: { id: userId, userName: '', email: '' } // 简化的creator对象
      };
      console.log('发送创建活动请求:', newActivity);
      await ActivityService.createActivity(newActivity);
      navigate('/activities');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create activity. Please try again.');
      console.error('创建活动错误:', err);
      if (err.response) {
        console.error('错误响应:', err.response.data);
        
        // 检查是否有详细的验证错误
        if (err.response.data && err.response.data.errors) {
          const errorMessages = [];
          for (const key in err.response.data.errors) {
            errorMessages.push(...err.response.data.errors[key]);
          }
          setError(errorMessages.join(', '));
        } else if (err.response.data && err.response.data.message) {
          setError(err.response.data.message);
        } else if (err.response.data && typeof err.response.data === 'string') {
          setError(err.response.data);
        } else {
          setError('Failed to create activity. Please try again.');
        }
      } else {
        setError('Failed to create activity. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-8">
        <div className="card">
          <div className="card-header">
            <h3 className="text-center">Create New Activity</h3>
          </div>
          <div className="card-body">
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="title">Title</label>
                <input
                  type="text"
                  className="form-control"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  className="form-control"
                  id="description"
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                ></textarea>
              </div>
              <div className="form-group">
                <label htmlFor="date">Date</label>
                <input
                  type="datetime-local"
                  className="form-control"
                  id="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="location">Location</label>
                <input
                  type="text"
                  className="form-control"
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                />
              </div>
              <button 
                type="submit" 
                className="btn btn-primary mt-3"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Activity'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateActivity;