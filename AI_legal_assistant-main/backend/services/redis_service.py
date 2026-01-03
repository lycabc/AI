import pickle
import redis

redis_client = redis.Redis(
    host='redis-14314.c326.us-east-1-3.ec2.cloud.redislabs.com',
    port=14314,
    password="WpQwPjYM55QHwQ3KpEDqoH6PS87Cyc4V",
)


class RedisService:

    @staticmethod
    def get(key):
        try:
            data = redis_client.get(key)
            return pickle.loads(data) if data else None
        except Exception as e:
            raise e

    @staticmethod
    def set(key, value, ttl=7200, keepttl=False):
        try:
            value = pickle.dumps(value)
            if keepttl:
                redis_client.set(key, value, keepttl=keepttl)
            else:
                redis_client.set(key, value, ttl)
        except Exception as e:
            raise e
