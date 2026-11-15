import pytest
from rest_framework.test import APIClient

@pytest.fixture
def api_client():
    return APIClient()

@pytest.mark.django_db
def test_health_check_returns_200(api_client):
    response = api_client.get('/api/v1/health')
    assert response.status_code == 200
    data = response.json()
    assert data['status'] == 'ok'
    assert data['database'] == 'connected'

@pytest.mark.django_db
def test_openapi_schema_endpoint(api_client):
    response = api_client.get('/api/schema/')
    assert response.status_code == 200
    assert 'openapi' in response.content.decode('utf-8')

@pytest.mark.django_db
def test_swagger_docs_endpoint(api_client):
    response = api_client.get('/api/docs/')
    assert response.status_code == 200
    assert 'swagger' in response.content.decode('utf-8').lower()

@pytest.mark.django_db
def test_public_system_config(api_client):
    response = api_client.get('/api/v1/system/config/public')
    assert response.status_code == 200
    data = response.json()['data']
    assert 'library_name' in data
    assert 'UTH' in data['library_name']

