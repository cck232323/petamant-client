
import axios from './axiosConfig';

export interface RegistrationRequest {
  activityId: number;
  userId: number;
  petInfo: string;
}

export const RegistrationService = {
  registerForActivity: async (registrationData: RegistrationRequest) => {
    const response = await axios.post('/registrations', registrationData);
    return response.data;
  },
  
  getActivityRegistrations: async (activityId: number): Promise<any[]> => {
    const response = await axios.get(`/activities/${activityId}/registrations`);
    return response.data;
  },
  
  cancelRegistration: async (registrationId: number) => {
    await axios.delete(`/registrations/${registrationId}`);
  },
  
  // 修正路径，确保使用正确的API路径
  getUserRegistrations: async (userId: number) => {
    // 根据API文档，正确的路径是 /activities/user/{id}/registered
    const response = await axios.get(`/activities/user/${userId}/registered`);
    // 确保返回的数据格式正确
    console.log("userId", userId)
    if (!Array.isArray(response.data)) {
      console.error('获取用户注册活动时，返回的数据格式不正确:', response.data);
      throw new Error('Invalid response format for user registrations');
    }
    return response.data;
  }
};