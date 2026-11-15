from django.urls import path
from .views import (
    SuggestBooksView,
    BookListView,
    BookDetailView,
    RelatedBooksView,
    BookCopiesView,
    BookAdminCreateView,
    BookAdminUpdateDeleteView,
    BookCoverUploadView,
    CopyAdminListView,
    CopyLookupView,
    CopyBarcodeImageView,
    BatchCopyCreateView,
    CopyUpdateView,
    CopyWithdrawView,
    CategoryListCreateView,
    CategoryDetailView,
    AuthorListCreateView,
    AuthorDetailView,
    BookCsvTemplateView,
    BookCsvExportView,
    BookCsvImportView,
    ISBNLookupView,
)

urlpatterns = [
    # Search suggest
    path('search/suggest', SuggestBooksView.as_view(), name='search-suggest'),

    # ISBN Lookup & Metadata Auto-fetch
    path('catalog/lookup-isbn', ISBNLookupView.as_view(), name='catalog-isbn-lookup'),
    path('books/lookup-isbn', ISBNLookupView.as_view(), name='book-isbn-lookup'),

    # Books CSV Import/Export
    path('books/template-csv', BookCsvTemplateView.as_view(), name='book-csv-template'),
    path('books/export-csv', BookCsvExportView.as_view(), name='book-csv-export'),
    path('books/import-csv', BookCsvImportView.as_view(), name='book-csv-import'),
    path('catalog/books/template-csv', BookCsvTemplateView.as_view()),
    path('catalog/books/export-csv', BookCsvExportView.as_view()),
    path('catalog/books/import-csv', BookCsvImportView.as_view()),

    # Books
    path('books', BookListView.as_view(), name='book-list'),
    path('books/<int:pk>', BookDetailView.as_view(), name='book-detail'),
    path('books/<int:pk>/related', RelatedBooksView.as_view(), name='book-related'),
    path('books/<int:pk>/copies', BookCopiesView.as_view(), name='book-copies'),
    path('books/create', BookAdminCreateView.as_view(), name='book-create'),
    path('books/<int:pk>/edit', BookAdminUpdateDeleteView.as_view(), name='book-edit'),
    path('books/<int:pk>/cover', BookCoverUploadView.as_view(), name='book-cover-upload'),

    # Copies
    path('copies', CopyAdminListView.as_view(), name='copy-list'),
    path('copies/lookup', CopyLookupView.as_view(), name='copy-lookup'),
    path('copies/<int:pk>/barcode', CopyBarcodeImageView.as_view(), name='copy-barcode-image'),
    path('copies/batch', BatchCopyCreateView.as_view(), name='copy-batch-create'),
    path('copies/<int:pk>', CopyUpdateView.as_view(), name='copy-update'),
    path('copies/<int:pk>/withdraw', CopyWithdrawView.as_view(), name='copy-withdraw'),

    # Categories
    path('categories', CategoryListCreateView.as_view(), name='category-list-create'),
    path('categories/<int:pk>', CategoryDetailView.as_view(), name='category-detail'),

    # Authors
    path('authors', AuthorListCreateView.as_view(), name='author-list-create'),
    path('authors/<int:pk>', AuthorDetailView.as_view(), name='author-detail'),
]
