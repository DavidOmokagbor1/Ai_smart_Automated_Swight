"""Unit tests for occupancy prediction and energy-optimization helpers."""

from datetime import datetime

import numpy as np
import pytest

from ai_models import (
    AdvancedEnergyOptimizer,
    AdvancedOccupancyPredictor,
    generate_enhanced_training_data,
    get_ai_models,
)


@pytest.fixture
def predictor(tmp_path, monkeypatch):
    """Fresh predictor that will not load/save models from the repo root."""
    monkeypatch.chdir(tmp_path)
    # Bypass load_model side effects from __init__ by constructing after chdir
    pred = AdvancedOccupancyPredictor.__new__(AdvancedOccupancyPredictor)
    from sklearn.ensemble import RandomForestClassifier
    from sklearn.preprocessing import StandardScaler, LabelEncoder
    from collections import deque
    import threading
    from datetime import timedelta

    pred.model = RandomForestClassifier(n_estimators=10, random_state=42, n_jobs=1)
    pred.scaler = StandardScaler()
    pred.label_encoder = LabelEncoder()
    pred.is_trained = False
    pred.model_path = str(tmp_path / 'advanced_occupancy_model.pkl')
    pred.scaler_path = str(tmp_path / 'occupancy_scaler.pkl')
    pred.encoder_path = str(tmp_path / 'occupancy_encoder.pkl')
    pred.training_history = []
    pred.feature_importance = {}
    pred.online_learning_buffer = deque(maxlen=10)
    pred.learning_lock = threading.Lock()
    pred.last_retrain = datetime.now()
    pred.retrain_interval = timedelta(hours=24)
    return pred


@pytest.fixture
def optimizer():
    return AdvancedEnergyOptimizer()


class TestOccupancyFeatureEngineering:
    def test_prepare_features_shape_without_weather(self, predictor):
        features = predictor.prepare_advanced_features(
            '2024-06-15T14:30:00',
            'kitchen',
        )
        assert features.shape[0] == 1
        assert features.shape[1] > 10
        assert np.isfinite(features).all()

    def test_prepare_features_includes_weather(self, predictor):
        weather = {
            'main': {'temp': 18.5, 'humidity': 70},
            'weather': [{'main': 'Rain'}],
        }
        with_weather = predictor.prepare_advanced_features(
            '2024-06-15T14:30:00', 'living_room', weather_data=weather
        )
        without = predictor.prepare_advanced_features(
            '2024-06-15T14:30:00', 'living_room'
        )
        # Weather adds temperature/humidity/condition flags
        assert with_weather.shape[1] > without.shape[1]

    def test_room_encoding_differs_by_room(self, predictor):
        kitchen = predictor.prepare_advanced_features('2024-06-15T10:00:00', 'kitchen')
        bedroom = predictor.prepare_advanced_features('2024-06-15T10:00:00', 'bedroom')
        assert not np.array_equal(kitchen, bedroom)

    def test_is_holiday(self, predictor):
        assert predictor._is_holiday(datetime(2024, 1, 1)) == 1
        assert predictor._is_holiday(datetime(2024, 12, 25)) == 1
        assert predictor._is_holiday(datetime(2024, 6, 15)) == 0

    def test_encode_weather(self, predictor):
        assert predictor._encode_weather('Clear') == 0
        assert predictor._encode_weather('Rain') == 2
        assert predictor._encode_weather('Unknown') == 0

    def test_predict_untrained_returns_default(self, predictor):
        assert predictor.predict('2024-06-15T10:00:00', 'office') == 0.5

    def test_train_and_predict_on_small_dataset(self, predictor, monkeypatch):
        monkeypatch.setattr(predictor, 'save_model', lambda: None)
        # Build a tiny, balanced dataset covering a few rooms/hours
        data = []
        for day in range(5):
            for hour in (8, 12, 20):
                for room, occupied in (
                    ('office', hour == 8 or hour == 12),
                    ('bedroom', hour == 20),
                    ('kitchen', hour == 12),
                ):
                    ts = datetime(2024, 3, day + 1, hour, 0, 0).isoformat()
                    data.append({
                        'timestamp': ts,
                        'room': room,
                        'occupied': occupied,
                        'user_activity': {'recent_activity': 1, 'preference': 0.5},
                    })

        accuracy = predictor.train(data)
        assert predictor.is_trained is True
        assert 0.0 <= accuracy <= 1.0

        prob = predictor.predict(datetime(2024, 3, 3, 8, 0, 0).isoformat(), 'office')
        assert 0.0 <= prob <= 1.0


class TestEnergyOptimizer:
    def test_optimize_brightness_bounds(self, optimizer):
        brightness = optimizer.optimize_brightness_advanced(
            room='living_room',
            current_time=datetime(2024, 6, 15, 20, 0, 0),
            natural_light_level=0.2,
            occupancy_probability=0.9,
        )
        assert 15 <= brightness <= 100

    def test_weather_adjustment_rain_brighter(self, optimizer):
        clear = optimizer._calculate_weather_adjustment(
            {'main': {'temp': 20}, 'weather': [{'main': 'Clear'}]}
        )
        rainy = optimizer._calculate_weather_adjustment(
            {'main': {'temp': 20}, 'weather': [{'main': 'Rain'}]}
        )
        assert rainy > clear

    def test_occupancy_adjustment_extremes(self, optimizer):
        low = optimizer._calculate_occupancy_adjustment(0.1)
        high = optimizer._calculate_occupancy_adjustment(0.95)
        assert low < high
        assert low == pytest.approx(0.3)

    def test_room_adjustment(self, optimizer):
        assert optimizer._get_room_adjustment('bedroom') < optimizer._get_room_adjustment('bathroom')
        assert optimizer._get_room_adjustment('unknown_room') == 1.0

    def test_base_brightness_night_dimmer_than_evening(self, optimizer):
        evening = optimizer._calculate_base_brightness(
            'living_room', datetime(2024, 6, 15, 19, 0, 0), 0.1
        )
        night = optimizer._calculate_base_brightness(
            'living_room', datetime(2024, 6, 15, 2, 0, 0), 0.1
        )
        assert night < evening


class TestTrainingDataAndExports:
    def test_generate_training_data_structure(self, monkeypatch):
        """Structural check with a shortened day loop (builtin range patch)."""
        real_range = range

        def short_range(*args):
            if args == (90,):
                return real_range(2)
            return real_range(*args)

        import builtins
        monkeypatch.setattr(builtins, 'range', short_range)
        monkeypatch.setattr(np.random, 'random', lambda: 0.5)
        monkeypatch.setattr(np.random, 'normal', lambda *a, **k: 0.0)
        monkeypatch.setattr(np.random, 'randint', lambda *a, **k: 1)

        data = generate_enhanced_training_data()
        assert len(data) == 2 * 5 * 24  # 2 days × 5 rooms × 24 hours
        sample = data[0]
        assert {'timestamp', 'room', 'occupied'}.issubset(sample.keys())
        assert isinstance(sample['occupied'], (bool, np.bool_))

    def test_get_ai_models_keys(self):
        models = get_ai_models()
        assert set(models.keys()) == {
            'occupancy_predictor',
            'energy_optimizer',
            'behavior_learner',
            'schedule_optimizer',
        }
