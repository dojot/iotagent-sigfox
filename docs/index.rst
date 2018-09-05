===============
iotagent-sigfox
===============

|License badge| |Docker badge| |Travis badge|

IoT agents are responsible for receiving messages from physical devices
(directly or through a gateway) and sending them commands in order to configure
them. This iotagent-sigfox, in particular, receives messages via Sigfox's
network server, processes them and update all the attributes from the
associated device.

.. toctree::
   :maxdepth: 2
   :caption: Contents:
   :glob:

   operation
   deployment
   building-documentation


How does it work
================

iotagent-sigfox depends on two things: a Kafka broker, so that it can receive
messages informing it about new devices (and, in extension, about their updates
and removals), and access to a Sigfox network server, so that it can receive
messages from the devices. When a new device is added to dojot, this IoT agent
receives a notification indicating this. Thus, it communicates with the
configured network server, creating a new device type, registering the new
device and properly configuring a callback endpoint so that it will receive any
update related to devices of the same type.


How to build
============

As this is a npm-based project, building it is as simple as

.. code-block:: bash

    npm install
    npm run build


If everything runs fine, the generated code should be in ``./build`` folder.

How to run
==========

As simple as:

.. code-block:: bash

    npm start ./config.json


Remember that you should already have a Kafka node (with a zookeeper instance)
and access to a Sigfox network server.

How do I know if it is working properly?
----------------------------------------

Simply put: you won't. In fact you can implement a simple Kafka publisher to
emulate the behaviour of a device manager instance and a listener to check what
messages it is generating. But it seems easier to get the real components -
they are not that hard to start and to use (given that you use dojot's
`docker-compose`_). Check also `DeviceManager documentation`_ for further
information about how to create a new device.


.. |License badge| image:: https://img.shields.io/badge/license-GPL-blue.svg
   :target: https://opensource.org/licenses/GPL-3.0
.. |Docker badge| image:: https://img.shields.io/docker/pulls/dojot/iotagent-sigfox.svg
   :target: https://hub.docker.com/r/dojot/iotagent-sigfox/
.. |Travis badge| image:: https://travis-ci.org/dojot/iotagent-sigfox.svg?branch=master
   :target: https://travis-ci.org/dojot/iotagent-sigfox#


.. _docker-compose: https://github.com/dojot/docker-compose
.. _DeviceManager documentation: http://dojotdocs.readthedocs.io/projects/DeviceManager/en/latest/
