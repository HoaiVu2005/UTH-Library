import pytest
from rest_framework.test import APIClient
from apps.catalog.isbn_service import (
    clean_isbn,
    format_isbn13,
    lookup_isbn_metadata,
    extract_valid_year,
    infer_publisher,
)

@pytest.mark.django_db
class TestISBNLookup:
    def test_clean_isbn(self):
        assert clean_isbn('978-0-13-235088-4') == '9780132350884'
        assert clean_isbn(' 978 0 132 35088 4 ') == '9780132350884'
        assert clean_isbn('') == ''

    def test_format_isbn13(self):
        assert format_isbn13('9780132350884') == '978-0-13-235088-4'

    def test_extract_valid_year_rejects_1900(self):
        assert extract_valid_year('1900', 1900) == 2024
        assert extract_valid_year('Mar 30, 2020') == 2020
        assert extract_valid_year(None, 2021) == 2021

    def test_infer_publisher_respects_real_publisher(self):
        assert infer_publisher('9780136681557', ['Pearson']) == 'Pearson'
        assert infer_publisher('9780136681557', []) == 'Pearson'
        assert infer_publisher('9786040100028', []) == 'NXB Giao thông Vận tải'

    def test_lookup_curated_clean_code(self):
        res = lookup_isbn_metadata('9780132350884')
        assert res['success'] is True
        assert 'Clean Code' in res['title']
        assert 'Robert C. Martin' in res['author_names']
        assert res['suggested_category_code'] == 'CNTT'
        assert res['cover_image'].startswith('http')

    def test_lookup_kurose_ross_networking(self):
        res = lookup_isbn_metadata('978-0-13-668155-7')
        assert res['success'] is True
        assert 'Computer Networking' in res['title']
        assert 'James F. Kurose' in res['author_names']
        assert res['publisher'] == 'Pearson'
        assert res['year'] == 2021
        assert 'Top-Down Approach' in res['description']
        assert 'NXB Giao thông Vận tải' not in res['description']

    def test_lookup_clrs_algorithms(self):
        res = lookup_isbn_metadata('978-0-26-204630-5')
        assert res['success'] is True
        assert 'Introduction to Algorithms' in res['title']
        assert res['publisher'] == 'The MIT Press'
        assert res['year'] == 2022

    def test_lookup_duong_vao_lap_trinh_python(self):
        res = lookup_isbn_metadata('9786043367249')
        assert res['success'] is True
        assert 'Đường vào lập trình Python' in res['title']
        assert 'Nguyễn Ngọc Giang' in res['author_names']
        assert res['publisher'] == 'NXB Đại học Quốc gia Hà Nội'
        assert res['year'] == 2021

    def test_lookup_unknown_isbn_returns_false_and_no_fake_title(self):
        res = lookup_isbn_metadata('9786049999999')
        assert res['success'] is False
        assert res['found'] is False
        assert 'title' not in res

    def test_lookup_endpoint(self):
        client = APIClient()
        response = client.get('/api/v1/catalog/lookup-isbn?isbn=9780136681557')
        assert response.status_code == 200
        data = response.json().get('data', {})
        assert data.get('success') is True
        assert 'Computer Networking' in data.get('title')
        assert data.get('publisher') == 'Pearson'
        assert data.get('year') == 2021

    def test_lookup_missing_isbn(self):
        client = APIClient()
        response = client.get('/api/v1/catalog/lookup-isbn')
        assert response.status_code == 400
