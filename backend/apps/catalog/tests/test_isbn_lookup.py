import pytest
from rest_framework.test import APIClient
from apps.catalog.isbn_service import clean_isbn, format_isbn13, lookup_isbn_metadata

@pytest.mark.django_db
class TestISBNLookup:
    def test_clean_isbn(self):
        assert clean_isbn('978-0-13-235088-4') == '9780132350884'
        assert clean_isbn(' 978 0 132 35088 4 ') == '9780132350884'
        assert clean_isbn('') == ''

    def test_format_isbn13(self):
        assert format_isbn13('9780132350884') == '978-0-13-235088-4'

    def test_lookup_curated_clean_code(self):
        res = lookup_isbn_metadata('9780132350884')
        assert res['success'] is True
        assert 'Clean Code' in res['title']
        assert 'Robert C. Martin' in res['author_names']
        assert res['suggested_category_code'] == 'CNTT'
        assert res['cover_image'].startswith('http')

    def test_lookup_endpoint(self):
        client = APIClient()
        response = client.get('/api/v1/catalog/lookup-isbn?isbn=9780132350884')
        assert response.status_code == 200
        data = response.json().get('data', {})
        assert data.get('success') is True
        assert 'Clean Code' in data.get('title')

    def test_lookup_missing_isbn(self):
        client = APIClient()
        response = client.get('/api/v1/catalog/lookup-isbn')
        assert response.status_code == 400
