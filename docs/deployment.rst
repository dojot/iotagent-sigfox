Deployment
==========

This document will show how to properly deploy an IoT agent SigFox in your 
current dojot deployment. This page assume that the deployment used the 
docker-compose scheme from repository `dojot/docker-compose`.

Build docker image
------------------

The first step to be executed is to build a Docker image. This can be done by
executing the following command:

.. code-block:: bash

  docker build -t iotagent-sigfox .


After building it, you can add it to docker-compose.yml (assuming you are using
docker-compose. Other tools, such as Kubernetes, have their particular mechanism
to add new services into the deployment). The following services should be added
to docker-compose.yml file:

.. code-block:: yaml

  iotagent-sigfox-redis:
    image: redis:alpine
    restart: always
    logging:
      driver: json-file
      options:
        max-size: 100m

  iotagent-sigfox:
    image: iotagent-sigfox
    depends_on:
      - iotagent-sigfox-redis
      - kafka
      - data-broker
      - auth
    restart: always
    logging:
      driver: json-file
      options:
        max-size: 100m

Also, ``kong.config.sh`` script should also be changed. This modification will
configure Kong to forward all requests received for ``/sigfox`` endpoint to 
iotagent-sigfox. You can add the following lines to the end of this script:

.. code-block:: bash
  
  (curl -o /dev/null ${kong}/apis -sS -X PUT \
      --header "Content-Type: application/json" \
      -d @- ) <<PAYLOAD
  {
      "name": "iotagent-sigfox",
      "uris": ["/sigfox", "/sigfox_user"],
      "strip_uri": false,
      "upstream_url": "http://iotagent-sigfox:80"
  }
  PAYLOAD

After this, you'll need to rerun kong-config service (to apply this new 
configuration to Kong):

.. code-block:: bash

    docker-compose up kong-config

At last, the IoT agent can be started:

.. code-block:: bash

    docker-compose up -d iotagent-sigfox


To use this IoT agent, you must add Sigfox user, used to register new devices
in sigfox backend servers and, sigfox template using this user and add a few
Sigfox devices. There a sample template to be used in `Operation` section and a
simple exemple of how to add users. To test whether everything is working, you
could send some dummy messages, like these:

.. code-block:: bash

    curl -X POST ${DOJOT_HOST}/sigfox -H "Content-Type:application/json" -d '
      {
        "timestamp": '$(date +%s)',
        "station_lat": 0,
        "station_lng": 0,
        "data": "sample-data",
        "device" : "device_id_1"
      }'

This will send the "sample-data" message payload to a particular device (sigfox
ID is ```device_id_1```).