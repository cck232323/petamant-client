import axios from 'axios';

// 创建 axios 实例
const axiosInstance = axios.create({
  baseURL: '/api', // 确保这里的基础URL与Vite代理配置匹配
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000 // 10秒超时
});

// 请求拦截器 - 添加认证 token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    // 调试日志
    console.log('发送请求到:', config.url);
    console.log('请求方法:', config.method);
    console.log('当前token:', token);
    
    if (token) {
      // 确保 token 以 Bearer 前缀添加到 Authorization 头
      config.headers.Authorization = `Bearer ${token}`;
      console.log('已添加Authorization头:', `Bearer ${token.substring(0, 20)}...`);
    } else {
      console.warn('没有找到token，请求将不包含Authorization头');
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
axiosInstance.interceptors.response.use(
  (response) => {
    // 调试日志
    console.log('收到响应:', response.status, response.config.url);
    return response;
  },
  (error) => {
    // 处理401未授权错误
    if (error.response && error.response.status === 401) {
      console.warn('收到401未授权响应:', error.config.url);
      
      // 检查当前token
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('没有找到token，这可能是认证失败的原因');
      } else {
        console.log('认证失败，但token存在:', token.substring(0, 20) + '...');
        
        // 检查token是否为临时token
        if (token.startsWith('temp-token-')) {
          console.error('检测到临时token导致的认证失败，清除临时token');
          localStorage.removeItem('token');
          sessionStorage.removeItem('token');
        }
      }
      
      // 对于登录和注册请求，不做特殊处理
      if (error.config.url.includes('/users/login') || 
          error.config.url.includes('/users/register')) {
        return Promise.reject(error);
      }
      
      // 对于活动注册请求，记录错误但不清除用户ID
      if (error.config.url.includes('/registrations')) {
        console.log('活动注册请求失败，可能需要重新登录获取有效token');
        
        // 保存当前页面URL，以便登录后返回
        sessionStorage.setItem('returnUrl', window.location.pathname);
        
        // 可以在这里触发重定向到登录页面
        // window.location.href = '/login';
      } else {
        // 对于其他请求，清除所有认证信息
        console.warn('认证失败，清除认证信息');
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('userId');
      }
    }
    
    // 处理验证错误
    if (error.response && error.response.status === 400 && error.response.data.errors) {
      const validationErrors = error.response.data.errors;
      let errorMessage = 'Validation errors:';
      
      for (const key in validationErrors) {
        if (Object.prototype.hasOwnProperty.call(validationErrors, key)) {
          errorMessage += `\n- ${validationErrors[key].join(', ')}`;
        }
      }
      
      console.error(errorMessage);
    }
    
    return Promise.reject(error);
  }
);

// 添加一个辅助函数，检查token是否是有效的JWT格式
export function isValidJwtToken(token: string) {
  if (!token) return false;
  
  // JWT token通常由三部分组成，用点分隔：header.payload.signature
  const parts = token.split('.');
  console.log('检查JWT token格式:', parts);
  if (parts.length !== 3) {
    return false;
  }
  
  // 尝试解码每个部分，确保它们是有效的base64编码
  try {
    // 注意：这只是检查格式，不验证签名
    atob(parts[0].replace(/-/g, '+').replace(/_/g, '/'));
    atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
    // 第三部分是签名，不需要解码
    return true;
  } catch (e) {
    return false;
  }
}

export default axiosInstance;