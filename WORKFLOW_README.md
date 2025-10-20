# Whop Checkout Link Workflow Implementation

This implementation provides a complete workflow for creating products, generating checkout links with specific internal names, and tracking them.

## 🚀 Features Implemented

### 1. Product Creation
- Create products using Whop SDK
- Set product title, description, and visibility
- Returns product ID for use in checkout link creation

### 2. Checkout Link Creation
- Create individual checkout links with custom internal names
- Create multiple checkout links with random internal names
- Each link has unique pricing and metadata
- Internal names are stored in both metadata and internal notes

### 3. Tracking System
- Track checkout links by internal name
- Filter receipts based on internal name matching
- Support date range filtering
- Returns detailed receipt information

## 📡 API Endpoints

### Create Product
```http
POST /api/create-product
Content-Type: application/json

{
  "title": "My Product Title",
  "description": "Product description (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "id": "prod_xxxxxxxxxxxxx",
    "title": "My Product Title",
    "visibility": "visible",
    ...
  }
}
```

### Create Single Checkout Link
```http
POST /api/create-checkout-link
Content-Type: application/json

{
  "productId": "prod_xxxxxxxxxxxxx",
  "internalName": "premium_plan_123",
  "title": "Premium Plan",
  "price": "29.99",
  "currency": "usd"
}
```

### Create Multiple Checkout Links
```http
POST /api/create-multiple-checkout-links
Content-Type: application/json

{
  "productId": "prod_xxxxxxxxxxxxx",
  "count": 10
}
```

### Track Checkout Links
```http
POST /api/track-checkout-links
Content-Type: application/json

{
  "internalName": "premium_plan_123",
  "startDate": "2024-01-01",
  "endDate": "2024-12-31"
}
```

### Complete Workflow (All-in-One)
```http
POST /api/complete-workflow
Content-Type: application/json

{
  "productTitle": "My Test Product",
  "productDescription": "Test product for workflow",
  "checkoutCount": 10
}
```

## 🔧 Implementation Details

### Internal Name Generation
The system generates random internal names using the following pattern:
- **Prefixes**: premium, basic, pro, starter, advanced, ultimate, standard, deluxe, express, max
- **Suffixes**: plan, package, deal, offer, bundle, kit, suite, edition, version, tier
- **Format**: `{prefix}_{suffix}_{number}`
- **Example**: `premium_plan_123`, `basic_deal_456`

### Tracking Mechanism
The tracking system works by:
1. Fetching all receipts from the Whop API
2. Filtering receipts that contain the internal name in:
   - Plan title
   - Receipt metadata
   - Internal notes
3. Returning matching receipts with full details

### Error Handling
- Comprehensive error handling for all API calls
- Graceful failure handling for individual checkout link creation
- Detailed error logging for debugging
- Rate limiting protection with delays between API calls

## 🧪 Testing

### Manual Testing
1. Start the backend server: `npm start`
2. Use the test script: `node test-workflow.js`
3. Or use curl/Postman to test individual endpoints

### Test Script Usage
```bash
cd backend
node test-workflow.js
```

The test script will:
1. Create a product
2. Generate 10 checkout links with random internal names
3. Test tracking functionality
4. Display results

## 📊 Example Usage

### Step 1: Create Product
```javascript
const response = await fetch('/api/create-product', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'My Test Product',
    description: 'A product for testing checkout links'
  })
});
const product = await response.json();
```

### Step 2: Create Checkout Links
```javascript
const response = await fetch('/api/create-multiple-checkout-links', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    productId: product.data.id,
    count: 10
  })
});
const checkoutLinks = await response.json();
```

### Step 3: Track by Internal Name
```javascript
const response = await fetch('/api/track-checkout-links', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    internalName: 'premium_plan_123',
    startDate: '2024-01-01',
    endDate: '2024-12-31'
  })
});
const trackedReceipts = await response.json();
```

## 🔍 Monitoring & Analytics

The system provides detailed tracking information:
- Receipt count per internal name
- Revenue tracking by checkout link
- Date range filtering
- Status breakdown (succeeded, failed, etc.)
- Payment method tracking

## 🛠️ Configuration

Update the configuration in `whopApi.ts`:
```typescript
export const whopSdk: WhopServerSdk = WhopServerSdk({
  appId: "your_app_id",
  appApiKey: "your_api_key",
  onBehalfOfUserId: "your_user_id",
  companyId: "your_company_id"
});
```

## 📝 Notes

- Internal names are stored in both metadata and internal notes for maximum tracking reliability
- Random pricing between $10-$60 is generated for demo purposes
- Rate limiting is implemented with 500ms delays between API calls
- All API calls include comprehensive error handling
- The system supports both individual and batch operations

## 🚨 Important Considerations

1. **API Limits**: Be mindful of Whop API rate limits
2. **Data Storage**: In production, store checkout link data in a database
3. **Security**: Keep API keys secure and use environment variables
4. **Monitoring**: Implement proper logging and monitoring for production use
5. **Testing**: Always test with small batches before large-scale operations

## 🔗 Related Files

- `backend/src/whopApi.ts` - Main API implementation
- `backend/src/server.ts` - Express server with endpoints
- `backend/test-workflow.js` - Test script
- `backend/WORKFLOW_README.md` - This documentation
