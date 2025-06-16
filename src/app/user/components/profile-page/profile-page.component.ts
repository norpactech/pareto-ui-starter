import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { UserProfileComponent } from '../user-profile/user-profile.component';
import { UserService } from '../../../shared/services/user.service';
import { CognitoAuthService } from '../../../auth/services/cognito-auth.service';
import { User } from '../../../shared/models/user.dto';
import { take, switchMap, map } from 'rxjs/operators';

@Component({
  selector: 'app-profile-page',
  standalone: true,  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatDialogModule,
    UserProfileComponent
  ],template: `
    <div class="profile-page-container">
      <!-- Loading state -->
      <div *ngIf="isLoading" class="loading-container">
        <mat-card>
          <mat-card-content>
            <p>Loading your profile...</p>
          </mat-card-content>
        </mat-card>
      </div>      <!-- Profile creation form (when no profile exists) -->
      <div *ngIf="!isLoading && !hasProfile" class="profile-creation-container">
        <app-user-profile 
          (profileSaved)="onProfileCreated($event)"
          (cancelled)="onProfileCancelled()">
        </app-user-profile>
      </div>

      <!-- Profile management (when profile exists) -->
      <div *ngIf="!isLoading && hasProfile" class="profile-management-container">
        <div class="header-section">
          <h1>My Profile</h1>
          <button mat-raised-button color="primary" (click)="openProfileDialog()">
            <mat-icon>edit</mat-icon>
            Edit Profile
          </button>
        </div>

        <mat-card class="profile-info-card">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>person</mat-icon>
              Profile Information
            </mat-card-title>
          </mat-card-header>
          
          <mat-card-content>
            <p>Your profile is complete! You can edit your information using the button above.</p>
            <p>Your profile includes personal details, contact information, and address.</p>
          </mat-card-content>
          
          <mat-card-actions>
            <button mat-button (click)="goBack()">
              <mat-icon>arrow_back</mat-icon>
              Back to Dashboard
            </button>
            <button mat-raised-button color="primary" (click)="openProfileDialog()">
              <mat-icon>edit</mat-icon>
              Edit Profile
            </button>
          </mat-card-actions>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .profile-page-container {
      padding: 2rem;
      max-width: 800px;
      margin: 0 auto;
    }

    .header-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      flex-wrap: wrap;
      gap: 1rem;

      h1 {
        margin: 0;
        color: #333;
        font-weight: 500;
      }

      button {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
    }

    .profile-info-card {
      mat-card-header {
        margin-bottom: 1rem;
        
        mat-card-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #333;
        }
      }

      mat-card-content {
        margin-bottom: 1.5rem;
        
        p {
          margin-bottom: 0.5rem;
          color: #666;
          line-height: 1.5;
        }
      }

      mat-card-actions {
        display: flex;
        gap: 1rem;
        
        button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
      }
    }

    @media (max-width: 768px) {
      .profile-page-container {
        padding: 1rem;
      }
      
      .header-section {
        flex-direction: column;
        align-items: stretch;
        
        button {
          width: 100%;
          justify-content: center;
        }
      }
      
      .profile-info-card {
        mat-card-actions {
          flex-direction: column;
          
          button {
            width: 100%;
            justify-content: center;
          }
        }
      }
    }
  `]
})
export class ProfilePageComponent implements OnInit {
  private dialog = inject(MatDialog);
  private router = inject(Router);
  private userService = inject(UserService);
  private authService = inject(CognitoAuthService);
  
  // Track whether user has a profile or needs to create one
  hasProfile = false;
  isLoading = true;
  ngOnInit(): void {
    this.checkUserProfile();
  }
  private checkUserProfile(): void {
    this.isLoading = true;
    
    this.authService.authState$.pipe(
      take(1),
      switchMap(authState => {
        if (!authState.isAuthenticated || !authState.user?.email) {
          return [];
        }
        const params = { email: authState.user.email };
        return this.userService.find(params).pipe(
          map((result: { data: User[]; total: number }) => ({ result, authenticatedEmail: authState.user?.email }))
        );
      })
    ).subscribe({
      next: ({ result, authenticatedEmail }) => {
        this.isLoading = false;
        
        // Check if no profile exists
        if (!result.data || result.data.length === 0) {
          console.log('ProfilePage: No profile found, showing inline form');
          this.hasProfile = false;
          return;
        }
        
        // Verify email match for additional security
        const profileEmail = result.data[0]?.email?.toLowerCase();
        const authEmail = authenticatedEmail?.toLowerCase();
        
        if (profileEmail !== authEmail) {
          console.log('ProfilePage: Email mismatch, treating as no profile. Auth:', authEmail, 'Profile:', profileEmail);
          this.hasProfile = false;
          return;
        }
        
        console.log('ProfilePage: Valid profile found for user');
        this.hasProfile = true;
      },
      error: (error) => {
        console.error('Error checking profile:', error);
        this.isLoading = false;
        this.hasProfile = false;
      }
    });
  }

  openProfileDialog(): void {
    const dialogRef = this.dialog.open(UserProfileComponent, {
      width: '600px',
      maxWidth: '90vw',
      disableClose: true,
      data: null // null for create/edit current user profile
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Profile updated:', result);
        // Could add success message or refresh logic here
      }    });
  }
  
  onProfileCreated(result: User): void {
    console.log('Profile created successfully:', result);
    this.hasProfile = true;
    // Optionally show a success message or redirect
  }

  onProfileCancelled(): void {
    console.log('Profile creation cancelled');
    // Redirect back to a safe page since profile creation is required
    this.router.navigate(['/dashboard']);
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}
