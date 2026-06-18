# 📝 Blogging Portal Backend — Django REST Framework

Full CRUD API with DRF `ModelViewSet`, `Router`, pagination, filtering, JWT auth, and Swagger docs.

---

## 🏗 Project Structure

```
blog_portal/
├── manage.py
├── requirements.txt
├── blog_project/
│   ├── settings.py      ← DRF, JWT, filter, pagination config
│   ├── urls.py          ← Main URL conf + Swagger + JWT
│   └── wsgi.py
└── blog/
    ├── models.py        ← Category, Tag, Post, Comment
    ├── serializers.py   ← All ModelSerializers
    ├── views.py         ← All ModelViewSets + custom actions
    ├── urls.py          ← DRF Router registration
    ├── filters.py       ← PostFilter (django-filter)
    ├── pagination.py    ← StandardPagination, LargePagination
    ├── permissions.py   ← IsAuthorOrReadOnly
    └── admin.py         ← Django Admin
```

---

## ⚡ Quick Start (Today!)

### 1 — Create virtual environment & install dependencies

```bash
cd blog_portal
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate

pip install -r requirements.txt
pip install drf-nested-routers    # for /posts/{id}/comments/ nesting
```

### 2 — Run migrations & create superuser

```bash
python manage.py makemigrations blog
python manage.py migrate
python manage.py createsuperuser
```

### 3 — Run the server

```bash
python manage.py runserver
```

### 4 — Open Swagger docs

```
http://127.0.0.1:8000/swagger/
http://127.0.0.1:8000/redoc/
http://127.0.0.1:8000/admin/
```

---

## 🔐 Authentication

This API uses **JWT (Bearer tokens)**.

### Register a new user
```http
POST /api/v1/auth/register/
Content-Type: application/json

{
  "username": "alice",
  "email": "alice@example.com",
  "password": "mypassword",
  "password2": "mypassword"
}
```

### Get access token
```http
POST /api/v1/auth/token/
Content-Type: application/json

{
  "username": "alice",
  "password": "mypassword"
}
```
Response:
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJ...",
  "refresh": "eyJ0eXAiOiJKV1QiL..."
}
```

### Use the token in requests
```http
Authorization: Bearer <access_token>
```

### Refresh an expired token
```http
POST /api/v1/auth/token/refresh/
{ "refresh": "<refresh_token>" }
```

---

## 📋 Full API Endpoint Reference

### Posts

| Method | URL | Auth | Description |
|--------|-----|------|-------------|
| GET    | `/api/v1/posts/`            | No  | List published posts (paginated, filterable) |
| POST   | `/api/v1/posts/`            | Yes | Create a new post (draft by default) |
| GET    | `/api/v1/posts/{id}/`       | No  | Get post detail + comments (increments view count) |
| PUT    | `/api/v1/posts/{id}/`       | Author | Full update |
| PATCH  | `/api/v1/posts/{id}/`       | Author | Partial update |
| DELETE | `/api/v1/posts/{id}/`       | Author | Delete post |
| POST   | `/api/v1/posts/{id}/publish/` | Author | Publish the post |
| POST   | `/api/v1/posts/{id}/archive/` | Author | Archive the post |
| GET    | `/api/v1/posts/featured/`   | No  | List featured published posts |
| GET    | `/api/v1/posts/my_posts/`   | Yes | List your own posts (all statuses) |

### Categories

| Method | URL | Description |
|--------|-----|-------------|
| GET    | `/api/v1/categories/`       | List all categories |
| POST   | `/api/v1/categories/`       | Create category (auth) |
| GET    | `/api/v1/categories/{id}/`  | Category detail |
| PUT    | `/api/v1/categories/{id}/`  | Update (auth) |
| DELETE | `/api/v1/categories/{id}/`  | Delete (auth) |

### Tags

| Method | URL | Description |
|--------|-----|-------------|
| GET    | `/api/v1/tags/`             | List all tags |
| POST   | `/api/v1/tags/`             | Create tag (auth) |
| GET    | `/api/v1/tags/{id}/`        | Tag detail |
| PUT    | `/api/v1/tags/{id}/`        | Update (auth) |
| DELETE | `/api/v1/tags/{id}/`        | Delete (auth) |

### Comments (nested under Post)

| Method | URL | Description |
|--------|-----|-------------|
| GET    | `/api/v1/posts/{post_pk}/comments/`      | List top-level comments for a post |
| POST   | `/api/v1/posts/{post_pk}/comments/`      | Add a comment (auth) |
| GET    | `/api/v1/posts/{post_pk}/comments/{id}/` | Comment detail |
| PATCH  | `/api/v1/posts/{post_pk}/comments/{id}/` | Edit your comment |
| DELETE | `/api/v1/posts/{post_pk}/comments/{id}/` | Delete your comment |

---

## 🔍 Filtering, Search & Ordering

All query params work on `GET /api/v1/posts/`.

### Filtering (django-filter)
```
?status=published
?status=draft
?featured=true
?category=1
?category__slug=technology
?author=3
?author__username=alice
?tags=1&tags=2          ← multiple tags (AND)
?created_after=2024-01-01
?created_before=2024-12-31
```

### Full-text Search (DRF SearchFilter)
```
?search=django          ← searches title, content, excerpt, author, tags
```

### Ordering (DRF OrderingFilter)
```
?ordering=views_count          ← most viewed (ascending)
?ordering=-views_count         ← most viewed (descending)
?ordering=-created_at          ← newest first (default)
?ordering=title                ← alphabetical
```

### Pagination
```
?page=2                 ← page number
?page_size=5            ← items per page (max 100)
```

Response envelope:
```json
{
  "pagination": {
    "count": 42,
    "total_pages": 5,
    "current_page": 1,
    "next": "http://127.0.0.1:8000/api/v1/posts/?page=2",
    "previous": null
  },
  "results": [ ... ]
}
```

---

## 📦 Key Design Decisions

### Why two Post serializers?
- `PostListSerializer` — lightweight, used for list view (no full content, no comments)
- `PostDetailSerializer` — full fields including content, comments, writable `category_id` + `tag_ids`

### How to create a post with category and tags?
```json
POST /api/v1/posts/
{
  "title": "My first post",
  "content": "Hello, world!",
  "excerpt": "Short summary",
  "category_id": 1,
  "tag_ids": [2, 5]
}
```

### How to reply to a comment?
```json
POST /api/v1/posts/1/comments/
{
  "post": 1,
  "parent": 7,
  "body": "Great point!"
}
```

---

## 🗃 Models Overview

```
Category       Tag
   │             │
   └──── Post ───┘
           │
        Comment  ←── (threaded via parent FK)
```

**Post.status** choices: `draft` | `published` | `archived`

---

## 🔧 Concepts Used (DRF Checklist)

| Concept | Where |
|---------|-------|
| `ModelSerializer` | `blog/serializers.py` — all 6 serializers |
| `ModelViewSet` | `blog/views.py` — Post, Category, Tag, Comment |
| `DefaultRouter` | `blog/urls.py` — auto-generates all 6 standard routes |
| Custom `@action` | `PostViewSet.publish`, `.archive`, `.featured`, `.my_posts` |
| `PageNumberPagination` | `blog/pagination.py` — `StandardPagination`, `LargePagination` |
| `FilterSet` | `blog/filters.py` — `PostFilter` with 9 filter fields |
| `SearchFilter` | Global in settings.py + per-ViewSet `search_fields` |
| `OrderingFilter` | Global in settings.py + per-ViewSet `ordering_fields` |
| `BasePermission` | `blog/permissions.py` — `IsAuthorOrReadOnly` |
| JWT Auth | `rest_framework_simplejwt` — access + refresh tokens |
| Swagger UI | `/swagger/` via `drf-yasg` |
