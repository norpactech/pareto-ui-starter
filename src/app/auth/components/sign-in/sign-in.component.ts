import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CognitoAuthService } from '../../services/cognito-auth.service';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.scss'
})
export class SignInComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private cognitoAuth = inject(CognitoAuthService);
  private router = inject(Router);
  
  signInForm!: FormGroup;
  hidePassword = true;
  loading = false;
  error: string | null = null;
  
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.initializeForm();
    this.subscribeToAuthState();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }  private initializeForm(): void {
    this.signInForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      rememberMe: [false]
    });
  }
  private subscribeToAuthState(): void {
    this.cognitoAuth.authState$
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        this.loading = state.loading;
        this.error = state.error;
      });
  }
  onSubmit(): void {
    if (this.signInForm.valid) {
      const formValue = this.signInForm.value;
      const username = formValue.email.trim().toLowerCase();
      const password = formValue.password;
      const rememberMe = formValue.rememberMe || false;

      this.cognitoAuth.signIn(username, password, rememberMe)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            // Check for redirect URL
            const redirectUrl = localStorage.getItem('redirectUrl') || '/dashboard';
            localStorage.removeItem('redirectUrl');
            this.router.navigate([redirectUrl]);
          },          error: (error: unknown) => {
            console.error('Sign in failed:', error);
          }
        });
    } else {
      this.markFormGroupTouched();
    }
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.signInForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }  getFieldError(fieldName: string): string {
    const field = this.signInForm.get(fieldName);
    if (field && field.errors && (field.dirty || field.touched)) {
      if (field.errors['required']) {
        return `${this.getFieldDisplayName(fieldName)} is required`;
      }
      if (field.errors['email']) {
        return 'Please enter a valid email address';
      }
    }
    return '';
  }

  private getFieldDisplayName(fieldName: string): string {
    const displayNames: Record<string, string> = {
      email: 'Email',
      password: 'Password'
    };
    return displayNames[fieldName] || fieldName;
  }

  private markFormGroupTouched(): void {
    Object.keys(this.signInForm.controls).forEach(key => {
      const control = this.signInForm.get(key);
      if (control) {
        control.markAsTouched();
      }
    });
  }
}
