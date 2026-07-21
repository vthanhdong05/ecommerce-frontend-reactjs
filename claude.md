# ShopHub Frontend - Phase 1 Implementation Plan

## Context

Phát triển frontend ReactJS cho dự án ecommerce ShopHub, tích hợp với backend NestJS ecommerce đã có sẵn tại `D:/my_project/nestjs-ecommerce/`. Mục tiêu Phase 1: xây dựng giao diện trang chủ (giống ShopHub), flow đăng ký/đăng nhập/quên mật khẩu, và danh sách/chi tiết sản phẩm.

**Backend đã có sẵn:**

- Base URL: `http://localhost:8888/api`
- CORS cho phép `http://localhost:3001`
- Auth: accessToken (localStorage, 6h) + refreshToken (httpOnly cookie, 1d)
- Response chuẩn: `{ errors, data, message }`
- Swagger: `http://localhost:8888/api/api-docs`
- dự án backend `D:\my_project\nestjs-ecommerce`

**Quyết định đã chốt với user:**

- Tech stack: **React 19 + Vite + TypeScript + TailwindCSS v4 + React Router v7 + Redux Toolkit**
- Phạm vi Phase 1: Trang chủ + Auth + Sản phẩm + RBAC 3 lớp
- Folder: `D:/my_project/reactjs-ecommerce/`

---

## RBAC 3 Lớp - Chiến lược phân quyền

### RoleType từ Backend (JWT Payload)

```typescript
type RoleType = 'SUPER_ADMIN' | 'SYSTEM' | 'VENDOR' | null;
// null = user thường (mua sắm, không có quyền quản lý)
```

### Luồng phân quyền sau Login

```
┌──────────────────────────────────────────────────────────────┐
│                    SAU KHI ĐĂNG NHẬP                         │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│   roleType = 'SYSTEM' | 'SUPER_ADMIN'                       │
│   └─→ Hiện menu chọn: "Quản lý hệ thống" | "Trang chủ"    │
│       • Chọn "Quản lý" → redirect /admin/*                 │
│       • Chọn "Trang chủ" → redirect /                      │
│                                                              │
│   roleType = 'VENDOR'                                       │
│   └─→ Hiện menu chọn: "Quản lý Shop" | "Trang chủ"         │
│       • Chọn "Quản lý" → redirect /vendor/*               │
│       • Chọn "Trang chủ" → redirect /                      │
│                                                              │
│   roleType = null (USER thường)                             │
│   └─→ Redirect mặc định về /                               │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Cấu trúc Routes theo Role

| Path                                | Layout       | Allowed Roles        |
| ----------------------------------- | ------------ | -------------------- |
| /                                   | PublicLayout | Public               |
| /login, /register, /forgot-password | PublicLayout | Public               |
| /products, /products/:id            | PublicLayout | Public               |
| /admin/*                            | AdminLayout  | SYSTEM, SUPER_ADMIN  |
| /vendor/*                           | VendorLayout | VENDOR               |
| /profile                            | UserLayout   | USER, SYSTEM, VENDOR |
| /orders                             | UserLayout   | USER, SYSTEM, VENDOR |

### Protected Route Guards

- `RequireAuth`: Yêu cầu đăng nhập
- `RequireRole(roles[])`: Yêu cầu role cụ thể
- `RequirePermission(permission)`: Yêu cầu permission cụ thể

---

## Tech Stack & Packages

```bash
# Core
react@18.3.1
react-dom@18.3.1
typescript@5.6.3

# Build
vite@5.4.11
@vitejs/plugin-react@4.3.3

# Routing
react-router-dom@6.28.0

# State
@reduxjs/toolkit@2.3.0
react-redux@9.1.2

# HTTP
axios@1.7.7

# Styling
tailwindcss@3.4.14
postcss@8.4.47
autoprefixer@10.4.20

# Forms
react-hook-form@7.53.2
@hookform/resolvers@3.9.1
zod@3.23.8

# Utils
clsx@2.1.1
tailwind-merge@2.5.4
```

---

## Cấu trúc thư mục (Updated với RBAC)

```
D:/my_project/reactjs-ecommerce/
├── .env, .env.example
├── index.html, vite.config.ts
├── tsconfig.json, tsconfig.app.json, tsconfig.node.json
├── eslint.config.js, .prettierrc, commitlint.config.js
└── src/
    ├── main.tsx, App.tsx, index.css
    ├── api/                        # API layer
    │   ├── axiosClient.ts          # Axios + interceptors (auto refresh)
    │   ├── auth.api.ts
    │   ├── products.api.ts
    │   ├── categories.api.ts
    │   └── user.api.ts
    ├── store/                      # Redux store
    │   ├── index.ts                # configureStore
    │   ├── hooks.ts                # useAppDispatch, useAppSelector typed
    │   └── slices/
    │       ├── authSlice.ts        # includes roleType, user info
    │       ├── userSlice.ts
    │       ├── productsSlice.ts
    │       ├── categoriesSlice.ts
    │       └── cartSlice.ts         # Stub for Phase 2
    ├── components/
    │   ├── ui/                     # Button, Input, InputPassword, Select, Badge, Card, Spinner, Toast, Modal
    │   ├── layout/
    │   │   ├── Layout.tsx
    │   │   ├── Header/             # Header, Logo, SearchBar, UserMenu, CartBadge
    │   │   └── Footer/             # Footer, FooterLinks, SocialLinks
    │   ├── home/                   # HeroBanner, CategoryGrid, CategoryCard, FeaturedProducts
    │   ├── auth/                   # LoginForm, RegisterForm, ForgotPasswordForm
    │   ├── products/               # ProductCard, ProductGrid, ProductFilters, ProductSearch, ProductPagination, ProductImages
    │   └── common/                 # LoadingScreen, ErrorBoundary, EmptyState, PageTitle
    ├── pages/
    │   ├── HomePage.tsx
    │   ├── auth/                  # LoginPage, RegisterPage, ForgotPasswordPage
    │   └── products/               # ProductsPage, ProductDetailPage
    ├── hooks/                      # useAuth, useDebounce, useToast
    ├── routes/
    │   ├── AppRoutes.tsx          # createBrowserRouter + lazy loading
    │   └── ProtectedRoute.tsx
    ├── types/
    │   ├── api.types.ts           # ApiResponse<T>, PaginatedResponse<T>
    │   ├── auth.types.ts
    │   ├── product.types.ts
    │   ├── category.types.ts
    │   └── user.types.ts
    └── utils/
        ├── formatCurrency.ts      # formatVND
        ├── slugify.ts
        └── validation.ts
```

---

## Theme ShopHub (Tailwind)

File: `frontend/tailwind.config.js`

- **Màu chủ đạo:** orange `#f97316` (giống Shopee/ShopHub)
- **Font:** Inter
- **Container:** center + responsive
- **Animation:** fade-in, slide-up

---

## Luồng Auth quan trọng

```
Login → POST /auth/sign-in → nhận { accessToken, refreshToken }
├── Lưu accessToken vào localStorage
├── Backend tự set cookie httpOnly refreshToken
└── Mọi request có header Authorization: Bearer <accessToken> (axiosClient interceptor tự thêm)

Khi 401 → axiosClient tự gọi POST /auth/refresh-token (cookie tự gửi kèm)
├── lấy accessToken mới → retry request
└── Refresh fail → clear localStorage + redirect /login

Logout → POST /auth/logout → backend clear cookie
```

### Chi tiết quan trọng

- `accessToken` không phải httpOnly cookie → lưu ở localStorage để JS đọc được
- Refresh token endpoint dùng `@Cookies('refreshToken')`
- Decimal price trong Prisma trả về string → cần `parseFloat()` rồi `toLocaleString('vi-VN')`

---

## API Endpoints sử dụng trong Phase 1

| Method | Path                  | Mục đích                        |
| ------ | --------------------- | ------------------------------- |
| POST   | /auth/sign-up         | Đăng ký                         |
| POST   | /auth/sign-in         | Đăng nhập                       |
| POST   | /auth/logout          | Đăng xuất                       |
| POST   | /auth/refresh-token   | Refresh token                   |
| POST   | /auth/forgot-password | Quên mật khẩu                   |
| POST   | /auth/reset-password  | Reset mật khẩu                  |
| GET    | /profile              | Lấy profile user                |
| PATCH  | /profile              | Cập nhật profile                |
| GET    | /categories           | Danh sách category              |
| GET    | /categories/options   | Options cho select              |
| GET    | /products             | Danh sách sản phẩm (pagination) |
| GET    | /products/:id         | Chi tiết sản phẩm               |

**Response chuẩn:** `{ errors, data, message }`

---

## Routes (Phase 1)

| Path             | Page               | Auth      |
| ---------------- | ------------------ | --------- |
| /                | HomePage           | Public    |
| /login           | LoginPage          | Public    |
| /register        | RegisterPage       | Public    |
| /forgot-password | ForgotPasswordPage | Public    |
| /products        | ProductsPage       | Public    |
| /products/:id    | ProductDetailPage  | Public    |
| /profile         | Placeholder        | Protected |

---

## Thứ tự implement

### Step 1: Khởi tạo dự án

```bash
mkdir frontend && cd frontend
npm create vite@latest . -- --template react-ts
npm install
```

Tạo cấu hình:

- `.env` (port 3001, alias `@` → `./src`)
- `vite.config.ts` (port 3001, alias @)
- `tailwind.config.js`, `postcss.config.js`
- Thêm Tailwind directives vào `index.css`
- Update `tsconfig.json` với path aliases

### Step 2: Types & API layer

- `src/types/api.types.ts` — ApiResponse<T>, PaginatedResponse<T>
- `src/api/axiosClient.ts` — axios instance + request/response interceptors (auto refresh)
- `src/api/auth.api.ts`, `products.api.ts`, `categories.api.ts`, `user.api.ts`

### Step 3: Redux store

- `src/store/index.ts`, `src/store/hooks.ts`
- 5 slices: auth, user, products, categories, cart (stub)

### Step 4: UI base components

- **UI:** Button, Input, InputPassword, Select, Badge, Card, Spinner, Toast, Modal
- **Common:** LoadingScreen, ErrorBoundary, EmptyState, PageTitle

### Step 5: Layout

- `Layout.tsx` (Header + main + Footer)
- **Header:** Logo, SearchBar, UserMenu (login/register hoặc avatar dropdown), CartBadge
- **Footer:** links, social, copyright

### Step 6: Routing

- `AppRoutes.tsx` với lazy loading + Suspense
- `ProtectedRoute.tsx`

### Step 7: Auth pages

- LoginForm (email/password)
- RegisterForm (email/password/firstName/fullAddress)
- ForgotPasswordForm
- Validate bằng react-hook-form + zod

### Step 8: Home page

- HeroBanner (carousel giả hoặc ảnh tĩnh)
- CategoryGrid: gọi `GET /categories` lấy ~8 danh mục đầu
- FeaturedProducts: gọi `GET /products?page=1&itemPerPage=12`

### Step 9: Products pages

- **ProductsPage:** grid + filter theo category + search + pagination
- **ProductDetailPage:** ảnh, tên, giá, mô tả, nút "Thêm vào giỏ" (disabled ở Phase 1)

### Step 10: App.tsx + main.tsx

- Provider (Redux), BrowserRouter, Suspense

---

## Critical files cần tạo/có giá trị nhất

| File                            | Mô tả                                     |
| ------------------------------- | ----------------------------------------- |
| `src/api/axiosClient.ts`        | auto refresh token logic, quan trọng nhất |
| `src/store/slices/authSlice.ts` | quản lý auth state (với roleType)         |
| `src/store/index.ts`            | Redux store                               |
| `tailwind.config.js`            | theme ShopHub                             |
| `src/routes/AppRoutes.tsx`      | routing + lazy loading + RBAC guards      |

---

## Verification plan

### Pre-flight:

- Backend đang chạy port 8888
- `.env` backend có `FE_URL=http://localhost:3001` (code dùng `FE_URL`, không phải `FRONTEND_URL`)
- Database PostgreSQL đã seed

### Test cases thủ công:

1. Vào `http://localhost:3001` → thấy trang chủ ShopHub với banner + categories + products
2. Click "Đăng ký" → form → submit → redirect về login
3. Đăng nhập với tài khoản đã đăng ký → vào /profile → hiển thị thông tin
4. Click "Đăng xuất" → về trang chủ, header đổi thành "Đăng nhập/Đăng ký"
5. Truy cập /products → thấy danh sách sản phẩm từ backend
6. Click vào sản phẩm → trang chi tiết
7. **Test token refresh:** đợi accessToken hết hạn (6h) hoặc xóa localStorage → vẫn gọi được API /profile (nhờ auto refresh)
8. **Test RBAC:** Đăng nhập với role khác nhau → redirect đúng route tương ứng

### Build & lint:

```bash
cd frontend
npm run dev      # Vite dev server http://localhost:3001
npm run build    # Production build
```

---

## Lưu ý quan trọng

1. **CORS:** Backend `init.ts` chỉ set CORS nếu có `FE_URL` trong env → cần thêm `FE_URL=http://localhost:3001` vào `.env` backend nếu CORS bị chặn.

2. **Token storage:** `accessToken` không phải httpOnly cookie (backend set cookie có httpOnly=true) → nên lưu ở localStorage để JS đọc được. Khi request gửi kèm cả header Authorization + cookie refreshToken.

3. **Refresh token endpoint:** dùng `@Cookies('refreshToken')` → cookie phải có tên `refreshToken` (đã đúng theo backend).

4. **Decimal price trong Prisma:** trả về string → format tiền tệ cần `parseFloat()` rồi `toLocaleString('vi-VN')`.
