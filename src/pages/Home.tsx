import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../api/authService';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const isAuthenticated = AuthService.isAuthenticated();
  
  // 登录表单状态
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);
  
  // 注册表单状态
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);

  // 如果用户已登录，直接重定向到活动页面
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/activities');
    }
  }, [isAuthenticated, navigate]);

  // 处理登录
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);
    
    try {
      await AuthService.login({ email: loginEmail, password: loginPassword });
      navigate('/activities');
    } catch (err: any) {
      console.error('登录错误:', err);
      if (err.response && err.response.data) {
        setLoginError(err.response.data.message || '登录失败，请检查邮箱和密码');
      } else {
        setLoginError('登录失败，请稍后再试');
      }
    } finally {
      setLoginLoading(false);
    }
  };

  // 处理注册
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError(null);
    setRegisterLoading(true);
    setRegisterSuccess(false);
    
    try {
      await AuthService.register({
        email: registerEmail,
        userName: registerUsername,
        password: registerPassword
      });
      
      setRegisterSuccess(true);
      setLoginEmail(registerEmail); // 自动填充登录表单的邮箱
      
      // 清空注册表单
      setRegisterEmail('');
      setRegisterUsername('');
      setRegisterPassword('');
    } catch (err: any) {
      console.error('注册错误:', err);
      if (err.response && err.response.data) {
        if (err.response.data.errors) {
          const errorMessages = [];
          for (const key in err.response.data.errors) {
            errorMessages.push(...err.response.data.errors[key]);
          }
          setRegisterError(errorMessages.join(', '));
        } else if (err.response.data.message) {
          setRegisterError(err.response.data.message);
        } else {
          setRegisterError('注册失败，请检查输入信息');
        }
      } else {
        setRegisterError('注册失败，请稍后再试');
      }
    } finally {
      setRegisterLoading(false);
    }
  };

  // 未登录用户显示登录和注册表单
  return (
    <div className="container mt-5">
      <div className="text-center">
        <h1 className="display-4">欢迎来到宠物活动聚合社交平台</h1>
        <p className="lead">在这里，您可以发现和参与各种宠物相关的活动。</p>
      </div>

      <div className="row mt-5">
        {/* 登录表单 */}
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h2>用户登录</h2>
            </div>
            <div className="card-body">
              {loginError && <div className="alert alert-danger">{loginError}</div>}
              <form onSubmit={handleLogin}>
                <div className="form-group mb-3">
                  <label htmlFor="email">邮箱</label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group mb-3">
                  <label htmlFor="password">密码</label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loginLoading}
                >
                  {loginLoading ? '登录中...' : '登录'}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* 注册表单 */}
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h2>新用户注册</h2>
            </div>
            <div className="card-body">
              {registerError && <div className="alert alert-danger">{registerError}</div>}
              {registerSuccess && <div className="alert alert-success">注册成功！请使用您的邮箱和密码登录。</div>}
              <form onSubmit={handleRegister}>
                <div className="form-group mb-3">
                  <label htmlFor="registerEmail">邮箱</label>
                  <input
                    type="email"
                    className="form-control"
                    id="registerEmail"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group mb-3">
                  <label htmlFor="username">用户名</label>
                  <input
                    type="text"
                    className="form-control"
                    id="username"
                    value={registerUsername}
                    onChange={(e) => setRegisterUsername(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group mb-3">
                  <label htmlFor="registerPassword">密码</label>
                  <input
                    type="password"
                    className="form-control"
                    id="registerPassword"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-success"
                  disabled={registerLoading}
                >
                  {registerLoading ? '注册中...' : '注册'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* 浏览活动按钮 */}
      <div className="text-center mt-4">
        <button 
          className="btn btn-info btn-lg" 
          onClick={() => navigate('/activities')}
        >
          直接浏览活动
        </button>
      </div>
    </div>
  );
};

export default Home;