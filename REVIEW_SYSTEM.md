# FOTG Mobile - Dynamic Review System

This project now includes a dynamic review system that allows customers to add and view reviews for mobile repair services.

## Features Added

### 1. Dynamic Review System

- **Add Reviews**: Customers can add reviews through a modal form
- **View Reviews**: Reviews are fetched dynamically from the API
- **Real-time Stats**: Rating statistics are calculated from actual review data
- **Form Validation**: Comprehensive form validation using Zod and react-hook-form

### 2. API Endpoints

#### GET /api/reviews

Fetches all approved reviews with calculated statistics.

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "name": "John Doe",
      "email": "john@example.com",
      "rating": 5,
      "device": "iPhone 14 Pro",
      "service": "Screen Replacement",
      "review": "Great service!",
      "date": "2 days ago",
      "createdAt": "2024-11-08T10:30:00Z",
      "approved": true
    }
  ],
  "total": 1
}
```

#### POST /api/reviews

Adds a new review to the system.

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "rating": 5,
  "device": "iPhone 14 Pro",
  "service": "Screen Replacement",
  "review": "Great service and fast delivery!"
}
```

### 3. Components

#### AddReviewModal

- Modal form for adding new reviews
- Star rating component
- Device and service type dropdowns
- Form validation with error messages
- Loading states and success feedback

#### ReviewsSection (Updated)

- Dynamic review loading
- Real-time statistics calculation
- Add Review button
- Loading and empty states
- Responsive design

### 4. Features

- **Toast Notifications**: Success/error feedback using Sonner
- **Form Validation**: Client-side validation with Zod schemas
- **Responsive Design**: Works on all screen sizes
- **Loading States**: Proper loading indicators
- **Error Handling**: Comprehensive error handling
- **Date Formatting**: Human-readable date formatting

### 5. Data Storage

Currently uses in-memory storage for demonstration purposes. In production, you should integrate with:

- Database (PostgreSQL, MongoDB, etc.)
- Authentication system
- Review moderation system
- Email notifications

### 6. Usage

1. Navigate to the `/reviews` page
2. Click "Add Your Review" button
3. Fill out the form with your details
4. Submit the review
5. See your review appear in the list immediately

### 7. Tech Stack

- **Framework**: Next.js 15
- **UI Components**: Radix UI + shadcn/ui
- **Forms**: react-hook-form + Zod validation
- **Styling**: Tailwind CSS
- **Notifications**: Sonner
- **Icons**: Lucide React

### 8. Future Enhancements

- Database integration
- User authentication
- Review moderation
- Image uploads
- Review replies
- Review filtering and sorting
- Email notifications
- Analytics dashboard
