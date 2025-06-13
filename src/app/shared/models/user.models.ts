export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
}
