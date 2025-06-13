import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    return this.checkAuth(state.url);
  }

  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    return this.checkAuth(state.url);
  }

  private checkAuth(url: string): Observable<boolean> {
    return this.authService.authState$.pipe(
      take(1),
      map(authState => {
        if (authState.isAuthenticated) {
          return true;
        } else {
          // Store the attempted URL for redirecting after login
          localStorage.setItem('redirectUrl', url);
          this.router.navigate(['/auth/signin']);
          return false;
        }
      })
    );
  }
}

// Role-based guard
@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    const requiredRole = route.data['role'] as string;
    
    return this.authService.authState$.pipe(
      take(1),
      map(authState => {
        if (!authState.isAuthenticated) {
          localStorage.setItem('redirectUrl', state.url);
          this.router.navigate(['/auth/signin']);
          return false;
        }

        if (requiredRole && !this.authService.hasRole(requiredRole)) {
          this.router.navigate(['/unauthorized']);
          return false;
        }

        return true;
      })
    );
  }
}

// Guest guard (redirect authenticated users away from auth pages)
@Injectable({
  providedIn: 'root'
})
export class GuestGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean> {
    return this.authService.authState$.pipe(
      take(1),
      map(authState => {
        if (authState.isAuthenticated) {
          this.router.navigate(['/dashboard']);
          return false;
        }
        return true;
      })
    );
  }
}
