import axios from './axiosConfig';

export interface CommentRequest {
  activityId: number;
  userId: number;
  userName: string;
  content: string;
  rating?: number;
  parentCommentId?: number | null;
  replyToUserId?: number | null;
  replyToUserName?: string | null;
}

export const CommentService = {
  createComment: async (commentData: CommentRequest) => {
    console.log('发送评论请求，数据:', commentData);
    try {
      const response = await axios.post('/comments', commentData);
      console.log('评论请求成功，响应:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('评论请求失败:', error.response?.status, error.response?.data);
      throw error;
    }
  },
  
  getActivityComments: async (activityId: number) => {
    const response = await axios.get(`/activities/${activityId}/comments`);
    return response.data;
  },
  
  deleteComment: async (commentId: number) => {
    await axios.delete(`/comments/${commentId}`);
  },
  
  updateComment: async (commentId: number, content: string, rating?: number) => {
    const response = await axios.put(`/comments/${commentId}`, { content, rating });
    return response.data;
  }
};