export interface User {
  id: number;
  email: string;
  userName: string;
  // 可以根据需要添加更多属性
  createdAt?: string;
  updatedAt?: string;
  // 如果需要存储用户角色信息
  roles?: string[];
}