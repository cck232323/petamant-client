import axios from './axiosConfig';
import { Activity } from '../models/activity';

export const ActivityService = {
  getAllActivities: async (): Promise<Activity[]> => {
    const response = await axios.get('/activities');
    return response.data;
  },
  
  getActivityById: async (id: number): Promise<Activity> => {
    const response = await axios.get(`/activities/${id}`);
    return response.data;
  },
  
  createActivity: async (activityData: any): Promise<Activity> => {
    const response = await axios.post('/activities', activityData);
    return response.data;
  },
  
  updateActivity: async (id: number, activityData: any): Promise<Activity> => {
    const response = await axios.put(`/activities/${id}`, activityData);
    return response.data;
  },
  
  deleteActivity: async (id: number): Promise<void> => {
    await axios.delete(`/activities/${id}`);
  },
  
  // 修正路径，移除重复的 / 前缀
  getUserCreatedActivities: async (userId: number): Promise<Activity[]> => {
    // 正确的路径是 /activities/user/{id}/created
    const response = await axios.get(`/activities/user/${userId}/created`);
    return response.data;
  },
  
  // 修正路径，移除重复的 / 前缀
  getUserRegisteredActivities: async (userId: number): Promise<Activity[]> => {
    // 正确的路径是 /activities/user/{id}/registered
    const response = await axios.get(`/activities/user/${userId}/registered`);
    return response.data;
  },
  createUserComments: async (activityId: number): Promise<any> => {
    const response = await axios.post(`/activities/${activityId}/comments`);
    console.log("createComments response", response.data);
    return response.data;
  },
  getUserComments: async (activityId: number): Promise<any[]> => {
    const response = await axios.get(`/activities/${activityId}/comments`);
    console.log("getUserComments response", response.data);
    if (!Array.isArray(response.data)) {
      console.error('获取活动评论时，返回的数据格式不正确:', response.data);
      throw new Error('Invalid response format for activity comments');
    }
    return response.data;
  }
  // getActivityRegistrations: async (activityId: number): Promise<any[]> => {
};