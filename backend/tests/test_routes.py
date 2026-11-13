"""Unit tests for key Flask API routes (no live server)."""

from unittest.mock import patch


class TestStatusAndLights:
    def test_status_endpoint(self, client):
        resp = client.get('/api/status')
        assert resp.status_code == 200
        data = resp.get_json()
        assert data['status'] in ('healthy', 'degraded')
        assert 'timestamp' in data
        assert 'version' in data

    def test_root_health(self, client):
        resp = client.get('/')
        assert resp.status_code == 200
        assert resp.get_json()['status'] in ('healthy', 'degraded')

    def test_get_lights(self, client):
        resp = client.get('/api/lights')
        assert resp.status_code == 200
        data = resp.get_json()
        for room in ('living_room', 'kitchen', 'bedroom', 'bathroom', 'office'):
            assert room in data

    def test_control_light_on(self, client, app_module):
        resp = client.post(
            '/api/lights/living_room/control',
            json={'action': 'on', 'brightness': 75},
        )
        assert resp.status_code == 200
        data = resp.get_json()
        assert data['status'] == 'on'
        assert data['brightness'] == 75
        assert app_module.lights_state['living_room']['status'] == 'on'

    def test_control_light_unknown_room(self, client):
        resp = client.post(
            '/api/lights/attic/control',
            json={'action': 'on', 'brightness': 50},
        )
        assert resp.status_code == 404

    def test_control_light_invalid_body(self, client):
        resp = client.post(
            '/api/lights/kitchen/control',
            data='not-json',
            content_type='text/plain',
        )
        assert resp.status_code == 400

    def test_toggle_light(self, client, app_module):
        before = app_module.lights_state['bedroom']['status']
        resp = client.post('/api/lights/bedroom/toggle')
        assert resp.status_code == 200
        data = resp.get_json()
        assert data['status'] in ('on', 'off')
        assert data['status'] != before
        assert app_module.lights_state['bedroom']['status'] == data['status']

    def test_brightness_endpoint(self, client, app_module):
        resp = client.post(
            '/api/lights/office/brightness',
            json={'brightness': 40},
        )
        assert resp.status_code == 200
        assert resp.get_json()['brightness'] == 40
        assert app_module.lights_state['office']['brightness'] == 40


class TestAIAndSchedules:
    def test_ai_status(self, client):
        demo_weather = {
            'main': {'temp': 70, 'humidity': 50},
            'weather': [{'main': 'Clear', 'description': 'clear sky'}],
            'name': 'Test City',
        }
        with patch('app.get_weather_data', return_value=demo_weather):
            with patch('app.get_weather_lighting_adjustment', return_value=1.0):
                with patch('app.get_natural_light_factor', return_value=0.5):
                    with patch('app.optimize_brightness', return_value=80):
                        resp = client.get('/api/ai/status')
        assert resp.status_code == 200
        data = resp.get_json()
        assert 'ai_mode_enabled' in data
        assert 'predictions' in data

    def test_ai_mode_toggle(self, client, app_module):
        with patch('app.ai_control_lights'):
            resp = client.post('/api/ai/mode', json={'enabled': False})
        assert resp.status_code == 200
        data = resp.get_json()
        assert data['ai_mode_enabled'] is False
        assert app_module.ai_mode_enabled is False

    def test_get_schedules(self, client):
        resp = client.get('/api/schedules')
        assert resp.status_code == 200
        data = resp.get_json()
        assert isinstance(data, dict)
        assert 'living_room' in data


class TestWeather:
    def test_weather_demo_response(self, client):
        with patch('app.WEATHER_API_KEY', 'demo_key'):
            with patch('app.get_weather_data', return_value={
                'main': {'temp': 72, 'humidity': 65, 'pressure': 1013, 'feels_like': 70},
                'weather': [{'main': 'Clouds', 'description': 'scattered clouds'}],
                'name': 'New York',
            }):
                with patch('app.get_weather_lighting_adjustment', return_value=1.0):
                    with patch('app.get_natural_light_factor', return_value=0.5):
                        resp = client.get('/api/weather')
        assert resp.status_code == 200
        data = resp.get_json()
        assert 'weather' in data
        assert data.get('using_demo') is True
