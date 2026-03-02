# Scope: Facilities Management
**Assignee:** Team Member 2

## Overview
This module highlights and manages the various physical facilities available at the hotel (e.g., swimming pool, gym, spa, lounge). It ensures guests are aware of the amenities offered during their stay.

## Key Responsibilities
1. **Frontend (Customer View)**: Display beautiful, interactive pages highlighting hotel facilities with descriptions, operating hours, and imagery.
2. **Frontend (Admin View)**: (If applicable) Allow admins to update facility operational hours, close facilities for maintenance, or add new facility offerings.
3. **Backend API**: Endpoints to fetch facility details.
4. **Database**: Manage any dynamic data related to facilities (if they are stored in the DB rather than hardcoded).

## Relevant Files (Codebase Locations)
### Frontend
- **Customer Pages**:
  - `client/src/pages/Facilities.jsx` (Currently hardcoded or dynamically loaded list of amenities)
- **Home Page Integration**:
  - `client/src/pages/Home.jsx` (The Facilities section showcasing top amenities like Rooms, Events, Others)

### Backend & Database
- **API Routes & Controllers**: 
  - Routes related to `/api/facilities` (if dynamic).
- **Database Table**: 
  - `facilities` table (if currently defined in your schema, otherwise consider creating one to make this module dynamic).

## Action Items & Next Steps
- Determine if Facilities should remain hardcoded in React or be moved to a dynamic database table for easy admin updates.
- If dynamic, build an Admin Dashboard component for `FacilityManagement.jsx`.
