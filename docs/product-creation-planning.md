# Product Creation Implementation Planning

## Overview
This document contains detailed implementation tasks for adding product creation functionality via a modal dialog. Each task is designed to be completed independently in under 1 hour by a senior developer, with a maximum of 2 files changed or created per task.

## Prerequisites
- Backend API endpoint `POST /api/v1/product` is already implemented
- Authentication system is in place
- Product listing page exists at `src/app/product/page.tsx`

## Task 1: Create Product Modal Component

### Objective
Create a reusable modal component that displays a form for creating products. The modal will handle form state, API communication, and error display.

### Files to Create
1. `src/app/product/create-product-modal.tsx` (new file)

### Estimated Time
45-60 minutes

### Detailed Implementation Steps

#### 1. Component Structure
- Create a client component with `"use client"` directive
- Define TypeScript interface for props:
  ```typescript
  interface CreateProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
  }
  ```

#### 2. State Management
Import `useState` and `useEffect` from React. Create state variables:
- `name: string` - initialized to empty string
- `price: string` - initialized to empty string (use string for input, convert to number on submit)
- `sectionId: string` - initialized to empty string
- `sections: Array<{ id: number; name: string }>` - initialized to empty array
- `error: string` - initialized to empty string
- `loading: boolean` - initialized to false
- `loadingSections: boolean` - initialized to false (for sections fetch)

#### 3. Fetch Sections on Modal Open
Use `useEffect` to fetch sections when modal opens:
```typescript
useEffect(() => {
  if (isOpen) {
    fetchSections();
    // Reset form when opening
    setName("");
    setPrice("");
    setSectionId("");
    setError("");
  }
}, [isOpen]);

async function fetchSections() {
  setLoadingSections(true);
  try {
    const res = await fetch("/api/v1/section");
    if (!res.ok) throw new Error("Failed to fetch sections");
    const data = await res.json();
    setSections(data);
  } catch (err) {
    setError("Failed to load sections");
  } finally {
    setLoadingSections(false);
  }
}
```

#### 4. Form Submission Handler
Create `handleSubmit` function:
```typescript
async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();
  setError("");
  setLoading(true);

  try {
    const res = await fetch("/api/v1/product", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        price: parseFloat(price),
        sectionId: parseInt(sectionId, 10),
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Failed to create product");
      return;
    }

    // Success: reset form, close modal, notify parent
    setName("");
    setPrice("");
    setSectionId("");
    onSuccess();
    onClose();
  } catch (err) {
    setError("An error occurred. Please try again.");
  } finally {
    setLoading(false);
  }
}
```

#### 5. Modal Overlay and Container
Structure the JSX:
- Outer div: fixed positioning, full screen, backdrop (z-index: 50)
  - Classes: `fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-zinc-900/50`
- Inner div: modal container (max-width, centered, rounded, shadow)
  - Classes: `bg-white dark:bg-zinc-800 rounded-lg shadow-lg max-w-md w-full mx-4 p-6`
- Close button: X button in top-right corner
  - Position: absolute top-4 right-4
  - Classes: `text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200`
  - onClick: `onClose`

#### 6. Form Fields
Create form with three fields:

**Name Input:**
```tsx
<div>
  <label htmlFor="name" className="block text-sm font-medium mb-1">
    Name
  </label>
  <input
    id="name"
    type="text"
    value={name}
    onChange={(e) => setName(e.target.value)}
    className="w-full px-3 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700"
    required
  />
</div>
```

**Price Input:**
```tsx
<div>
  <label htmlFor="price" className="block text-sm font-medium mb-1">
    Price
  </label>
  <input
    id="price"
    type="number"
    step="0.01"
    min="0"
    value={price}
    onChange={(e) => setPrice(e.target.value)}
    className="w-full px-3 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700"
    required
  />
</div>
```

**Section Dropdown:**
```tsx
<div>
  <label htmlFor="sectionId" className="block text-sm font-medium mb-1">
    Section
  </label>
  <select
    id="sectionId"
    value={sectionId}
    onChange={(e) => setSectionId(e.target.value)}
    className="w-full px-3 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700"
    required
    disabled={loadingSections}
  >
    <option value="">Select a section</option>
    {sections.map((section) => (
      <option key={section.id} value={section.id}>
        {section.name}
      </option>
    ))}
  </select>
</div>
```

#### 7. Error Display
Show error message above submit button:
```tsx
{error && (
  <p className="text-red-500 text-sm mb-4">{error}</p>
)}
```

#### 8. Submit Button
```tsx
<button
  type="submit"
  disabled={loading || loadingSections}
  className="w-full py-2 px-4 bg-zinc-900 text-white rounded-md hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
>
  {loading ? "Creating..." : "Create Product"}
</button>
```

#### 9. Conditional Rendering
Wrap entire modal in conditional:
```tsx
if (!isOpen) return null;
```

#### 10. Form Spacing
Add spacing between form fields:
- Wrap form fields in `<form onSubmit={handleSubmit} className="space-y-4">`
- Add title: `<h2 className="text-xl font-semibold mb-4">Create Product</h2>`

### Styling Reference
- Match input styles from `src/app/login/page.tsx`
- Use existing Tailwind classes from the codebase
- Ensure dark mode support with `dark:` variants

### Testing Checklist
- [ ] Modal opens when `isOpen` is true
- [ ] Modal closes when clicking backdrop or X button
- [ ] Sections load when modal opens
- [ ] Form fields update state correctly
- [ ] Form submission sends correct data to API
- [ ] Error messages display on API errors
- [ ] Success triggers `onSuccess` callback and closes modal
- [ ] Form resets on close
- [ ] Loading states work correctly
- [ ] Dark mode styling works

### Acceptance Criteria
- Modal component renders correctly
- Form fields are functional
- Sections dropdown populates from API
- Form submission works with backend API
- Error handling displays API errors
- Success callback is triggered on successful creation
- Component is fully typed with TypeScript

---

## Task 2: Create Product Button Wrapper Component

### Objective
Create a client component that manages the modal state and provides a button to open the modal. This component will handle the refresh mechanism after successful product creation.

### Files to Create
1. `src/app/product/create-product-button.tsx` (new file)

### Estimated Time
30-45 minutes

### Detailed Implementation Steps

#### 1. Component Structure
- Create a client component with `"use client"` directive
- Import necessary dependencies:
  ```typescript
  "use client";
  import { useState } from "react";
  import { useRouter } from "next/navigation";
  import { CreateProductModal } from "./create-product-modal";
  ```

#### 2. Props Interface
Define TypeScript interface:
```typescript
interface CreateProductButtonProps {
  isAdmin: boolean;
}
```

#### 3. State Management
- Import `useState` from React
- Create state for modal visibility:
  ```typescript
  const [isModalOpen, setIsModalOpen] = useState(false);
  ```

#### 4. Router Setup
- Import `useRouter` from `next/navigation`
- Initialize router:
  ```typescript
  const router = useRouter();
  ```

#### 5. Modal Handlers
Create handler functions:

**Open Modal:**
```typescript
function handleOpenModal() {
  setIsModalOpen(true);
}
```

**Close Modal:**
```typescript
function handleCloseModal() {
  setIsModalOpen(false);
}
```

**Handle Success:**
```typescript
function handleSuccess() {
  router.refresh();
}
```

#### 6. Conditional Rendering
Only render button if user is admin:
```typescript
if (!isAdmin) {
  return null;
}
```

#### 7. Button Component
Render the "Create Product" button:
```tsx
<button
  onClick={handleOpenModal}
  className="px-4 py-2 bg-zinc-900 text-white rounded-md hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 text-sm"
>
  Create Product
</button>
```

**Styling Reference:**
- Match button styles from home page (`src/app/page.tsx`)
- Use same classes as sections/products links

#### 8. Modal Integration
Render the modal component:
```tsx
<CreateProductModal
  isOpen={isModalOpen}
  onClose={handleCloseModal}
  onSuccess={handleSuccess}
/>
```

#### 9. Component Structure
Final JSX structure:
```tsx
return (
  <>
    <button onClick={handleOpenModal} ...>
      Create Product
    </button>
    <CreateProductModal
      isOpen={isModalOpen}
      onClose={handleCloseModal}
      onSuccess={handleSuccess}
    />
  </>
);
```

### Styling Notes
- Button should match existing UI patterns
- Ensure consistent spacing and sizing
- Support dark mode

### Testing Checklist
- [ ] Button only renders when `isAdmin` is true
- [ ] Button opens modal when clicked
- [ ] Modal closes when `onClose` is called
- [ ] `router.refresh()` is called on successful product creation
- [ ] Component is fully typed

### Acceptance Criteria
- Button component renders conditionally based on admin status
- Modal opens/closes correctly
- Refresh mechanism works after product creation
- Component integrates seamlessly with modal component
- No TypeScript errors

---

## Task 3: Integrate Create Button into Product Page

### Objective
Update the product page to check user session, determine admin status, and render the create product button component.

### Files to Modify
1. `src/app/product/page.tsx` (modify existing file)

### Estimated Time
20-30 minutes

### Detailed Implementation Steps

#### 1. Import Dependencies
Add imports at the top of the file:
```typescript
import { getSession } from "@/lib/auth";
import { CreateProductButton } from "./create-product-button";
```

#### 2. Make Page Component Async
The component is already async, but ensure it can await:
```typescript
export default async function ProductsPage() {
  // ...
}
```

#### 3. Get User Session
Add session check inside the component:
```typescript
const session = await getSession();
const isAdmin = session?.user?.role === "ADMIN";
```

#### 4. Update Header Section
Modify the header div to include the create button. Current structure:
```tsx
<div className="flex items-center justify-between mb-6">
  <h1 className="text-2xl font-semibold">Products</h1>
  <Link href="/" ...>
    ← Back
  </Link>
</div>
```

**New structure:**
```tsx
<div className="flex items-center justify-between mb-6">
  <h1 className="text-2xl font-semibold">Products</h1>
  <div className="flex items-center gap-4">
    <CreateProductButton isAdmin={isAdmin} />
    <Link
      href="/"
      className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
    >
      ← Back
    </Link>
  </div>
</div>
```

#### 5. Verify Component Structure
Ensure the full component structure is correct:
- Server component (no "use client")
- Imports at top
- Session check
- Conditional button rendering
- Product list display

### Code Location Reference
- Current file: `src/app/product/page.tsx`
- Line to modify: Header section (lines 29-37)
- Add imports: Top of file
- Add session check: Inside component function

### Testing Checklist
- [ ] Page loads without errors
- [ ] Create button appears for ADMIN users
- [ ] Create button does not appear for non-ADMIN users
- [ ] Button opens modal correctly
- [ ] Product list refreshes after creation
- [ ] No TypeScript errors
- [ ] No console errors

### Acceptance Criteria
- Product page displays create button for admin users
- Button is hidden for non-admin users
- Button integration works correctly
- Page maintains existing functionality
- Session check works correctly

---

## Implementation Order
1. **Task 1** - Create modal component (foundation)
2. **Task 2** - Create button wrapper (uses modal)
3. **Task 3** - Integrate into page (uses button)

## Notes
- Each task is independent and can be implemented in separate sessions
- Tasks build upon each other, so order matters
- All components follow existing codebase patterns
- No new dependencies required
- All styling uses existing Tailwind classes

## Verification
After completing all tasks:
1. Login as admin user
2. Navigate to `/product` page
3. Click "Create Product" button
4. Fill out form and submit
5. Verify product appears in list
6. Verify non-admin users don't see the button

