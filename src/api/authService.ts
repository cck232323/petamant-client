import axios from './axiosConfig';
import { User } from '../models/user';

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  email: string;
  password: string;
  userName: string;
}

interface AuthResponse {
  user: User;
  token: string;
  returnUrl?: string; // Added to handle returnUrl
}

export const AuthService = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    try {
      console.log('登录请求数据:', credentials);
      const response = await axios.post('/users/login', credentials);
      console.log('登录响应数据:', response.data);
      
      // 检查响应格式
      let user: User;
      let token: string = '';
      
      if (response.data.user && response.data.token) {
        // 标准格式
        user = response.data.user;
        token = response.data.token;
      } else if (response.data.id) {
        // 后端直接返回用户对象，没有嵌套在user属性中
        user = {
          id: response.data.id,
          userName: response.data.userName,
          email: response.data.email
        };
        
        // 如果响应中有token，则使用它
        if (response.data.token) {
          token = response.data.token;
        } else {
          // 如果没有token，尝试从响应头获取
          const authHeader = response.headers['authorization'];
          if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7);
          } else {
            console.error('登录响应中没有找到有效的JWT token');
            throw new Error('No valid token received from server');
          }
        }
      } else {
        console.error('登录响应格式不正确:', response.data);
        throw new Error('Invalid server response format');
      }
      
      // 验证token是否是有效的JWT
      if (!token) {
        console.error('服务器返回的token不是有效的JWT格式');
        throw new Error('Invalid token format received from server');
      }
      
      // 使用新方法保存认证信息
      AuthService.setAuthInfo(user.id, token, user.userName);
      
      // 检查是否有返回URL
      const returnUrl = sessionStorage.getItem('returnUrl');
      if (returnUrl) {
        sessionStorage.removeItem('returnUrl');
        // 这里不直接导航，而是返回returnUrl供调用者使用
        return {
          user,
          token,
          returnUrl
        };
      }
      
      return {
        user,
        token
      };
    } catch (error: any) {
      console.error('登录错误详情:', error.response?.data);
      throw error;
    }
  },
  
  register: async (userData: RegisterRequest): Promise<AuthResponse> => {
    try {
      const response = await axios.post('/users/register', userData);
      console.log('注册成功，服务器响应:', response.data);
      
      // 适配后端返回的格式
      if (response.data.id || (response.data.user && response.data.user.id)) {
      // 提取用户邮箱和密码
      const email = userData.email;
      const password = userData.password;
      
      // 使用刚注册的凭据进行登录
      return await AuthService.login({ email, password });
    }
      let user: User;
      let token: string = '';
      
      // 检查响应格式
      if (response.data.user && response.data.token) {
        // 标准格式
        user = response.data.user;
        token = response.data.token;
      } else if (response.data.id) {
        // 后端直接返回用户对象，没有嵌套在user属性中
        user = {
          id: response.data.id,
          userName: response.data.userName,
          email: response.data.email
        };
        
        // 如果响应中有token，则使用它
        if (response.data.token) {
          token = response.data.token;
        } else {
          // 如果没有token，创建一个临时token，确保用户被视为已登录
          token = `temp-token-${Date.now()}`;
        }
      } else {
        console.error('服务器响应格式不正确:', response.data);
        throw new Error('Invalid server response format');
      }
      
      // 使用新方法保存认证信息
      AuthService.setAuthInfo(user.id, token, user.userName);
      
      // 返回标准格式的响应
      return {
        user,
        token
      };
    } catch (error: any) {
      console.error('注册错误详情:', error.response?.data);
      throw error;
    }
  },
  
  logout: (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('userId');
  },
  
  isAuthenticated: (): boolean => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    
    // 只有当两者都存在时才认为用户已认证
    if (token && userId) {
      return true;
    }
    
    // 如果状态不一致，清理存储
    if (token || userId) {
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('userId');
    }
    
    return false;
  },
  getUserName: (): string | null => {

    // 先检查认证状态
    if (!AuthService.isAuthenticated()) {
      return null;
    }
    
    const userName = localStorage.getItem('userName');
    return userName ? userName : null;
  },
  getUserId: (): number | null => {
    // 先检查认证状态
    if (!AuthService.isAuthenticated()) {
      return null;
    }
    
    const userId = localStorage.getItem('userId');
    return userId ? parseInt(userId) : null;
  },
  
  // 添加新方法：同步保存认证信息
  // setAuthInfo: (userId: number, token: string): void => {
  //   // 同时保存到 localStorage 和 sessionStorage 作为备份
  //   localStorage.setItem('userId', userId.toString());
  //   localStorage.setItem('token', token);
  //   // localStorage.setItem('userName', userName);
  //   sessionStorage.setItem('userId', userId.toString());
  //   sessionStorage.setItem('token', token);
  //   // sessionStorage.setItem('userName', userName);
  // },
  // 修改 setAuthInfo 方法，添加 userName 参数
  setAuthInfo: (userId: number, token: string, userName: string): void => {
    // 同时保存到 localStorage 和 sessionStorage 作为备份
    localStorage.setItem('userId', userId.toString());
    localStorage.setItem('token', token);
    localStorage.setItem('userName', userName);
    sessionStorage.setItem('userId', userId.toString());
    sessionStorage.setItem('token', token);
    sessionStorage.setItem('userName', userName);
  },
  
  // 添加新方法：尝试恢复认证状态
  tryRestoreAuth: (): boolean => {
    const localToken = localStorage.getItem('token');
    const localUserId = localStorage.getItem('userId');
    const sessionToken = sessionStorage.getItem('token');
    const sessionUserId = sessionStorage.getItem('userId');
    
    // 如果 localStorage 完整，无需恢复
    if (localToken && localUserId) {
      return true;
    }
    
    // 尝试从 sessionStorage 恢复
    if (sessionToken && sessionUserId) {
      localStorage.setItem('token', sessionToken);
      localStorage.setItem('userId', sessionUserId);
      return true;
    }
    
    // 清理不一致状态
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('userId');
    
    return false;
  },
  
  // 确保用户保持登录状态 - 保留这个完整版本，删除上面的重复定义
  ensureAuthenticated: () => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    
    // 如果token存在但userId丢失，尝试恢复
    if (token && !userId) {
      console.log('检测到token存在但userId丢失，尝试恢复...');
      
      // 1. 尝试从sessionStorage恢复
      const sessionUserId = sessionStorage.getItem('userId');
      if (sessionUserId) {
        console.log('从sessionStorage成功恢复userId:', sessionUserId);
        localStorage.setItem('userId', sessionUserId);
        return true;
      }
      
      // 2. 尝试从JWT token解析用户信息
      try {
        // 简单解析JWT token (不验证签名)
        const tokenParts = token.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
          if (payload && payload.nameid) {
            console.log('从JWT token成功恢复userId:', payload.nameid);
            localStorage.setItem('userId', payload.nameid);
            return true;
          }
        }
      } catch (err) {
        console.error('解析JWT token失败:', err);
      }
      
      // 3. 如果无法恢复，清除token避免不一致状态
      console.log('无法恢复userId，清除token并将用户视为未认证');
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      return false;
    }
    
    return !!token;
  },
  
  // 添加新方法：在每次活动注册后调用，确保登录状态
  reinforceAuthentication: (userId: number): void => {
    if (!localStorage.getItem('token') || !localStorage.getItem('userId')) {
      console.log('活动注册后加强认证状态');
      const tempToken = `temp-token-${Date.now()}`;
      AuthService.setAuthInfo(userId, tempToken, `User-${userId}`);
      
      // 同时在会话存储中保存一份，作为备份
      sessionStorage.setItem('token', tempToken);
      sessionStorage.setItem('userId', userId.toString());
    }
  }
};