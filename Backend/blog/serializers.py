from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.models import User
from .models import Category, Tag, Post, Comment

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        data['username'] = self.user.username
        data['is_staff'] = self.user.is_staff
        data['is_superuser'] = self.user.is_superuser
        return data


class AuthorSerializer(serializers.ModelSerializer):
    class Meta:
        model  = User
        fields = ['id', 'username', 'first_name', 'last_name']


class CategorySerializer(serializers.ModelSerializer):
    post_count = serializers.IntegerField(read_only=True)

    class Meta:
        model  = Category
        fields = ['id', 'name', 'slug', 'description', 'post_count', 'created_at']
        read_only_fields = ['slug', 'created_at']


class TagSerializer(serializers.ModelSerializer):
    post_count = serializers.IntegerField(read_only=True)

    class Meta:
        model  = Tag
        fields = ['id', 'name', 'slug', 'post_count', 'created_at']
        read_only_fields = ['slug', 'created_at']



class ReplySerializer(serializers.ModelSerializer):
    """Shallow nested reply (no further nesting)."""
    author = AuthorSerializer(read_only=True)

    class Meta:
        model  = Comment
        fields = ['id', 'author', 'body', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class CommentSerializer(serializers.ModelSerializer):
    author  = AuthorSerializer(read_only=True)
    replies = ReplySerializer(many=True, read_only=True)

    class Meta:
        model  = Comment
        fields = ['id', 'post', 'author', 'parent', 'body', 'is_active',
                  'replies', 'created_at', 'updated_at']
        read_only_fields = ['author', 'is_active', 'created_at', 'updated_at']

    def validate(self, attrs):
        # Ensure parent comment belongs to the same post
        parent = attrs.get('parent')
        post   = attrs.get('post')
        if parent and parent.post != post:
            raise serializers.ValidationError(
                {'parent': 'Parent comment must belong to the same post.'}
            )
        return attrs

    def create(self, validated_data):
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data)


class PostListSerializer(serializers.ModelSerializer):
    """Compact representation used in the list endpoint."""
    author   = AuthorSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    tags     = TagSerializer(many=True, read_only=True)
    comment_count = serializers.SerializerMethodField()

    class Meta:
        model  = Post
        fields = [
            'id', 'title', 'slug', 'author', 'category', 'tags',
            'excerpt', 'cover_image', 'status', 'featured',
            'views_count', 'comment_count', 'created_at', 'published_at',
        ]

    def get_comment_count(self, obj):
        return obj.comments.filter(is_active=True).count()


class PostDetailSerializer(serializers.ModelSerializer):
    """
    Full serializer used for retrieve / create / update.
    Accepts `category` and `tags` as writable PKs.
    """
    author   = AuthorSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    tags     = TagSerializer(many=True, read_only=True)

    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), source='category',
        write_only=True, required=False, allow_null=True
    )
    tag_ids = serializers.PrimaryKeyRelatedField(
        queryset=Tag.objects.all(), source='tags',
        many=True, write_only=True, required=False
    )

    comment_count = serializers.SerializerMethodField()
    comments      = CommentSerializer(many=True, read_only=True)

    class Meta:
        model  = Post
        fields = [
            'id', 'title', 'slug', 'author',
            'category', 'category_id',
            'tags', 'tag_ids',
            'content', 'excerpt', 'cover_image',
            'status', 'featured', 'views_count',
            'comment_count', 'comments',
            'created_at', 'updated_at', 'published_at',
        ]
        read_only_fields = ['slug', 'author', 'views_count', 'created_at', 'updated_at']

    def get_comment_count(self, obj):
        return obj.comments.filter(is_active=True).count()

    def create(self, validated_data):
        tags = validated_data.pop('tags', [])
        validated_data['author'] = self.context['request'].user
        post = super().create(validated_data)
        post.tags.set(tags)
        return post

    def update(self, instance, validated_data):
        tags = validated_data.pop('tags', None)
        post = super().update(instance, validated_data)
        if tags is not None:
            post.tags.set(tags)
        return post



class RegisterSerializer(serializers.ModelSerializer):
    password  = serializers.CharField(write_only=True, min_length=8)
    password2 = serializers.CharField(write_only=True, label='Confirm password')

    class Meta:
        model  = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'password', 'password2']

    def validate(self, attrs):
        if attrs['password'] != attrs.pop('password2'):
            raise serializers.ValidationError({'password': 'Passwords do not match.'})
        return attrs

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)
