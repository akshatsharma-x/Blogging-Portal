# EY Blogging Portal

A full-stack blogging platform built during my internship at EY (Ernst & Young), integrating a Django REST Framework backend with a Next.js 15 frontend. The application covers everything from JWT authentication and nested comments to a staff-only admin dashboard — all styled with EY's corporate branding.

---

## What this is

A production-style blogging portal where users can browse posts, search and filter by category, create blogs with cover images, and reply to comments in threaded conversations. Staff accounts get access to a separate admin dashboard to manage posts, categories, users, and featured content.

Built over three weeks — from a blank Next.js project to a fully integrated full-stack app.

---

## Tech Stack

**Frontend**
- Next.js 15 (App Router) + React 19
- TypeScript
- Tailwind CSS
- React Context API (auth state)
- Native `fetch` + `FormData` (no Axios, no Redux)

**Backend**
- Django + Django REST Framework
- JWT via `djangorestframework-simplejwt`
- `django-cors-headers` for cross-origin requests
- SQLite (development)

**Branding**
- EY Yellow `#FFE600` / Dark `#2E2E38`
- EY logo served from `public/`

---

## Project Structure

```
Frontend/
└── src/
    ├── app/
    │   ├── page.tsx               # Home + featured blogs
    │   ├── blogs/                 # Explore all blogs (search, filter, paginate)
    │   ├── author/                # Create blog form (multipart upload)
    │   ├── login/
    │   ├── register/
    │   ├── profile/
    │   └── admin/                 # Staff-only control panel
    ├── components/
    │   ├── Navbar.tsx
    │   ├── Footer.tsx
    │   ├── BlogCard.tsx
    │   ├── SearchBar.tsx
    │   └── CommentsSection.tsx    # Recursive nested comments
    ├── context/
    │   └── AuthContext.tsx        # isAuthenticated, isStaff, username
    ├── lib/
    │   └── api.ts                 # fetchAPI wrapper with token refresh
    └── data/
        └── blogs.ts               # Mock data (used before backend integration)

Backend/
├── core/
│   └── settings.py               # CORS, JWT, media config
├── blog/
│   └── views.py                  # Post CRUD + toggle_featured admin action
└── manage.py
```

---

## Features

### For Users
- Browse all blog posts with search, category filter, and pagination
- View individual posts with cover images loaded from the Django media server
- Threaded comment system — reply to specific comments, rendered recursively
- Create blog posts with title, excerpt, content, tags, category, and cover image
- JWT-based login and register with automatic token refresh

### For Staff / Admin
- Dedicated admin dashboard (guarded — only visible when `isStaff === true`)
- Toggle featured status on any blog post
- Full CRUD on categories and metadata from the UI
- User management table

---

## How It Works

### Authentication
Tokens are stored in both `localStorage` (for client-side fetch calls) and `document.cookie` (for Next.js middleware). When an access token expires, the `fetchAPI` wrapper silently calls `/auth/token/refresh/` and retries the original request.

### Image Uploads
The create-blog form uses native `FormData` to send multipart data including the cover image as a file. `next.config.ts` uses `remotePatterns` to allow images served from Django's media server at `127.0.0.1:8000`.

### Nested Comments
`CommentsSection.tsx` is a recursive React component. Django's `CommentSerializer` returns parent comments with their children nested inside. The component walks this tree and renders each level with increasing visual indentation.

### Admin Route Protection
The admin dashboard checks `isStaff` from `AuthContext` before rendering. The backend endpoints are also protected by `IsAdminUser`, preventing unauthorized API access.

---

## Getting Started

### Backend

```bash
# Create and activate virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run migrations and create a superuser
python manage.py migrate
python manage.py createsuperuser

# Start the server
python manage.py runserver      # Runs on localhost:8000
```

### Frontend

```bash
cd Frontend

# Install dependencies
npm install

# Start the dev server
npm run dev                     # Runs on localhost:3000
```

Open [http://localhost:3000](http://localhost:3000) in your browser. The frontend expects the Django server to be running on port 8000.

---

## Environment

No `.env` file is required for local development. The frontend points to `http://127.0.0.1:8000` by default. For production, update `CORS_ALLOWED_ORIGINS` in `settings.py` and the API base URL in `lib/api.ts`.

---

## What I Learned

This project was my first time building a real full-stack application from scratch. Key takeaways included:
- **CORS** — Getting Django to accept requests from a different port safely.
- **JWT token refresh** — Handling token expiry transparently.
- **FormData vs JSON** — Managing Django's multipart file upload requirements.
- **Recursive components** — Building the nested comment renderer natively in React.
- **Next.js image domains** — Properly configuring `remotePatterns` for external images.

---

## Status

The application is fully functional in development. Next steps include migrating from SQLite to PostgreSQL, adding unit tests for the auth context, and deploying to a cloud environment.

---

*Built as part of an internship at EY | Next.js · Django · TypeScript · Tailwind CSS*
