from django.contrib import admin
from .models import Category, Tag, Post, Comment


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display  = ['name', 'slug', 'created_at']
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ['name']


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display  = ['name', 'slug', 'created_at']
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ['name']


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display   = ['title', 'author', 'category', 'status', 'featured', 'views_count', 'created_at']
    list_filter    = ['status', 'featured', 'category', 'created_at']
    search_fields  = ['title', 'content', 'author__username']
    prepopulated_fields = {'slug': ('title',)}
    filter_horizontal   = ['tags']
    raw_id_fields       = ['author']
    date_hierarchy      = 'created_at'
    list_editable       = ['status', 'featured']

    fieldsets = (
        ('Content', {'fields': ('title', 'slug', 'author', 'category', 'tags', 'content', 'excerpt', 'cover_image')}),
        ('Publishing', {'fields': ('status', 'featured', 'published_at')}),
        ('Stats', {'fields': ('views_count',), 'classes': ('collapse',)}),
    )


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display  = ['author', 'post', 'parent', 'is_active', 'created_at']
    list_filter   = ['is_active', 'created_at']
    search_fields = ['author__username', 'body', 'post__title']
    list_editable = ['is_active']
    raw_id_fields = ['post', 'author', 'parent']
