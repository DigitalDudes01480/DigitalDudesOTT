# Shared Profile Feature Implementation

## Overview
The Shared Profile feature allows customers to share OTT subscription profiles with other customers using secure access codes instead of sharing passwords directly.

## Features Implemented

### 1. Backend Implementation

#### Models Updated:
- **Product.js**: Added `accountType` field (enum: 'own', 'shared')
- **Subscription.js**: Added shared profile fields and request tracking
- **SharedProfileCode.js**: New model for managing access codes

#### Controllers Created:
- **sharedProfileController.js**: Handle code generation, validation, and requests

#### Routes Added:
- `/api/shared-profile/subscriptions/:id/generate-code` (Admin)
- `/api/shared-profile/subscriptions/:id/request-code` (Customer)
- `/api/shared-profile/validate/:code` (Public)
- `/api/shared-profile/my-codes` (Customer)
- `/api/shared-profile/requests` (Admin)

#### Email Templates Updated:
- Enhanced subscription delivery emails for shared profiles
- Added access code display in emails
- Improved instructions for shared profile users

### 2. Frontend Components

#### Customer Components:
- **SharedProfileCodeRequest.jsx**: Request and validate access codes

#### Admin Components:
- **SharedProfileManager.jsx**: Manage pending requests and generate codes

## How It Works

### For Admin:
1. **Create Shared Profile Products**: Set `accountType` to 'shared' when creating products
2. **Manage Requests**: View pending requests in admin dashboard
3. **Generate Codes**: Generate 8-character access codes for approved requests
4. **Email Notifications**: Automatic email sending to customers with codes

### For Customers:
1. **Purchase Shared Profile**: Buy subscriptions marked as "Shared Profile"
2. **Request Access Code**: Request code from customer dashboard
3. **Receive Code**: Get 8-character code via email
4. **Validate Code**: Enter code to access shared profile credentials
5. **Access Profile**: Get email, profile, and PIN information

## Security Features

### Code Generation:
- 8-character alphanumeric codes
- 24-hour expiration
- Single use (or configurable max uses)
- Automatic cleanup of expired codes

### Access Control:
- Codes tied to specific users and subscriptions
- Validation prevents code reuse
- Audit trail for all code usage

### Email Security:
- Codes sent via secure email
- No passwords shared in emails
- Clear instructions for code usage

## API Endpoints

### Generate Code (Admin Only)
```http
POST /api/shared-profile/subscriptions/:subscriptionId/generate-code
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "userId": "user_id",
  "notes": "Optional notes"
}
```

### Request Code (Customer)
```http
POST /api/shared-profile/subscriptions/:subscriptionId/request-code
Authorization: Bearer <customer_token>
```

### Validate Code
```http
GET /api/shared-profile/validate/:code
Authorization: Bearer <token>
```

### Get User Codes
```http
GET /api/shared-profile/my-codes
Authorization: Bearer <customer_token>
```

### Get Pending Requests (Admin)
```http
GET /api/shared-profile/requests
Authorization: Bearer <admin_token>
```

## Database Schema

### SharedProfileCode Model:
```javascript
{
  subscription: ObjectId,
  code: String (unique, 8 chars),
  user: ObjectId,
  status: String ('active', 'used', 'expired'),
  createdAt: Date,
  expiresAt: Date,
  usedAt: Date,
  usedBy: ObjectId,
  accessCount: Number,
  maxAccess: Number (default: 1),
  notes: String
}
```

### Subscription Updates:
```javascript
{
  credentials: {
    // ... existing fields
    accessCode: String,
    isSharedProfile: Boolean
  },
  sharedProfileRequests: [{
    user: ObjectId,
    requestDate: Date,
    status: String ('pending', 'approved', 'rejected'),
    code: String,
    approvedDate: Date,
    expiresAt: Date
  }]
}
```

## Email Templates

### Shared Profile Delivery Email:
- Clear indication of shared profile access
- Access code display (if available)
- Instructions for code usage
- Profile information (email, profile name, PIN)

### Code Request Notification (Admin):
- Customer information
- Subscription details
- Request timestamp
- Quick approval link

## Integration Steps

### 1. Update Products
```javascript
// When creating products
{
  "name": "Netflix Shared Profile",
  "ottType": "Netflix",
  "profileTypes": [{
    "name": "Shared Profile",
    "accountType": "shared",
    "screenCount": 4,
    "quality": "4K",
    "pricingOptions": [...]
  }]
}
```

### 2. Handle Shared Profile Orders
```javascript
// When delivering subscriptions
if (subscription.credentials.isSharedProfile) {
  // Generate access code instead of showing password
  const code = await generateSharedProfileCode(subscription, user);
  // Send email with code
}
```

### 3. Frontend Integration
```jsx
// In customer dashboard
<SharedProfileCodeRequest 
  subscription={subscription}
  onCodeGenerated={handleCodeGenerated}
/>

// In admin dashboard
<SharedProfileManager />
```

## Benefits

### Security:
- No password sharing
- Time-limited access codes
- Audit trail
- Revocable access

### User Experience:
- Easy code request process
- Clear instructions
- Email notifications
- Dashboard management

### Admin Control:
- Request approval workflow
- Code generation control
- Usage monitoring
- Bulk operations support

## Future Enhancements

1. **Bulk Code Generation**: Generate codes for multiple users
2. **Code Templates**: Predefined code patterns
3. **Advanced Analytics**: Usage statistics and reports
4. **Mobile App Support**: Native app integration
5. **API Rate Limiting**: Prevent abuse
6. **Multi-language Support**: Localization

## Testing

### Test Cases:
1. Code generation and validation
2. Email delivery
3. Expiration handling
4. Concurrent requests
5. Security validation
6. Error handling

### Test Data:
```javascript
// Test shared profile subscription
{
  "ottType": "Netflix",
  "credentials": {
    "email": "shared@netflix.com",
    "profile": "Kids Profile",
    "profilePin": "1234",
    "isSharedProfile": true
  }
}
```

## Troubleshooting

### Common Issues:
1. **Code not working**: Check expiration and usage count
2. **Email not received**: Verify SMTP configuration
3. **Access denied**: Check user permissions
4. **Database errors**: Verify model relationships

### Debug Commands:
```bash
# Check active codes
db.sharedprofilecodes.find({status: "active"})

# Check pending requests
db.subscriptions.find({"sharedProfileRequests.status": "pending"})

# Verify email logs
tail -f logs/email.log
```
