from django.db import models
from django.contrib.auth.models import User
from django.utils.text import slugify


class Category(models.Model):
    name        = models.CharField(max_length=100, unique=True)
    slug        = models.SlugField(max_length=120, unique=True, blank=True)
    description = models.TextField(blank=True)
    created_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = 'categories'
        ordering = ['name']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

class Tag(models.Model):
    name       = models.CharField(max_length=50, unique=True)
    slug       = models.SlugField(max_length=60, unique=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Post(models.Model):
    class Status(models.TextChoices):
        DRAFT     = 'draft',     'Draft'
        PUBLISHED = 'published', 'Published'
        ARCHIVED  = 'archived',  'Archived'

    title        = models.CharField(max_length=255)
    slug         = models.SlugField(max_length=280, unique=True, blank=True)
    author       = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posts')
    category     = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, related_name='posts')
    tags         = models.ManyToManyField(Tag, blank=True, related_name='posts')
    content      = models.TextField()
    excerpt      = models.TextField(blank=True, max_length=500, help_text='Short summary shown in listing view')
    cover_image  = models.ImageField(upload_to='posts/covers/', blank=True, null=True)
    status       = models.CharField(max_length=10, choices=Status.choices, default=Status.DRAFT)
    views_count  = models.PositiveIntegerField(default=0)
    featured     = models.BooleanField(default=False)
    created_at   = models.DateTimeField(auto_now_add=True)
    updated_at   = models.DateTimeField(auto_now=True)
    published_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']
        indexes  = [
            models.Index(fields=['status', '-created_at']),
            models.Index(fields=['author', 'status']),
        ]

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.title)
            slug = base_slug
            n = 1
            while Post.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base_slug}-{n}"
                n += 1
            self.slug = slug
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title


class Comment(models.Model):
    post       = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    author     = models.ForeignKey(User, on_delete=models.CASCADE, related_name='comments')
    parent     = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='replies')
    body       = models.TextField()
    is_active  = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"Comment by {self.author.username} on '{self.post.title}'"
