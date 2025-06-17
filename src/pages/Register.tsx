import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../api/authService';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    // 添加这段代码来检查注册数据
    const registerData = {
      email,
      userName,
      password
    };
    console.log('发送的注册数据:', registerData);
    
    setLoading(true);

    try {
      await AuthService.register(registerData);
      navigate('/activities');
    } catch (err: any) {
      console.error('注册错误:', err);
      
      // 处理不同类型的错误响应
      if (err.response) {
        // 服务器响应了错误状态码
        console.log('错误响应数据:', err.response.data);
        console.log('错误响应状态:', err.response.status);
        console.log('错误响应头:', err.response.headers);
        
        if (err.response.data && typeof err.response.data === 'object') {
          // 处理 ASP.NET Core ModelState 错误
          if (err.response.data.errors) {
            const errorMessages = [];
            for (const key in err.response.data.errors) {
              errorMessages.push(...err.response.data.errors[key]);
            }
            setError(errorMessages.join(', '));
          } 
          // 处理自定义错误消息
          else if (err.response.data.message) {
            setError(err.response.data.message);
          }
          // 其他错误情况
          else {
            setError(JSON.stringify(err.response.data));
          }
        } else if (typeof err.response.data === 'string') {
          setError(err.response.data);
        } else {
          setError(`Registration failed with status: ${err.response.status}`);
        }
      } else if (err.request) {
        // 请求已发送但没有收到响应
        setError('No response received from server. Please try again later.');
      } else {
        // 设置请求时发生了错误
        setError(`Error: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-6">
        <div className="card">
          <div className="card-header">
            <h3 className="text-center">Register</h3>
          </div>
          <div className="card-body">
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleSubmit}>
              {/* 表单内容保持不变 */}
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="userName">Username</label>
                <input
                  type="text"
                  className="form-control"
                  id="userName"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  className="form-control"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  type="password"
                  className="form-control"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary btn-block mt-3"
                disabled={loading}
              >
                {loading ? 'Registering...' : 'Register'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;