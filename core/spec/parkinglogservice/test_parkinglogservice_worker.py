import pytest
from pytest_dbfixtures import factories

import pickle

from phantomboreas.parkinglogservice.worker import Worker
from phantomboreas.parkinglogservice.logger import Logger



redis_conf = {
    'host':             'localhost',
    'port':             '?',
    'db_index':         1,
    'queue_key':        'test:parkinglog:queue',
    'processing_key':   'test:parkinglog:processing'
}

redis_proc = factories.redis_proc(host=redis_conf['host'], port=redis_conf['port'])
redisdb = factories.redisdb('redis_proc', db=1)



class TestParkingLogServiceWorker:
    # Unconfigured workers should raise an exception when called to run
    def test_unconfigured_worker(self):
        worker = Worker(Logger())

        with pytest.raises(RuntimeError):
            worker.run()

    # Configured workers with unconfigured loggers should raise an exception
    # when called to run
    def test_configured_worker_with_unconfigured_logger(self):
        worker = Worker(Logger())
        worker.config(redis_conf)

        with pytest.raises(RuntimeError):
            worker.run()

    # Test the Redis fixture
    def test_redis(self, redisdb):
        assert redisdb.echo('Hello, World!') == 'Hello, World!'

    # Show that the worker can dequeue and unpickle payloads from a Redis queue
    def test_worker_redis(self, monkeypatch, redisdb):
        logger = Logger()
        worker = Worker(logger)
        worker.config(redis_conf)

        payload = {'openalpr_results': None}
        def process(p):
            assert all(p[k] == v for k, v in payload.iteritems())

        monkeypatch.setattr(worker, 'redis_client', redisdb)
        monkeypatch.setattr(logger, 'assert_config', lambda: None)
        monkeypatch.setattr(logger, 'process', process)

        redisdb.lpush(redis_conf['queue_key'], pickle.dumps(payload))

        worker.process_alpr()