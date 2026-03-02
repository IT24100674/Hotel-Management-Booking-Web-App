# Scope: Room Management
**Assignee:** Team Member 5

## Overview
This is arguably the most critical module of the hotel application. It handles the core product inventory: the physical rooms, their pricing structure, amenities, and their current booking availability calendar.

## Key Responsibilities
1. **Frontend (Customer View)**: Design the primary Room listing page allowing filtering by room type, capacity, and price. Create detailed individual Room detail pages.
2. **Booking Engine Flow**: Implement the critical flow where a user selects dates, checks if the specific room is available (no conflicting bookings), and proceeds to hold the room.
3. **Frontend (Admin View)**: Build a comprehensive admin dashboard to manage total room inventory (Add new rooms, mark rooms as out-of-order, adjust base pricing based on season).
4. **Backend Calendar/Availability Logic**: The API must handle complex date-math to query existing `bookings` and determine if a requested date range is free for a specific room ID.

## Relevant Files (Codebase Locations)
### Frontend
- **Customer Pages**:
  - `client/src/pages/Rooms.jsx` (Displays the grid of available rooms)
  - Booking Modal UI (Where users input check-in/check-out dates)
- **Admin Pages**:
  - Admin Room Management dashboards.

### Backend & Database
- **API Routes**: 
  - Routes handling `/api/rooms` and the logic to query room availability against `/api/bookings`.
- **Database Tables**: 
  - `rooms` table (Columns: id, room_number, type, price, capacity, status, features).
  - `bookings` table (Crucial for checking availability; Columns: room_id, check_in_date, check_out_date, status).

## Action Items & Next Steps
- Focus heavily on testing edge cases in the date selection logic (e.g., overlapping bookings, checkout on the same day as someone else's check-in).
