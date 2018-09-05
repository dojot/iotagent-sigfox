Operation
=========


Configuration
=============

iotagent-sigfox configuration is pretty simple. It is mainly configured by
environment variables, which are (with default values):

.. code-block:: bash

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

Receiving messages from DeviceManager via Kafka
===============================================

Messages containing device operations should be in this format:

.. code-block:: json

    {
      "event": "create",
      "meta": {
        "service": "admin"
      },
      "data": {
        "id": "efac",
        "attrs" : {
          "1": [
            {
              "template_id": "1",
              "label": "device",
              "value_type": "string",
              "type": "static",
              "id": 1
            }
          ]
        }
      }
    }

These messages are related to device creation, update, removal and actuation events.
For creation and update operations, it contains the device data model
to be added or updated. For removal operation, it will contain only the device
ID being removed. The actuation operation will contain all attributes previously
created with their respective values.

The documentation related to this message can be found in `DeviceManager
Messages`_.

Registering SigFox users in iotagent-sigfox
-------------------------------------------

Before creating any device, a SigFox user must be registered in iotagent-sigfox
so it can create devices. This is done by sending a POST request to it:

.. code-block: bash

    curl -X POST localhost:8000/sigfox_user \
       -H "Authorization: Bearer ${JWT}" \
       -H "Content-Type:application/json" \
       -d '{"sigfox_user": "123456", "passwd": "xyzabcfd"}'


This will be stored internally by iotagent-sigfox and it won't be retrievable
nor removable, but it is rewritable. If one must invalidate a particular user,
then its password must be updated to an invalid one.

Device configuration for iotagent-sigfox
----------------------------------------

The following device attributes are considered by iotagent-sigfox. All these
attributes are of ``static_value`` type.

.. list-table:: Device attributes for iotagent-sigfox
    :header-rows: 1

    * - Attribute
      - Attribute type
      - Description
      - Example
    * - device
      - static
      - SigFox device ID
      - "3DE15A"
    * - pac_number
      - static
      - Porting Authorization Code for this device
      - "6A757C859B23471B"
    * - product_certificate
      - static
      - Product certificate key to associate to each device (optional)
      - "P_0004_D356_03"
    * - sigfox_user
      - static
      - SigFox user to be associated to this device. The registration will be
        performed on behalf of this user.
      - "897987231"
    * - device_type_id
      - static
      - SigFox device type ID
      - "875928d"
    * - device_coordinates
      - static
      - Device coordinates
      - "-22.8742,-47.0505"
    * - avg_snr
      - dynamic
      - Average received SNR
      - 64.04
    * - rssi
      - dynamic
      - Received RSSI
      - -75.6
    * - seq_number
      - dynamic
      - Message sequence number
      - 1356
    * - snr
      - dynamic
      - Last received SNR
      - 65.2
    * - station
      - dynamic
      - Station associated to this device
      - "6C47"
    * - station_coordinates
      - dynamic
      - Station geolocation
      - "-22.8742,-47.0505"


Example
*******

The following message serves as an example of a device with all attributes used
by iotagent-sigfox.

.. code-block:: json

    {
      "label": "Sigfox Device",
      "attrs": [
        {
          "label": "device",
          "type": "static",
          "value_type": "string",
          "static_value": "device_id_1"
        },
        {
          "label": "pac_number",
          "type": "static",
          "value_type": "string",
          "static_value": "6A757C859B23471B"
        },
        {
          "label": "product_certificate",
          "type": "static",
          "value_type": "string",
          "static_value": "P_0004_D356_03"
        },
        {
          "label": "sigfox_user",
          "type": "static",
          "value_type": "string",
          "static_value": "98792872"
        },
        {
          "label": "device_type_id",
          "type": "static",
          "value_type": "string",
          "static_value": "8498761"
        },
        {
          "label": "device_coordinates",
          "type": "static",
          "value_type": "geo:point",
          "static_value": "-22.8742,-47.0505"
        },
        {
          "label": "avg_snr",
          "type": "dynamic",
          "value_type": "float"
        },
        {
          "label": "rssi",
          "type": "dynamic",
          "value_type": "float"
        },
        {
          "label": "seq_number",
          "type": "dynamic",
          "value_type": "integer"
        },
        {
          "label": "snr",
          "type": "dynamic",
          "value_type": "float"
        },
        {
          "label": "station",
          "type": "dynamic",
          "value_type": "string"
        },
        {
          "label": "station_coordinates",
          "type": "dynamic",
          "value_type": "geo:point"
        }
      ]
    }

With these parameters, iotagent-sigfox will register a new device.
iotagent-sigfox assumes that device type is already created and all callback
registration is already configured in SigFox backend.


.. _DeviceManager Concepts: http://dojotdocs.readthedocs.io/projects/DeviceManager/en/latest/concepts.html
.. _DeviceManager Messages: http://dojotdocs.readthedocs.io/projects/DeviceManager/en/latest/kafka-messages.html
.. _dojot documentation: http://dojotdocs.readthedocs.io/en/latest/
.. _docker-compose: https://github.com/dojot/docker-compose
