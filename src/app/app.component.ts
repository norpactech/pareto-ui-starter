/**
 * Copyright (c) 2025 Northern Pacific Technologies, LLC
 * Licensed under the MIT License.
 */

import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ThemeService } from './shared/services/theme.service';
import { UserService } from './user/services/user.service';
import { CognitoAuthService, CognitoAuthState } from './auth/services/cognito-auth.service';
import { UserProfileComponent } from './user/components/user-profile/user-profile.component';
import { User } from './shared/models/user.models';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, CommonModule, MatDialogModule, MatButtonModule, MatIconModule, MatTooltipModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {  title = 'Pareto UI Starter';
  isMenuOpen = false;
  isDarkTheme = false;
  authState: CognitoAuthState = {
    isAuthenticated: false,
    user: null,
    loading: false,
    error: null,
    accessToken: null,
    idToken: null,
    refreshToken: null
  };

  get isAuthenticated(): boolean {
    return this.authState.isAuthenticated;
  }

  get currentUser(): any {
    return this.authState.user;
  }

  constructor(
    private themeService: ThemeService,
    private userService: UserService,
    private cognitoAuth: CognitoAuthService,
    private dialog: MatDialog
  ) {}ngOnInit(): void {
    // Subscribe to theme changes
    this.themeService.theme$.subscribe(theme => {
      this.isDarkTheme = theme === 'dark';
    });    // Subscribe to authentication state
    this.cognitoAuth.authState$.subscribe(authState => {
      this.authState = authState;
    });
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
  }

  // Close menu only on mobile/tablet when clicking overlay
  closeMenuOnOverlay() {
    // Only close if screen is mobile/tablet size
    if (window.innerWidth <= 767) {
      this.closeMenu();
    }
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  openUserProfile(): void {
    const dialogRef = this.dialog.open(UserProfileComponent, {
      width: '500px',
      maxWidth: '90vw',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('User profile updated:', result);
      }
    });
  }

  signOut(): void {
    this.cognitoAuth.signOut().subscribe({
      next: () => {
        this.closeMenu();
        console.log('User signed out successfully');
      },
      error: (error) => {
        console.error('Sign out error:', error);
        this.closeMenu();
      }
    });
  }
}
