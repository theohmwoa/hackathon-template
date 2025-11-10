import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { SupabaseService } from '@app/core/services/supabase.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <!-- UNSTYLED TEMPLATE: Style this form according to your design requirements -->
    <div class="auth-container">
      <div class="auth-card">
        <h1>Sign Up</h1>

        <form [formGroup]="signupForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="email">Email</label>
            <input
              id="email"
              type="email"
              formControlName="email"
              placeholder="you@example.com"
              [class.error]="signupForm.get('email')?.invalid && signupForm.get('email')?.touched"
            />
            <div class="error-message" *ngIf="signupForm.get('email')?.invalid && signupForm.get('email')?.touched">
              Please enter a valid email
            </div>
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input
              id="password"
              type="password"
              formControlName="password"
              placeholder="At least 6 characters"
              [class.error]="signupForm.get('password')?.invalid && signupForm.get('password')?.touched"
            />
            <div class="error-message" *ngIf="signupForm.get('password')?.invalid && signupForm.get('password')?.touched">
              Password must be at least 6 characters
            </div>
          </div>

          <div class="form-group">
            <label for="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              formControlName="confirmPassword"
              placeholder="Re-enter password"
              [class.error]="signupForm.get('confirmPassword')?.invalid && signupForm.get('confirmPassword')?.touched"
            />
            <div class="error-message" *ngIf="signupForm.hasError('passwordMismatch') && signupForm.get('confirmPassword')?.touched">
              Passwords do not match
            </div>
          </div>

          <div class="error-message" *ngIf="errorMessage">
            {{ errorMessage }}
          </div>

          <div class="success-message" *ngIf="successMessage">
            {{ successMessage }}
          </div>

          <button type="submit" [disabled]="signupForm.invalid || loading">
            {{ loading ? 'Signing up...' : 'Sign Up' }}
          </button>
        </form>

        <div class="divider">
          <span>OR</span>
        </div>

        <div class="oauth-buttons">
          <button type="button" class="oauth-button github" (click)="signInWithGithub()" [disabled]="loading">
            <span>Continue with GitHub</span>
          </button>
          <button type="button" class="oauth-button google" (click)="signInWithGoogle()" [disabled]="loading">
            <span>Continue with Google</span>
          </button>
        </div>

        <div class="auth-link">
          Already have an account? <a routerLink="/login">Login</a>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class SignupComponent {
  signupForm: FormGroup;
  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private supabaseService: SupabaseService,
    private router: Router
  ) {
    this.signupForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    return null;
  }

  async onSubmit() {
    if (this.signupForm.invalid) return;

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      const { email, password } = this.signupForm.value;
      await this.supabaseService.signUp(email, password);

      this.successMessage = 'Account created successfully! Redirecting to home...';

      // Redirect to home after successful signup
      setTimeout(() => {
        this.router.navigate(['/']);
      }, 2000);
    } catch (error: any) {
      this.errorMessage = error.message || 'Signup failed. Please try again.';
    } finally {
      this.loading = false;
    }
  }

  async signInWithGithub() {
    this.loading = true;
    this.errorMessage = '';

    try {
      await this.supabaseService.signInWithGithub();
      // OAuth will redirect automatically, no need to handle navigation here
    } catch (error: any) {
      this.errorMessage = error.message || 'GitHub sign-in failed. Please try again.';
      this.loading = false;
    }
  }

  async signInWithGoogle() {
    this.loading = true;
    this.errorMessage = '';

    try {
      await this.supabaseService.signInWithGoogle();
      // OAuth will redirect automatically, no need to handle navigation here
    } catch (error: any) {
      this.errorMessage = error.message || 'Google sign-in failed. Please try again.';
      this.loading = false;
    }
  }
}
