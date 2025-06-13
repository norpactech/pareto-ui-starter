import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { User, CreateUserRequest, UpdateUserRequest } from '../models/user.models';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private usersSubject = new BehaviorSubject<User[]>([]);
  public users$ = this.usersSubject.asObservable();

  // Mock data
  private mockUsers: User[] = [
    {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phoneNumber: '+1-555-123-4567',
      createdAt: new Date('2023-01-15'),
      updatedAt: new Date('2024-01-15')
    },
    {
      id: '2',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      phoneNumber: '+1-555-987-6543',
      createdAt: new Date('2023-03-20'),
      updatedAt: new Date('2024-02-10')
    },
    {
      id: '3',
      firstName: 'Mike',
      lastName: 'Johnson',
      email: 'mike.johnson@example.com',
      phoneNumber: '+1-555-456-7890',
      createdAt: new Date('2023-06-10'),
      updatedAt: new Date('2024-01-05')
    }
  ];

  constructor() {
    // Initialize with mock data
    this.usersSubject.next([...this.mockUsers]);
    // Set current user (simulating logged-in user)
    this.currentUserSubject.next(this.mockUsers[0]);
  }

  // Get current user
  getCurrentUser(): Observable<User | null> {
    return this.currentUser$;
  }

  // Get all users
  getUsers(): Observable<User[]> {
    return this.users$.pipe(delay(500)); // Simulate network delay
  }

  // Get user by ID
  getUserById(id: string): Observable<User | null> {
    const users = this.usersSubject.value;
    const user = users.find(u => u.id === id) || null;
    return of(user).pipe(delay(300));
  }

  // Create new user
  createUser(userData: CreateUserRequest): Observable<User> {
    const users = this.usersSubject.value;
    const newUser: User = {
      id: (users.length + 1).toString(),
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Check if email already exists
    if (users.some(u => u.email === userData.email)) {
      return throwError(() => new Error('Email already exists')).pipe(delay(300));
    }

    const updatedUsers = [...users, newUser];
    this.usersSubject.next(updatedUsers);

    return of(newUser).pipe(delay(500));
  }

  // Update user
  updateUser(id: string, userData: UpdateUserRequest): Observable<User> {
    const users = this.usersSubject.value;
    const userIndex = users.findIndex(u => u.id === id);

    if (userIndex === -1) {
      return throwError(() => new Error('User not found')).pipe(delay(300));
    }

    // Check if email already exists (excluding current user)
    if (userData.email && users.some(u => u.email === userData.email && u.id !== id)) {
      return throwError(() => new Error('Email already exists')).pipe(delay(300));
    }

    const updatedUser: User = {
      ...users[userIndex],
      ...userData,
      updatedAt: new Date()
    };

    const updatedUsers = [...users];
    updatedUsers[userIndex] = updatedUser;
    this.usersSubject.next(updatedUsers);

    // Update current user if it's the same user
    if (this.currentUserSubject.value?.id === id) {
      this.currentUserSubject.next(updatedUser);
    }

    return of(updatedUser).pipe(delay(500));
  }

  // Delete user
  deleteUser(id: string): Observable<boolean> {
    const users = this.usersSubject.value;
    const userIndex = users.findIndex(u => u.id === id);

    if (userIndex === -1) {
      return throwError(() => new Error('User not found')).pipe(delay(300));
    }

    const updatedUsers = users.filter(u => u.id !== id);
    this.usersSubject.next(updatedUsers);

    // Clear current user if it's the deleted user
    if (this.currentUserSubject.value?.id === id) {
      this.currentUserSubject.next(null);
    }

    return of(true).pipe(delay(500));
  }

  // Update current user profile
  updateCurrentUserProfile(userData: UpdateUserRequest): Observable<User> {
    const currentUser = this.currentUserSubject.value;
    if (!currentUser) {
      return throwError(() => new Error('No current user found'));
    }

    return this.updateUser(currentUser.id, userData);
  }
}
