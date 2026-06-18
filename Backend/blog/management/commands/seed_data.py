"""
Management command to seed the database with sample blog data.

Usage:
    python manage.py seed_data
"""
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from blog.models import Category, Tag, Post, Comment


CATEGORIES = [
    ("Technology",  "Posts about software, AI, and engineering"),
    ("AutoBiography", "Personal stories and experiences"),
    ("Career",      "Internships, jobs, and professional growth"),
    ("Tutorial",    "Step-by-step technical guides"),
]

TAGS = ["Django", "Python", "REST API", "DRF", "PostgreSQL",
        "Internship", "Backend", "Web Dev", "EY", "Machine Learning"]

POSTS = [
    {
        "title": "Introduction",
        "category": "AutoBiography",
        "tags": ["Internship", "EY"],
        "status": "published",
        "is_featured": True,
        "content": (
            "Hi! My name is Aditya Jain. I am an ECE undergrad 2027 @ JIIT, NOIDA. "
            "I am currently an intern @ EY working on backend and database. "
            "I am proficient in ML and embedded systems. This blog is where I document "
            "my journey as a developer and share what I learn along the way."
        ),
        "excerpt": "A short introduction about me — ECE undergrad, EY intern, ML enthusiast.",
    },
    {
        "title": "Building a REST API with Django REST Framework",
        "category": "Tutorial",
        "tags": ["Django", "DRF", "REST API", "Python"],
        "status": "published",
        "is_featured": True,
        "content": (
            "Django REST Framework (DRF) is one of the most powerful tools for building APIs "
            "in Python. In this post I walk through creating a full CRUD API using ModelViewSet "
            "and DefaultRouter. We cover serializers, viewsets, pagination, and filtering — "
            "everything you need to ship a production-ready blogging backend."
        ),
        "excerpt": "A complete guide to building CRUD APIs with DRF ViewSets and Routers.",
    },
    {
        "title": "My First Week as a Backend Intern at EY",
        "category": "Career",
        "tags": ["Internship", "Backend", "EY"],
        "status": "published",
        "is_featured": False,
        "content": (
            "Week one at EY was a whirlwind. I set up my development environment, "
            "got access to the internal repos, and shipped my first PR — a small bug fix "
            "in the authentication service. The team is incredibly supportive. "
            "I'm using Django and PostgreSQL daily, which aligns perfectly with my personal projects."
        ),
        "excerpt": "Reflections on my first week interning at EY — setup, first PR, and team culture.",
    },
    {
        "title": "PostgreSQL vs SQLite for Django Projects",
        "category": "Technology",
        "tags": ["PostgreSQL", "Django", "Backend", "Web Dev"],
        "status": "published",
        "is_featured": False,
        "content": (
            "SQLite is great for development and prototyping — zero config, file-based, built into Python. "
            "But for production Django projects you almost always want PostgreSQL. It supports "
            "concurrent writes, has robust indexing, and handles complex queries much better. "
            "In this post I compare both and show you how to switch your Django project from "
            "SQLite to PostgreSQL in under 10 minutes."
        ),
        "excerpt": "When to use SQLite vs PostgreSQL in your Django project, and how to switch.",
    },
    {
        "title": "Understanding DRF Pagination — PageNumberPagination Deep Dive",
        "category": "Tutorial",
        "tags": ["DRF", "Python", "REST API"],
        "status": "published",
        "is_featured": False,
        "content": (
            "Pagination is essential for any API that returns lists of objects. "
            "DRF ships with three built-in pagination styles: PageNumberPagination, "
            "LimitOffsetPagination, and CursorPagination. "
            "I'll walk through PageNumberPagination in detail — how to set page size, "
            "how to customize the response envelope, and how to override it per-viewset."
        ),
        "excerpt": "A deep dive into DRF's PageNumberPagination — config, customization, and best practices.",
    },
    {
        "title": "How I Learned Machine Learning While Studying ECE",
        "category": "AutoBiography",
        "tags": ["Machine Learning", "Internship"],
        "status": "draft",
        "is_featured": False,
        "content": (
            "ECE gave me a strong foundation in math and signals — which turns out to be "
            "perfect preparation for ML. I started with Andrew Ng's Coursera course, "
            "then moved to hands-on projects: a plant disease detector using CNNs and "
            "a gesture recognition system using embedded CV on a Raspberry Pi. "
            "Draft — more to come soon."
        ),
        "excerpt": "How an ECE student picked up ML through projects and online courses.",
    },
]

COMMENTS = [
    ("Introduction",                                       "Great intro! Welcome to the blogging world."),
    ("Building a REST API with Django REST Framework",     "This is exactly what I needed — very clear explanation."),
    ("Building a REST API with Django REST Framework",     "How do you handle token auth with ViewSets?"),
    ("My First Week as a Backend Intern at EY",            "Your first week sounds amazing — congrats on the PR!"),
    ("PostgreSQL vs SQLite for Django Projects",           "Good comparison. I always forget to switch before deploying "),
]


class Command(BaseCommand):
    help = "Seed the database with sample blog data for demo/screenshots"

    def handle(self, *args, **options):
        self.stdout.write(self.style.MIGRATE_HEADING(" Seeding database..."))

        # ── Superuser ──────────────────────────────────
        if not User.objects.filter(username="admin").exists():
            User.objects.create_superuser("admin", "admin@blog.com", "admin123")
            self.stdout.write("  Superuser created  (admin / admin123)")
        else:
            self.stdout.write("  –  Superuser already exists")

        author = User.objects.get(username="admin")

        # ── Second user for comments ───────────────────
        reviewer, _ = User.objects.get_or_create(
            username="reviewer",
            defaults={"email": "reviewer@blog.com", "first_name": "Jane", "last_name": "Doe"}
        )
        if _:
            reviewer.set_password("reviewer123")
            reviewer.save()
            self.stdout.write(" Reviewer user created  (reviewer / reviewer123)")

        # ── Categories ─────────────────────────────────
        cat_map = {}
        for name, desc in CATEGORIES:
            cat, created = Category.objects.get_or_create(name=name, defaults={"description": desc})
            cat_map[name] = cat
            if created:
                self.stdout.write(f" Category: {name}")

        # ── Tags ───────────────────────────────────────
        tag_map = {}
        for tag_name in TAGS:
            tag, created = Tag.objects.get_or_create(name=tag_name)
            tag_map[tag_name] = tag
            if created:
                self.stdout.write(f" Tag: {tag_name}")

        # ── Posts ──────────────────────────────────────
        post_map = {}
        for p in POSTS:
            post, created = Post.objects.get_or_create(
                title=p["title"],
                defaults={
                    "author":   author,
                    "category": cat_map.get(p["category"]),
                    "content":  p["content"],
                    "excerpt":  p["excerpt"],
                    "status":   p["status"],
                    "featured": p["is_featured"],
                }
            )
            if created:
                post.tags.set([tag_map[t] for t in p["tags"] if t in tag_map])
                self.stdout.write(f" Post: {p['title'][:55]}")
            post_map[p["title"]] = post

        # ── Comments ───────────────────────────────────
        for post_title, body in COMMENTS:
            post = post_map.get(post_title)
            if post:
                Comment.objects.get_or_create(
                    post=post, author=reviewer, body=body
                )

        self.stdout.write("")
        self.stdout.write(self.style.SUCCESS("Done! Sample data loaded."))
        self.stdout.write("")
        self.stdout.write(" Admin panel  →  http://127.0.0.1:8000/admin/")
        self.stdout.write("       username: admin | password: admin123")
        self.stdout.write("")
        self.stdout.write(" Browsable API →  http://127.0.0.1:8000/api/v1/posts/")
        self.stdout.write(" Swagger UI   →   http://127.0.0.1:8000/swagger/")
        self.stdout.write(" Redoc        →   http://127.0.0.1:8000/redoc/")
        self.stdout.write("")
