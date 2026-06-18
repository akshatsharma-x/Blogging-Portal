import django_filters
from .models import Post, Category, Tag


class PostFilter(django_filters.FilterSet):
    """
    Filterable fields on /api/v1/posts/
    ─────────────────────────────────────
    ?status=published
    ?category=1                  (FK id)
    ?category__slug=tech         (slug lookup)
    ?author=3                    (user id)
    ?author__username=alice
    ?tags=5                      (tag id, supports multiple: ?tags=5&tags=8)
    ?featured=true
    ?created_after=2024-01-01
    ?created_before=2024-12-31
    ?search=django               (full-text via SearchFilter, not here)
    """

    status   = django_filters.ChoiceFilter(choices=Post.Status.choices)
    featured = django_filters.BooleanFilter()

    category         = django_filters.NumberFilter(field_name='category__id')
    category__slug   = django_filters.CharFilter(field_name='category__slug', lookup_expr='iexact')

    author           = django_filters.NumberFilter(field_name='author__id')
    author__username = django_filters.CharFilter(field_name='author__username', lookup_expr='iexact')

    tags = django_filters.ModelMultipleChoiceFilter(queryset=Tag.objects.all())

    created_after  = django_filters.DateFilter(field_name='created_at', lookup_expr='date__gte')
    created_before = django_filters.DateFilter(field_name='created_at', lookup_expr='date__lte')

    class Meta:
        model  = Post
        fields = [
            'status', 'featured',
            'category', 'category__slug',
            'author', 'author__username',
            'tags',
            'created_after', 'created_before',
        ]
