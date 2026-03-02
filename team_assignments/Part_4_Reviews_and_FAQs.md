# Scope: Reviews & FAQs
**Assignee:** Team Member 4

## Overview
This module is responsible for handling all customer feedback (Reviews) and addressing common inquiries (Frequently Asked Questions). Transparency in reviews and clarity in FAQs are crucial for hotel conversions.

## Key Responsibilities
1. **Frontend (Customer View)**: Build and maintain a beautifully designed Reviews page showing average ratings, individual reviews, and an interactive FAQ accordion.
2. **Review Submission**: Provide authenticated users (customers) the ability to leave a verified review linked to their stay or booking ID.
3. **Frontend (Admin View)**: Create admin panels to approve/reject reviews, and an interface to Create, Read, Update, and Delete common FAQs dynamically.
4. **Backend API**: Endpoints to filter active reviews/FAQs for public display, and admin endpoints for moderation.

## Relevant Files (Codebase Locations)
### Frontend
- **Customer Pages**:
  - `client/src/pages/Reviews.jsx` (Displays approved reviews and submission form)
  - `client/src/pages/Faq.jsx` (Displays dynamic FAQs)
- **Home Integration**:
  - `client/src/pages/Home.jsx` (Quick FAQ preview section, Testimonials preview)

### Backend & Database
- **API Routes**: 
  - Routes handling `/api/reviews` and `/api/faqs`.
- **Database Tables**: 
  - `reviews` table (Columns: id, user_id, booking_id, rating, comment, is_approved).
  - `faqs` table (Columns: id, question, answer, is_active).

## Action Items & Next Steps
- Implement Row Level Security (RLS) policies on Supabase strictly for `reviews` and `faqs` tables if hitting the database directly from the frontend.
- Ensure the schema mismatch bug (`booking_id`) is permanently fixed on the review submission logic.
