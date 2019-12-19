# iotagent-sigfox

## How to start

The following environment variables are used by iotagent-sigfox:

```bash
#
# Used by iotagent-nodejs
#

# Where to find DeviceManager
export DEVM_ADDRESS="device-manager:5000"

# Where to find Auth
export AUTH_ADDRESS="auth:5000"

# Where to find Data-Broker
export DATA_BROKER_ADDRESS="data-broker:80"

# Where to find Kafka
export KAFKA_ADDRESS="kafka:9092"

#
# Used by iotagent-sigfox
#

# Where Sigfox backend can be accessed
export SIGFOX_BACKEND_SERVER="localhost:8008"
# Where an instance of Redis can be accessed
export IOTAGENT_SIGFOX_CACHE_HOST="iotagent-sigfox-redis"

# Port on which the agent will listen for new sigfox users and sigfox backend
# callback requests (containing data from devices)
export IOTAGENT_SIGFOX_PORT=80

```

In order to build iotagent-sigfox, the following command should be executed

```bash
npm run build
```

In order to start it, execute the following command

```bash
npm start
```
