# Scope: Restaurant Menu & Payment Service
**Assignee:** Team Member 6

## Overview
This module combines two distinct but highly transactional systems: managing the hotel's luxury restaurant menu display and handling the secure processing of payments for room/event bookings.

## Key Responsibilities
1. **Restaurant Content Delivery**: Present a premium, beautifully designed food and beverage menu filtering by category to customers.
2. **Menu Admin CRUD**: Allow admins to easily add new dishes, upload high-quality food photography to Supabase, and toggle availability of "sold out" items.
3. **Payment Checkout Flow**: Implement a secure checkout form/modal where customers finalize their booking costs using a secure payment integration (e.g., Stripe) or simulated successful logic.
4. **Transaction Logging**: Securely record all successful payments against the booking records in the database.

## Relevant Files (Codebase Locations)
### Frontend
- **Menu Pages**:
  - `client/src/pages/Menu.jsx` (The premium dark-themed customer menu display)
  - `client/src/pages/admin/MenuManagement.jsx` (Admin control interface for the restaurant)
- **Payment Pages**:
  - `client/src/pages/PaymentPage.jsx` (or simulated checkout view)
  - `client/src/componets/PaymentConfirmModal.jsx` (Confirmation logic)

### Backend & Database
- **API Routes**: 
  - Routes handling `/api/menu` (GET for public, POST/PUT/DELETE for Admin).
  - Routes handling `/api/payments/create-intent` or manual payment logging verification.
- **Database Tables**: 
  - `menu` table (Columns: id, name, description, category, price, is_available, is_featured, image_url).
  - `payments` table (Columns: id, booking_id, user_id, amount, status, payment_method, transaction_id).

## Action Items & Next Steps
- Verify the connection to the payment provider works correctly in a test environment.
- Ensure the premium UI of the Menu page remains responsive on all devices.
