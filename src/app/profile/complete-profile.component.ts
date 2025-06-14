import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CognitoAuthService } from '../auth/services/cognito-auth.service';
import { UserService } from '../shared/services/user.service';

@Component({
  selector: 'app-complete-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './complete-profile.component.html',
  styleUrls: ['./complete-profile.component.scss']
})
export class CompleteProfileComponent implements OnInit, OnDestroy {
  profileForm!: FormGroup;
  loading = false;
  error: string | null = null;
  currentUser: any = null;
  
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private cognitoAuth: CognitoAuthService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.getCurrentUser();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      phoneNumber: ['', [Validators.required, this.phoneValidator]]
    });
  }

  private getCurrentUser(): void {
    this.cognitoAuth.authState$
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        this.currentUser = state.user;
        if (!state.isAuthenticated) {
          this.router.navigate(['/auth/signin']);
        }
      });
  }

  // Custom phone number validator
  private phoneValidator(control: any) {
    const phoneNumber = control.value;
    if (!phoneNumber) return null;

    // Basic phone number validation (can be enhanced based on requirements)
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phoneNumber) ? null : { invalidPhone: true };
  }

  onSubmit(): void {
    if (this.profileForm.valid && this.currentUser) {
      this.loading = true;
      this.error = null;

      const formValue = this.profileForm.value;
      const userProfile = {
        cognitoUserId: this.currentUser.username, // Cognito user ID
        email: this.currentUser.email,
        firstName: formValue.firstName,
        lastName: formValue.lastName,
        phoneNumber: formValue.phoneNumber,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Call your API to create user profile in your database
      this.userService.createUserProfile(userProfile)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            // Profile created successfully, redirect to dashboard
            this.router.navigate(['/dashboard']);
          },
          error: (error: any) => {
            console.error('Profile creation failed:', error);
            this.error = 'Failed to create profile. Please try again.';
            this.loading = false;
          }
        });
    } else {
      this.markFormGroupTouched();
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.profileForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.profileForm.get(fieldName);
    if (field && field.errors && (field.dirty || field.touched)) {
      if (field.errors['required']) {
        return `${this.getFieldDisplayName(fieldName)} is required`;
      }
      if (field.errors['minlength']) {
        const requiredLength = field.errors['minlength'].requiredLength;
        return `${this.getFieldDisplayName(fieldName)} must be at least ${requiredLength} characters`;
      }
      if (field.errors['invalidPhone']) {
        return 'Please enter a valid phone number';
      }
    }
    return '';
  }

  private getFieldDisplayName(fieldName: string): string {
    const displayNames: Record<string, string> = {
      firstName: 'First name',
      lastName: 'Last name',
      phoneNumber: 'Phone number'
    };
    return displayNames[fieldName] || fieldName;
  }

  private markFormGroupTouched(): void {
    Object.keys(this.profileForm.controls).forEach(key => {
      const control = this.profileForm.get(key);
      if (control) {
        control.markAsTouched();
      }
    });
  }
}
