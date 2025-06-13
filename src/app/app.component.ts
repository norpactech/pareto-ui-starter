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
import { AuthService } from './auth/services/auth.service';
import { UserProfileComponent } from './user/components/user-profile/user-profile.component';
import { User } from './shared/models/user.models';
import { AuthState, User as AuthUser } from './auth/models/auth.models';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, CommonModule, MatDialogModule, MatButtonModule, MatIconModule, MatTooltipModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'Pareto UI Starter';
  isMenuOpen = false;
  isDarkTheme = false;
  authState: AuthState = {
    isAuthenticated: false,
    user: null,
    loading: false,
    error: null
  };

  get isAuthenticated(): boolean {
    return this.authState.isAuthenticated;
  }

  get currentUser(): AuthUser | null {
    return this.authState.user;
  }

  constructor(
    private themeService: ThemeService,
    private userService: UserService,
    private authService: AuthService,
    private dialog: MatDialog
  ) {}  ngOnInit(): void {
    // Subscribe to theme changes
    this.themeService.theme$.subscribe(theme => {
      this.isDarkTheme = theme === 'dark';
    });

    // Subscribe to authentication state
    this.authService.authState$.subscribe(authState => {
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
}
