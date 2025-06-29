export interface Comment {
  id: number;
  activityId: number;
  userId: number;
  userName: string;
  content: string;
  rating?: number;
  createdAt: string;
}