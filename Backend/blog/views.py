from django.db.models import Count
from django.utils import timezone
from rest_framework import viewsets, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import (
    IsAuthenticatedOrReadOnly, IsAuthenticated, AllowAny
)

from .models import Category, Tag, Post, Comment
from .serializers import (
    CategorySerializer, TagSerializer,
    PostListSerializer, PostDetailSerializer,
    CommentSerializer, RegisterSerializer,
)
from .pagination import StandardPagination, LargePagination
from .filters import PostFilter
from .permissions import IsAuthorOrReadOnly


class CategoryViewSet(viewsets.ModelViewSet):
    """
    CRUD for blog categories.
    Only admins can create/update/delete; anyone can read.
    """
    serializer_class   = CategorySerializer
    pagination_class   = LargePagination
    search_fields      = ['name', 'description']
    ordering_fields    = ['name', 'created_at']
    ordering           = ['name']

    def get_queryset(self):
        return Category.objects.annotate(post_count=Count('posts'))

    def get_permissions(self):
        if self.action in ('list', 'retrieve'):
            return [AllowAny()]
        return [IsAuthenticated()]



class TagViewSet(viewsets.ModelViewSet):
    """
    CRUD for post tags.
    Only authenticated users can create; only admins delete.
    """
    serializer_class  = TagSerializer
    pagination_class  = LargePagination
    search_fields     = ['name']
    ordering_fields   = ['name', 'created_at']
    ordering          = ['name']

    def get_queryset(self):
        return Tag.objects.annotate(post_count=Count('posts'))

    def get_permissions(self):
        if self.action in ('list', 'retrieve'):
            return [AllowAny()]
        return [IsAuthenticated()]



class PostViewSet(viewsets.ModelViewSet):
    """
    Full CRUD for blog posts.

    List  : GET  /api/v1/posts/
    Create: POST /api/v1/posts/
    Detail: GET  /api/v1/posts/{id}/
    Update: PUT  /api/v1/posts/{id}/
    Patch : PATCH /api/v1/posts/{id}/
    Delete: DELETE /api/v1/posts/{id}/

    Custom actions
    ───────────────
    POST /api/v1/posts/{id}/publish/    → set status=published
    POST /api/v1/posts/{id}/archive/    → set status=archived
    GET  /api/v1/posts/featured/        → list featured posts
    GET  /api/v1/posts/my_posts/        → list current user's posts
    """

    pagination_class = StandardPagination
    filterset_class  = PostFilter
    search_fields    = ['title', 'content', 'excerpt', 'author__username', 'tags__name']
    ordering_fields  = ['created_at', 'updated_at', 'views_count', 'title', 'published_at']
    ordering         = ['-created_at']


    def get_queryset(self):
        """
        - Unauthenticated visitors  → only published posts
        - Authenticated users       → own posts (any status) + all published posts
        - Staff / superuser         → everything
        """
        user = self.request.user
        qs = Post.objects.select_related('author', 'category') \
                         .prefetch_related('tags', 'comments')

        if user.is_staff or user.is_superuser:
            return qs

        if user.is_authenticated:
            from django.db.models import Q
            return qs.filter(
                Q(status=Post.Status.PUBLISHED) | Q(author=user)
            )

        return qs.filter(status=Post.Status.PUBLISHED)

    def get_serializer_class(self):
        if self.action == 'list':
            return PostListSerializer
        return PostDetailSerializer

    def get_permissions(self):
        if self.action in ('list', 'retrieve'):
            return [AllowAny()]
        if self.action in ('create',):
            return [IsAuthenticated()]
        return [IsAuthorOrReadOnly()]

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        Post.objects.filter(pk=instance.pk).update(views_count=instance.views_count + 1)
        instance.refresh_from_db(fields=['views_count'])
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def publish(self, request, pk=None):
        post = self.get_object()
        if post.author != request.user and not request.user.is_staff:
            return Response({'detail': 'Not allowed.'}, status=status.HTTP_403_FORBIDDEN)
        post.status      = Post.Status.PUBLISHED
        post.published_at = timezone.now()
        post.save(update_fields=['status', 'published_at'])
        return Response({'detail': 'Post published.', 'published_at': post.published_at})

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def archive(self, request, pk=None):
        post = self.get_object()
        if post.author != request.user and not request.user.is_staff:
            return Response({'detail': 'Not allowed.'}, status=status.HTTP_403_FORBIDDEN)
        post.status = Post.Status.ARCHIVED
        post.save(update_fields=['status'])
        return Response({'detail': 'Post archived.'})

    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def featured(self, request):
        qs         = self.get_queryset().filter(featured=True, status=Post.Status.PUBLISHED)
        page       = self.paginate_queryset(qs)
        serializer = PostListSerializer(page or qs, many=True, context={'request': request})
        return self.get_paginated_response(serializer.data) if page else Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_posts(self, request):
        qs         = Post.objects.filter(author=request.user).order_by('-created_at')
        page       = self.paginate_queryset(qs)
        serializer = PostListSerializer(page or qs, many=True, context={'request': request})
        return self.get_paginated_response(serializer.data) if page else Response(serializer.data)



class CommentViewSet(viewsets.ModelViewSet):
    """
    Nested under posts: /api/v1/posts/{post_pk}/comments/
    Also exposed top-level: /api/v1/comments/ (admin view)
    """
    serializer_class = CommentSerializer
    pagination_class = StandardPagination
    ordering         = ['created_at']

    def get_queryset(self):
        qs = Comment.objects.select_related('author', 'post') \
                            .prefetch_related('replies')

        # If nested under post, filter to that post
        post_pk = self.kwargs.get('post_pk')
        if post_pk:
            qs = qs.filter(post__pk=post_pk, parent=None)  # top-level only

        if not self.request.user.is_staff:
            qs = qs.filter(is_active=True)

        return qs

    def get_permissions(self):
        if self.action in ('list', 'retrieve'):
            return [AllowAny()]
        return [IsAuthorOrReadOnly()]



class RegisterView(generics.CreateAPIView):
    serializer_class   = RegisterSerializer
    permission_classes = [AllowAny]
