export interface Activity {
  id: number;
  title: string;
  description: string;
  date: string;
  location: string;
  creatorUserId: number;
  creatorUserName: string;
  registrationsCount: number;
  registrations?: Registration[];
  creator?: User;
}

// File: /petamant-client/src/models/user.ts
export interface User {
  id: number;
  email: string;
  userName: string;
}

// File: /petamant-client/src/models/registration.ts
export interface Registration {
  userName: any;
  petInfo: any;
  id: number;
  activityId: number;
  userId: number;
  petName: string;
  petType: string;
  registrationDate: string;
  user: User;
}

// File: /petamant-client/src/models/comment.ts
export interface Comment {
  id: number;
  content: string;
  activityId: number;
  userId: number;
  createdAt: string;
  user: User;
}

// 创建活动时使用的接口
export interface CreateActivityRequest {
  title: string;
  description: string;
  date: string;
  location: string;
}