# Product Creation Implementation Research

## Summary
**Goal**: Add UI for creating products via modal dialog

**Status**: Backend API ✅ Complete | Frontend UI ❌ Missing

**Decisions**:
- Form displayed in modal (not separate page)
- Create button only visible to ADMIN users
- Refresh product list after successful creation
- Backend-only validation (no client-side validation)

**Components to Create**:
1. `CreateProductModal` - Modal with form (client component)
2. `CreateProductButton` - Button wrapper with modal state (client component)

**Files to Modify**:
1. `src/app/product/page.tsx` - Add session check and button

## Current State

### Backend (✅ Already Implemented)
- **API Endpoint**: `POST /api/v1/product` exists at `src/app/api/v1/product/route.ts`
- **Service Layer**: `productService.createProduct()` implemented in `src/lib/services/productService.ts`
- **Repository Layer**: `productRepository.create()` implemented in `src/lib/repositories/productRepository.ts`
- **Validation Schema**: `createProductSchema` defined in `src/lib/types/product.ts` with Zod
  - `name`: string, min 1 character
  - `price`: number, must be positive
  - `sectionId`: number, integer, positive

### Frontend (❌ Missing)
- Product listing page exists at `src/app/product/page.tsx` (read-only)
- **No form UI** for creating products
- No client-side component for product creation

## Architecture Patterns

### Authentication & Authorization
- **Proxy Middleware**: `src/proxy.ts` handles auth for `/api/v1/*` routes
- **Requirements**:
  - User must be authenticated (session cookie)
  - **POST operations require ADMIN role** (user role is insufficient)
- **Session Check**: Uses `getSession()` from `src/lib/auth/index.ts`

### Form Handling Pattern
- **Reference**: `src/app/login/page.tsx` demonstrates the pattern
- **Approach**: Client component (`"use client"`) with:
  - `useState` for form fields and error/loading states
  - `fetch` API for HTTP requests
  - Form submission with `onSubmit` handler
  - Error display inline
  - Loading state during submission
  - Router navigation/refresh after success

### Error Handling
- **Backend**: `handleError()` in `src/lib/core/http/errorHandler.ts`
  - Returns structured JSON with error messages
  - Status codes from `HTTP_STATUS` constants
- **Frontend**: Check `res.ok`, read `data.error` from response
- **Validation Errors**: Backend returns `{ error, details }` with flattened Zod errors

### Data Flow
1. User fills form → Client component state
2. Form submit → `fetch` POST to `/api/v1/product`
3. Backend validates → Zod schema parsing
4. Service validates → Checks section exists
5. Repository creates → Database insert
6. Response → Success (201) or error (400/404/500)
7. Frontend handles → Show error or redirect/refresh

## Required Data

### Product Creation Form Fields
- **name** (text input, required)
- **price** (number input, required, must be positive)
- **sectionId** (select dropdown, required, must fetch from `/api/v1/section`)

### Section Data
- **Endpoint**: `GET /api/v1/section` (no auth required for GET)
- **Response**: `Array<{ id: number, name: string }>`
- **Usage**: Populate dropdown for section selection

## Implementation Requirements

### Clarification Questions (✅ Answered)
1. **UI Location**: ✅ **Modal** - Form will be displayed in a modal dialog
2. **Access Control**: ✅ **Hide for non-admin** - Create button/modal only visible to ADMIN users
3. **After Creation**: ✅ **Refresh** - Refresh product list after successful creation
4. **Form Validation**: ✅ **Backend only** - No client-side validation, rely on API error responses

### Minimal Implementation Approach
- **Modal component** for the form (client component)
- **Create button** on product page (only visible to ADMIN users)
- **Simple fetch** to API (no custom hooks or abstractions)
- **Basic error handling** (display error message from API)
- **Section dropdown** populated from API when modal opens
- **Session check** to determine if user is ADMIN (hide button if not)

## Technical Details

### API Request Format
```typescript
POST /api/v1/product
Content-Type: application/json
Body: { name: string, price: number, sectionId: number }
```

### API Response Format
**Success (201)**:
```json
{ "id": number, "name": string, "price": number, "sectionId": number }
```

**Error (400)**:
```json
{ "error": "Validation failed", "details": { ... } }
```

**Error (403)**:
```json
{ "error": "Forbidden: Admin access required" }
```

**Error (404)**:
```json
{ "error": "Section not found" }
```

### Styling
- Use existing Tailwind classes (match login page style)
- Dark mode support (use `dark:` variants)
- Consistent with existing UI patterns

## Implementation Plan

### Components Needed
1. **CreateProductModal** (client component)
   - Modal overlay with form
   - Form fields: name, price, sectionId dropdown
   - Fetch sections on mount/open
   - Handle form submission
   - Display API errors
   - Close modal and trigger refresh on success

2. **Product Page Updates**
   - Add "Create Product" button (only visible to ADMIN)
   - Check session role to conditionally render button
   - Integrate modal component
   - Handle refresh after product creation

### Files to Create/Modify

### New Files
- `src/app/product/create-product-modal.tsx` - Modal component with form
- `src/app/product/create-product-button.tsx` - Client wrapper with button and modal state

### Modified Files
- `src/app/product/page.tsx` - Add session check and render CreateProductButton

## Implementation Tasks

### Task 1: Create Modal Component
**File**: `src/app/product/create-product-modal.tsx`
- Create client component (`"use client"`)
- Modal overlay with backdrop (fixed positioning, z-index)
- Modal content container (centered, max-width, rounded, shadow)
- Close button (X in top-right corner)
- Form with three fields:
  - Name: text input
  - Price: number input (type="number", step="0.01")
  - Section: select dropdown (populated from API)
- State management:
  - `isOpen` (boolean) - controlled by parent
  - `name`, `price`, `sectionId` (form fields)
  - `sections` (array from API)
  - `error` (string for error message)
  - `loading` (boolean for submission state)
- Effects:
  - Fetch sections from `/api/v1/section` when modal opens
  - Reset form state when modal closes
- Form submission:
  - Prevent default
  - POST to `/api/v1/product` with form data
  - Handle errors (display error message)
  - On success: call `onSuccess` callback, close modal, reset form
- Props:
  - `isOpen: boolean`
  - `onClose: () => void`
  - `onSuccess: () => void` (to trigger refresh)

### Task 2: Create Client Wrapper Component
**File**: `src/app/product/create-product-button.tsx`
- Create client component (`"use client"`)
- Accept `isAdmin: boolean` prop (passed from server component)
- Manage modal open/close state (`useState`)
- Import and render `CreateProductModal`
- Handle `onSuccess` callback: call `router.refresh()` from `next/navigation`
- Render "Create Product" button (only if `isAdmin === true`)
- Button styling: match existing button styles (like sections/products links on home page)

### Task 3: Update Product Page
**File**: `src/app/product/page.tsx`
- Import `getSession` from `@/lib/auth`
- Call `await getSession()` in server component
- Check if `session?.user.role === "ADMIN"`
- Pass `isAdmin` prop to `CreateProductButton` component
- Add `CreateProductButton` next to the "Back" link in the header

### Task 4: Modal Styling
- Use Tailwind classes consistent with existing UI
- Dark mode support (`dark:` variants)
- Backdrop: `bg-black/50` or `bg-zinc-900/50`
- Modal container: white/dark background, rounded corners, padding
- Form inputs: match login page input styles
- Error message: red text, displayed below form or above submit button
- Loading state: disable submit button, show "Creating..." text

### Task 5: Error Handling
- Display API error message in modal
- Handle network errors gracefully
- Show generic error if response parsing fails
- Clear error when modal closes or form resets

### Task 6: Refresh Mechanism
- Use Next.js `router.refresh()` in client component
- Call after successful product creation
- Ensure product list updates without full page reload

## Dependencies
- No new dependencies required
- Uses existing: React, Next.js, fetch API, Tailwind CSS

