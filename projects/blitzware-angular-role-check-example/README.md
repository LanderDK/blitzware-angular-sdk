# BlitzWare Angular Role Check Example

This example demonstrates how to implement role-based access control in an Angular application using the BlitzWare Angular SDK.

## Features

- **Role Checking**: Uses the `hasRole()` method from BlitzWareAuthService to check if the current user has specific roles
- **Conditional Rendering**: Shows/hides content based on user roles using `*ngIf`
- **Admin Section**: Content only visible to users with the "admin" role
- **Premium Section**: Content only visible to users with the "premium" role
- **Role Status Display**: Visual indicators showing which roles the user has

## Key Components

### Role Checking with Service Method
```typescript
get hasAdminRole(): boolean {
  return this.auth.hasRole('admin');
}

get hasPremiumRole(): boolean {
  return this.auth.hasRole('premium');
}
```

### Conditional Rendering
```html
<div *ngIf="hasAdminRole" class="admin-section">
  <h3>🔒 Admin Only Section</h3>
  <p>This content is only visible to users with the admin role.</p>
</div>
```

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   ng serve blitzware-angular-role-check-example
   ```

3. Navigate to `http://localhost:4200` to see the example in action.

## Usage

1. Log in using the BlitzWare authentication system
2. Observe the role status indicators showing which roles you have
3. See how content is conditionally displayed based on your roles
4. Try logging in with different users that have different roles to see the changes

## Role Configuration

The example checks for two roles:
- `admin`: Provides access to administrative features
- `premium`: Provides access to premium features

Users can have one, both, or neither of these roles, and the UI will adapt accordingly.

## Architecture

This example uses:
- **Standalone Components**: Modern Angular architecture with standalone components
- **Reactive Programming**: Uses observables for reactive state management
- **Dependency Injection**: BlitzWareAuthService is injected into components
- **TypeScript**: Full type safety throughout the application
