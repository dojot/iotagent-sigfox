# iotagent-sigfox

Environment variables:


```bash
  # Where Kafka is located
  export KAFKA_ADDRESS=kafka:9092
  # Where data-broker is located
  export DATA_BROKER_ADDRESS=data-broker:80
  # Where auth service can be reached
  export AUTH_ADDRESS=auth:5000
  # Where device-manager is located
  export DEVM_ADDRESS=device-manager:5000
  # Where sigfox backend server is
  export SIGFOX_BACKEND_SERVER=localhost:8008
  # Where a Redis instance is (to store device-related data)
  export IOTAGENT_SIGFOX_CACHE_HOST=iotagent-sigfox-redis
  # Which port will be used by this IoT agent to receive messages from backend
  export IOTAGENT_SIGFOX_PORT=80
```