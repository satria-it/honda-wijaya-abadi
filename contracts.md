# Honda Wijaya Abadi Motor - Contracts & Integration Guide

## Frontend Mock Data Location
**File:** `/app/frontend/src/mock.js`

### Mock Data Yang Digunakan:
1. **motorcycles** - Array data motor Honda (id, name, category, price, image, specs, description)
2. **promos** - Array data promo (id, title, description, terms)
3. **testimonials** - Array data testimoni (id, name, motor, rating, comment, date)
4. **companyInfo** - Object info perusahaan (name, tagline, phone, address, email, workingHours, logo, heroImage)
5. **manifesto** - Array komitmen perusahaan (number, title, description)

## API Contracts

### Base URL
- Development: `http://localhost:8001/api`
- Production: `${REACT_APP_BACKEND_URL}/api`

### Authentication
**Admin Panel Authentication**
- Username: `@Abadi`
- Password: `@MuliaB2026`

### Endpoints

#### 1. Admin Authentication
```
POST /api/admin/login
Body: { username: string, password: string }
Response: { token: string, admin: { username: string } }
```

#### 2. Motors Management
```
GET /api/motors
Response: Motor[]

GET /api/motors/:id
Response: Motor

POST /api/admin/motors
Headers: { Authorization: Bearer <token> }
Body: { name, category, price, image, specs[], description }
Response: Motor

PUT /api/admin/motors/:id
Headers: { Authorization: Bearer <token> }
Body: { name?, category?, price?, image?, specs[]?, description? }
Response: Motor

DELETE /api/admin/motors/:id
Headers: { Authorization: Bearer <token> }
Response: { message: string }
```

#### 3. Interests (Polling/Minat Konsumen)
```
GET /api/admin/interests
Headers: { Authorization: Bearer <token> }
Response: Interest[]

POST /api/interests
Body: { name: string, phone: string, motorId: string, motorName: string }
Response: { message: string, interest: Interest }
Note: Setelah save ke DB, juga kirim notifikasi ke WhatsApp
```

#### 4. Company Settings
```
GET /api/settings
Response: Settings

PUT /api/admin/settings
Headers: { Authorization: Bearer <token> }
Body: { logo?, name?, tagline?, address?, phone?, email?, workingHours?, heroImage? }
Response: Settings
```

#### 5. Testimonials Management
```
GET /api/testimonials
Response: Testimonial[]

POST /api/admin/testimonials
Headers: { Authorization: Bearer <token> }
Body: { name, motor, rating, comment }
Response: Testimonial

DELETE /api/admin/testimonials/:id
Headers: { Authorization: Bearer <token> }
Response: { message: string }
```

#### 6. Promos Management
```
GET /api/promos
Response: Promo[]

POST /api/admin/promos
Headers: { Authorization: Bearer <token> }
Body: { title, description, terms }
Response: Promo

PUT /api/admin/promos/:id
Headers: { Authorization: Bearer <token> }
Body: { title?, description?, terms? }
Response: Promo

DELETE /api/admin/promos/:id
Headers: { Authorization: Bearer <token> }
Response: { message: string }
```

## Database Models

### Admin
```python
{
    "username": str,  # @Abadi
    "password": str,  # hashed @MuliaB2026
    "created_at": datetime
}
```

### Motor
```python
{
    "_id": ObjectId,
    "name": str,
    "category": str,  # Matic, Sport, Adventure, Matic Premium
    "price": str,
    "image": str,  # URL
    "specs": List[str],
    "description": str,
    "created_at": datetime,
    "updated_at": datetime
}
```

### Interest (Polling Konsumen)
```python
{
    "_id": ObjectId,
    "name": str,
    "phone": str,
    "motor_id": str,
    "motor_name": str,
    "status": str,  # "new", "contacted", "completed"
    "whatsapp_sent": bool,
    "created_at": datetime
}
```

### Settings
```python
{
    "_id": ObjectId,
    "logo": str,
    "name": str,
    "tagline": str,
    "address": str,
    "phone": str,  # 6282343488319
    "email": str,
    "workingHours": str,
    "heroImage": str,
    "updated_at": datetime
}
```

### Testimonial
```python
{
    "_id": ObjectId,
    "name": str,
    "motor": str,
    "rating": int,  # 1-5
    "comment": str,
    "date": str,
    "created_at": datetime
}
```

### Promo
```python
{
    "_id": ObjectId,
    "title": str,
    "description": str,
    "terms": str,
    "created_at": datetime,
    "updated_at": datetime
}
```

## Frontend Integration Plan

### 1. Remove Mock Data
- Update komponen untuk fetch dari API
- Replace `import { motorcycles, promos, ... } from '../mock'` dengan API calls

### 2. Add API Service Layer
**File:** `/app/frontend/src/services/api.js`
```javascript
const API_URL = process.env.REACT_APP_BACKEND_URL + '/api';

export const motorApi = {
  getAll: () => axios.get(`${API_URL}/motors`),
  getById: (id) => axios.get(`${API_URL}/motors/${id}`),
};

export const interestApi = {
  create: (data) => axios.post(`${API_URL}/interests`, data),
};

// dst...
```

### 3. Update Components
- **Catalog.jsx**: Fetch dari `/api/motors`
- **Promo.jsx**: Fetch dari `/api/promos`
- **Testimonials.jsx**: Fetch dari `/api/testimonials`
- **Header.jsx, Footer.jsx, Contact.jsx**: Fetch dari `/api/settings`

### 4. Admin Panel
**New Routes:**
- `/admin/login` - Login page
- `/admin/dashboard` - Dashboard overview
- `/admin/motors` - Manage motors (CRUD)
- `/admin/interests` - View customer interests
- `/admin/settings` - Manage company settings
- `/admin/promos` - Manage promos
- `/admin/testimonials` - Manage testimonials

## WhatsApp Integration
- Nomor: `6282343488319`
- Ketika konsumen submit minat, simpan ke DB dan buka WhatsApp dengan pre-filled message
- Format message sudah diimplementasikan di `Catalog.jsx`

## Image Upload Strategy
- Admin dapat upload gambar untuk logo, hero, dan motor images
- Simpan file ke folder `/app/backend/uploads/`
- Return URL: `${BACKEND_URL}/uploads/filename.jpg`
- Perlu setup static file serving di FastAPI

## Seed Data
Buat script seed untuk:
1. Admin user dengan credentials yang ditentukan
2. Settings awal dari companyInfo
3. Sample motors dari mock data
4. Sample testimonials
5. Sample promos

## Notes
- Frontend sudah fully functional dengan mock data
- Smooth scroll dengan Lenis sudah aktif
- Framer-motion animations sudah terimplementasi
- WhatsApp integration di frontend sudah berfungsi
- Tinggal implement backend dan replace mock dengan API calls
