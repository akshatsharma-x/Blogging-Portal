from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response


class StandardPagination(PageNumberPagination):
    """Default: 10 items per page.  Use ?page=2&page_size=5 to override."""
    page_size              = 10
    page_size_query_param  = 'page_size'
    max_page_size          = 100
    page_query_param       = 'page'

    def get_paginated_response(self, data):
        return Response({
            'pagination': {
                'count':     self.page.paginator.count,
                'total_pages': self.page.paginator.num_pages,
                'current_page': self.page.number,
                'next':      self.get_next_link(),
                'previous':  self.get_previous_link(),
            },
            'results': data,
        })


class LargePagination(PageNumberPagination):
    """For tags / categories — up to 200 items."""
    page_size     = 50
    max_page_size = 200


class NoPagination:
    """Mixin sentinel — set pagination_class = NoPagination to disable paging on a ViewSet."""
    pass
