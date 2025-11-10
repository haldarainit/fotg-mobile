# MongoDB Setup for FOTG Mobile

## Prerequisites

1. **MongoDB Installation Options:**
   - **Local MongoDB:** Install MongoDB Community Edition on your machine
   - **MongoDB Atlas:** Use MongoDB's cloud service (recommended for production)
   - **Docker:** Run MongoDB in a container

## Setup Instructions

### Option 1: Local MongoDB

1. Install MongoDB Community Edition from [MongoDB Download Center](https://www.mongodb.com/try/download/community)
2. Start MongoDB service:

   ```bash
   # Windows
   net start MongoDB

   # macOS/Linux
   sudo systemctl start mongod
   ```

3. Your connection string will be: `mongodb://localhost:27017/fotg-mobile`

### Option 2: MongoDB Atlas (Cloud)

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Create a database user with read/write permissions
4. Whitelist your IP address (or 0.0.0.0/0 for development)
5. Get your connection string from the "Connect" button
6. Replace `<username>`, `<password>`, and `<cluster-url>` in your `.env.local` file

### Option 3: Docker

1. Run MongoDB in Docker:
   ```bash
   docker run -d --name mongodb -p 27017:27017 mongo:latest
   ```

## Environment Configuration

Update your `.env.local` file with the appropriate connection string:

```env
# Local MongoDB
MONGODB_URI=mongodb://localhost:27017/fotg-mobile

# MongoDB Atlas
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/fotg-mobile?retryWrites=true&w=majority
```

## Database Seeding

To populate your database with initial review data:

```bash
npm run seed
```

This will:

- Connect to your MongoDB database
- Clear any existing reviews
- Insert sample reviews for testing
- Display the total count of reviews

## API Endpoints

### Public Endpoints

- `GET /api/reviews` - Fetch all approved reviews
- `POST /api/reviews` - Submit a new review

### Admin Endpoints (Future Enhancement)

- `GET /api/admin/reviews` - Fetch all reviews with stats
- `PATCH /api/admin/reviews` - Approve/reject reviews
- `DELETE /api/admin/reviews?id=<reviewId>` - Delete a review

## Database Schema

### Reviews Collection

```javascript
{
  name: String,           // Customer name
  email: String,          // Customer email (unique per 24 hours)
  rating: Number,         // 1-5 stars
  device: String,         // Device model
  service: String,        // Service type
  review: String,         // Review text
  approved: Boolean,      // Moderation status
  createdAt: Date,        // Auto-generated
  updatedAt: Date         // Auto-generated
}
```

## Features

- ✅ **Automatic Timestamps**: CreatedAt and updatedAt fields
- ✅ **Duplicate Prevention**: One review per email per 24 hours
- ✅ **Data Validation**: Schema-level validation for all fields
- ✅ **Indexing**: Optimized queries for performance
- ✅ **Moderation**: Approval system for review management
- ✅ **Error Handling**: Comprehensive error responses

## Troubleshooting

### Connection Issues

- Ensure MongoDB is running
- Check your connection string in `.env.local`
- Verify network access (especially for Atlas)

### Seeding Issues

- Make sure MongoDB is accessible
- Check if the database user has write permissions
- Verify the collection doesn't have conflicting data

### Performance

- The app includes proper indexing for common queries
- Consider adding more indexes for specific use cases
- Monitor query performance in production
