# Scope: User & Staff Management
**Assignee:** Team Member 3

## Overview
This module strictly handles authentication, authorization, user profiles, and staff role management. It is the security foundation of the application.

## Key Responsibilities
1. **Authentication**: Handle Secure Registration, Login, and Password Reset flows.
2. **Authorization**: Implement Role-Based Access Control (RBAC) to separate 'Customer' views from 'Admin/Staff' views.
3. **User Profiles**: Allow customers to view and edit their profiles and view their past/upcoming bookings.
4. **Admin Panel Control**: Guard the `AdminDashboard.jsx` and related admin routes from unauthorized access.

## Relevant Files (Codebase Locations)
### Frontend
- **Customer Auth Pages**:
  - `client/src/pages/SignUp.jsx`
  - `client/src/pages/SignIn.jsx`
  - `client/src/pages/UpdatePassword.jsx`
- **Dashboards**:
  - `client/src/pages/UserProfile.jsx` (Customer dashboard)
  - `client/src/pages/AdminDashboard.jsx` (The main hub for all admin routing)

### Backend & Database
- **API Routes & Controllers**: 
  - `server/routes/...` (Routes handling `/api/auth/register`, `/api/auth/login`, `/api/users/profile`)
  - JWT middleware for protecting backend routes.
- **Database Table**: 
  - `users` table (Columns: id, email, password_hash, role, created_at, full_name, phone).

## Action Items & Next Steps
- Ensure JWT tokens to secure all API calls requiring a logged-in state.
- Validate that standard Users absolutely cannot access Admin routes in the frontend or backend.
