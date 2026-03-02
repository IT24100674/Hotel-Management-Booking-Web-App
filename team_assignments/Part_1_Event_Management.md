# Scope: Event Management
**Assignee:** Team Member 1

## Overview
This module is responsible for handling all event packages (weddings, conferences, etc.) offered by the hotel. This includes displaying event options to customers and allowing administrators to manage the inventory of event packages.

## Key Responsibilities
1. **Frontend (Customer View)**: Display available event packages with their details (capacity, features, price).
2. **Frontend (Admin View)**: Provide a dashboard interface to create, read, update, and delete (CRUD) event packages, including image uploads.
3. **Backend API**: Endpoints to fetch active events and admin-only endpoints to manipulate event data.
4. **Database**: Manage the SQL schema for events.

## Relevant Files (Codebase Locations)
### Frontend
- **Customer Pages**:
  - `client/src/pages/event.jsx` (Displays event packages to users)
- **Admin Pages**:
  - `client/src/pages/admin/EventManagement.jsx` (Admin CRUD interface for events)
- **Components**:
  - Any reusable components inside `client/src/componets/` related to event cards.

### Backend & Database
- **API Routes & Controllers**: 
  - `server/routes/...` (Routes handling GET/POST/PUT/DELETE for `/api/events`)
  - `server/controllers/...` (Logic for event retrieval and modification)
- **Database Table**: 
  - `events` table (Columns: id, title, description, image_url, capacity, price_per_guest, features, type, created_at). Defined in `database_setup.sql`.

## Action Items & Next Steps
- Verify event booking flow (if customers can directly book/inquire about an event).
- Ensure all event images upload securely to Supabase and links are saved correctly.
