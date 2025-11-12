# 🎯 Device Management System - Implementation Guide

## ✅ What's Been Set Up

### 1. **Environment Variables (.env)**
```env
# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### 2. **MongoDB Schemas Created**

#### DeviceType Model (`models/DeviceType.ts`)
- Manages device categories (smartphone, tablet, laptop)
- Fields: name, label, icon, active

#### Brand Model (`models/Brand.ts`)
- Stores brand information
- Fields: name, logo (Cloudinary URL), logoPublicId, deviceTypes[], active
- Supports multiple device types per brand

#### DeviceModel Model (`models/DeviceModel.ts`)
- Stores individual device models
- Fields: name, brandId, deviceType, image, imagePublicId, variants[], colors[], active
- Colors include: id, name, hex (color picker value)
- Variants for model codes/names

#### RepairItem Model (`models/RepairItem.ts`)
- Stores repair service types
- Fields: name, repairId, icon, deviceTypes[], basePrice, duration
- Quality options: hasQualityOptions, qualityOptions[]
- Each quality option: id, name, duration, description, priceMultiplier

#### ModelRepairPricing Model (`models/ModelRepairPricing.ts`)
- Links models to repair prices
- Fields: modelId, repairItemId, price, duration, active
- Unique index on model-repair combination

### 3. **API Routes Created**

#### Image Upload (`/api/upload`)
- **POST**: Upload image to Cloudinary
- **DELETE**: Remove image from Cloudinary
- Returns: URL and publicId
- Protected: Requires admin authentication

#### Brands Management (`/api/admin/brands`)
- **GET**: Fetch all brands (filter by deviceType, activeOnly)
- **POST**: Create new brand
- **PATCH**: Update brand
- **DELETE**: Delete brand
- Protected: All routes require admin auth

#### Models Management (`/api/admin/models`)
- **GET**: Fetch all models (filter by brandId, deviceType, activeOnly)
- **POST**: Create new model with colors and variants
- **PATCH**: Update model
- **DELETE**: Delete model
- Protected: All routes require admin auth

#### Repairs Management (`/api/admin/repairs`)
- **GET**: Fetch all repair items
- **POST**: Create repair item with quality options
- **PATCH**: Update repair item
- **DELETE**: Delete repair item
- Protected: All routes require admin auth

#### Model Pricing (`/api/admin/model-pricing`)
- **GET**: Fetch pricing for specific model
- **POST**: Create/update pricing for model-repair combo
- **DELETE**: Remove pricing
- Protected: All routes require admin auth

## 📦 Packages Installed
```bash
npm install cloudinary next-cloudinary --legacy-peer-deps
```

## 🎨 Admin UI Structure

### Device Management Page (`/admin/devices`)
Three tabs:
1. **Brands Tab**
   - List all brands with logos
   - Add/Edit/Delete brands
   - Upload brand logo to Cloudinary
   - Select device types (smartphone, tablet, laptop)
   
2. **Models Tab**
   - List all device models
   - Add/Edit/Delete models
   - Upload device image to Cloudinary
   - Select brand and device type
   - Add multiple colors with color picker
   - Add model variants
   - Set repair pricing for each model
   
3. **Repairs Tab**
   - List all repair services
   - Add/Edit/Delete repair items
   - Set base price and duration
   - Add quality options (OEM vs Aftermarket)
   - Assign to device types

## 🔧 How the System Works

### Adding a Brand
1. Admin clicks "Add Brand"
2. Enters brand name
3. Uploads logo (→ Cloudinary)
4. Selects device types (smartphone, tablet, laptop)
5. Saves → Stored in MongoDB

### Adding a Device Model
1. Admin clicks "Add Model"
2. Selects brand (from existing brands)
3. Selects device type
4. Enters model name
5. Uploads device image (→ Cloudinary)
6. Adds variants (model codes)
7. Adds colors using color picker
8. Saves → Stored in MongoDB

### Adding Repair Services
1. Admin clicks "Add Repair"
2. Enters repair name (e.g., "Screen Replacement")
3. Sets base price
4. Sets duration
5. Selects applicable device types
6. Optionally adds quality options:
   - OEM (Original): priceMultiplier 1.4
   - Aftermarket: priceMultiplier 1.0
7. Saves → Stored in MongoDB

### Setting Model-Specific Pricing
1. Admin selects a model
2. Views available repair services
3. Sets custom price for each repair
4. Can override base repair price
5. Saves → Stored in ModelRepairPricing

## 🔄 Data Flow

### Frontend Quote Page
```
User selects device type
  ↓
Fetches brands from API (/api/admin/brands?activeOnly=true)
  ↓
User selects brand
  ↓
Fetches models from API (/api/admin/models?brandId=X&activeOnly=true)
  ↓
User selects model
  ↓
User selects color (from model.colors[])
  ↓
Fetches repairs from API (/api/admin/repairs?deviceType=X&activeOnly=true)
  ↓
Fetches model pricing (/api/admin/model-pricing?modelId=X)
  ↓
User selects repairs
  ↓
Calculates total using model-specific or base prices
  ↓
Submit quote
```

## 🎯 Next Steps to Complete

### Step 1: Create Admin UI Components
Need to create these files in `components/admin/`:
- `brands-management.tsx` - Brand CRUD UI
- `models-management.tsx` - Model CRUD UI  
- `repairs-management.tsx` - Repair CRUD UI

### Step 2: Update Quote Page
Comment out hardcoded data in `app/get-a-quote/page.tsx`:
```tsx
// Comment out these sections:
// const BRANDS = [...]
// const DEVICE_MODELS = [...]
// const REPAIR_ITEMS = [...]

// Replace with API calls to fetch from database
```

### Step 3: Setup Cloudinary
1. Create account at cloudinary.com
2. Get your credentials from dashboard
3. Update .env file:
   ```env
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-actual-cloud-name
   CLOUDINARY_API_KEY=your-actual-api-key
   CLOUDINARY_API_SECRET=your-actual-api-secret
   ```

### Step 4: Image Upload Component
Create reusable upload component:
- File input with drag & drop
- Image preview
- Progress indicator
- Upload to Cloudinary via `/api/upload`
- Return URL and publicId

### Step 5: Color Picker
Install color picker library:
```bash
npm install react-colorful
```

Integrate in model form for adding colors

### Step 6: Testing
1. Add brands via admin panel
2. Upload logos (verify in Cloudinary)
3. Add models with images
4. Add colors to models
5. Create repair services
6. Set model-specific pricing
7. Test quote page with database data

## 📋 Component Features Needed

### BrandsManagement Component
- Table showing all brands
- Add button → opens dialog
- Edit button → opens dialog with data
- Delete button → confirms and deletes
- Upload logo field → Cloudinary
- Device type checkboxes
- Search/filter functionality

### ModelsManagement Component
- Table showing all models with images
- Filter by brand
- Add button → opens multi-step dialog:
  1. Basic info (name, brand, type)
  2. Image upload
  3. Variants (add multiple)
  4. Colors (add multiple with picker)
  5. Pricing (assign repairs and prices)
- Edit/Delete functionality
- Image preview thumbnails

### RepairsManagement Component
- Table showing all repairs
- Add button → opens dialog
- Quality options toggle
- Add quality option button
- Price multiplier field
- Duration field
- Device type selection
- Edit/Delete functionality

## 🔒 Security Notes

- All admin APIs require authentication
- Check `admin_token` cookie
- Image uploads restricted to admins
- Validate all inputs server-side
- Sanitize file uploads
- Set Cloudinary upload limits

## 📊 Database Relationships

```
Brand (1) ──→ (Many) DeviceModel
DeviceModel (1) ──→ (Many) ModelRepairPricing
RepairItem (1) ──→ (Many) ModelRepairPricing
```

## 🎨 UI/UX Features

- Drag & drop image upload
- Color picker for device colors
- Real-time image preview
- Toast notifications for actions
- Loading states
- Confirmation dialogs for delete
- Form validation
- Responsive design
- Search and filter
- Pagination for large lists

## 📝 TODO List

- [ ] Create BrandsManagement component
- [ ] Create ModelsManagement component
- [ ] Create RepairsManagement component
- [ ] Create ImageUpload component
- [ ] Install and integrate react-colorful
- [ ] Comment out hardcoded data in quote page
- [ ] Replace with API calls
- [ ] Setup Cloudinary account
- [ ] Test complete flow
- [ ] Add loading states
- [ ] Add error handling
- [ ] Add pagination
- [ ] Add search functionality

---

**The foundation is complete! APIs and database schemas are ready. Now you need to build the UI components.** 🚀
