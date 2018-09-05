import util = require("util");
import iotagent = require('dojot-iotagent');
import express = require('express');
import bodyParser = require('body-parser');
import axios, { AxiosResponse, AxiosError, AxiosRequestConfig } from "axios";
import * as Sigfox from "./sigfox-requests";
import { CacheHandler } from "./cache";
import { DojotDeviceTemplate } from './dojot-device-template';
import * as config from "./config";
import { RedisManager } from "./redis-manager";
import { authParse, AuthRequest } from './api/authMiddleware';

/**
 * Sigfox IoT Agent Class
 */
class Agent {

  // IoTAgent lib
  iota: iotagent.IoTAgent;

  // Express application
  app: express.Application;

  // Simpe cache
  cache: CacheHandler;

  setGetScript: string;

  constructor() {
    if (config.sigfox === undefined) {
      throw new Error('Missing Sigfox configuration options');
    }
    this.cache = new CacheHandler();
    this.app = express();
    this.app.use(bodyParser.json());
    this.app.use(authParse as any);
    this.iota = new iotagent.IoTAgent();
    this.iota.init();

    this.setGetScript = __dirname + "/lua/setGet.lua";
  }

  /**
   * Find which template is related to Sigfox data.
   *
   * @param device_info The device info received via Kafka
   * @returns [sigfox ID, Template info] The sigfox device ID and all sigfox
   * template parameter. If not found, return null.
   */
  findSigfoxData(device_info: any): [string, any] | null {
    let sigfox_attrs: any;
    let sigfox_id: string = "";
    for (let template_id of device_info.templates) {
      if (!device_info.attrs.hasOwnProperty(template_id)) {
        continue;
      }
      for (let attr of device_info.attrs[template_id]) {
        if (attr.label !== undefined && attr.label === "device") {
          if (attr.static_value !== undefined) {
            sigfox_attrs = device_info.attrs[template_id];
            sigfox_id = attr.static_value
            break;
          }
        }
      }
      if (sigfox_attrs !== undefined) {
        break;
      }
    }

    if (sigfox_attrs !== undefined) {
      return [sigfox_id, sigfox_attrs];
    }
    return null;
  }

  loadDojotDeviceTemplate(sigfoxTemplate: any): DojotDeviceTemplate | null {
    let deviceTemplate = new DojotDeviceTemplate();
    let temp: any = {};

    // Transform it to a simple key-value JSON
    for (let attr of sigfoxTemplate) {
      if (attr.label !== undefined) {
        temp[attr.label] = attr.static_value;
      }
    }

    // Check that all mandatory parameters were sent.
    if (deviceTemplate.assertAndCopyFrom(temp) === 0) {
      return deviceTemplate;
    } else {
      return null;
    }
  }

  start() {

    this.iota.listTenants()
      .then((tenants: any) => {
        for (let t of tenants) {
          this.iota.listDevices(t, {}).then((devices_info: any) => {
            console.log('Got device list for [%s]', t, devices_info);
            for (let device_id of devices_info) {
              this.iota.getDevice(device_id, t).then((device_info: any) => {
                console.log(' --- Device info (%s)\n', device_id, device_info);
                console.log(util.inspect(device_info, { depth: null }));
                let SigfoxData = this.findSigfoxData(device_info);
                if (SigfoxData !== null) {
                  let [Sigfox_id] = SigfoxData;
                  if (Sigfox_id !== '') {
                    this.cache.correlate_dojot_and_sigfox_device_id(device_id, Sigfox_id);
                  }
                }
              })
            }
          })
        }
      })
      .catch((error: any) => { console.error(error) });

    this.iota.on('device.create', (event: any) => { this.on_create_device(event) });
    this.iota.on('device.update', (event: any) => { this.on_update_device(event) });
    this.iota.on('device.remove', (event: any) => { this.on_delete_device(event) });

    this.app.post('/sigfox', (req: any, res: any) => { this.handle_data(req, res) });

    this.app.post('/sigfox_user', (req: any, res: any) => { this.handle_user(req, res) });

    console.log(`Starting IoT agent at port ${config.agent.port}...`);
    this.app.listen(config.agent.port, () => { console.log(`--- Sigfox IoTAgent running (port ${config.agent.port}) ---`) });
  }

  handle_data(req: any, res: any) {
    console.log('will update', req.body);

    // get device from cache
    let dojot_device_id = this.cache.get_dojot_device_id(req.body.device);

    console.log("Retrieving dojot device id [%s] <-> [%s] from Sigfox id", dojot_device_id, req.body.device);

    req.body.timestamp = new Date(req.body.timestamp * 1000).toISOString();
    req.body.station_coordinates = req.body.station_lat.toString() + "," + req.body.station_lng.toString();

    this.iota.listTenants()
      .then((tenants: any) => {
        for (let t of tenants) {
          this.iota.updateAttrs(dojot_device_id, t, req.body, {});
        }
      })
      .catch((error: any) => { console.error(error) });

    return res.status(200).send();
  }

  handle_user(req: AuthRequest, res: express.Response) {
    let redis = RedisManager.getClient('');
    // Retrieve service
    let service = req.service;
    let username = req.body.username;
    let passwd = req.body.passwd;
    let key = service + "-" + username;

    redis.runScript(this.setGetScript, [key], [passwd], (err: any, passwd: string) => {
      if (err) {
        res.status(500).send("Could not add user to registry");
      } else {
        res.status(200).send("User successfully added to registry");
      };
      return;
    });
  }

  retrieveSigfoxUserPasswd(service: string, username: string): Promise<string> {
    return new Promise((accept, reject) => {
      let redis = RedisManager.getClient('');
      // Retrieve service
      let key = service + "-" + username;

      redis.runScript(this.setGetScript, [key], [], (err: any, passwd: string) => {
        if (err) {
          reject("Error while retrieving password.");
        } else {
          accept(passwd);
        };
        return;
      });
    });
  }

  sendSigfoxRequest(url: string, body: any, username: string, password: string) {
    console.log("Sending Sigfox request...");
    console.log(`Sending to ${url}`);
    let config: AxiosRequestConfig = {
      auth: {
        username,
        password
      }
    }

    axios.post(url, body, config).then((response: AxiosResponse) => {
      console.log("... request successfully processed.");
      console.log(`Received result is: ${response.data}`);
    }).catch((error: AxiosError) => {
      console.log("... request was not successfully processed.");
      console.log(`Error is ${error}.`);
    });
    console.log("... Sigfox request was sent.");
  }

  processDeviceRegistration(service: string, username: string, deviceTypeId: string, sigfoxDeviceData: Sigfox.IDeviceRegistration) {
    this.retrieveSigfoxUserPasswd(service, username).then((passwd: string) => {
      console.log("Registering device...");
      let url = `${config.sigfox.network_server}/api/devicetypes/${deviceTypeId}/devices/bulk/create/async`;
      this.sendSigfoxRequest(url, sigfoxDeviceData, username, passwd);
      console.log("... device registration was requested.");
    }).catch((error: string) => {
      console.log("... device registration failed.");
      console.log(`Error is: ${error}`);
    });
  }


  processDeviceEdition(service: string, username: string, deviceEditionReq: Sigfox.IDeviceEdition) {
    this.retrieveSigfoxUserPasswd(service, username).then((passwd: string) => {
      console.log("Editing device...");
      let url = `${config.sigfox.network_server}/api/devices/bulk/edit`;
      this.sendSigfoxRequest(url, deviceEditionReq, username, passwd);
      console.log("... device registration was requested.");
    }).catch((error: string) => {
      console.log("... device edition failed.");
      console.log(`Error is: ${error}`);
    });
  }


  on_create_device(event: any) {
    console.log('device [%s] created', event.data.id);

    let sigfoxData = this.findSigfoxData(event.data);
    if (sigfoxData === null) {
      console.log("Could not find Sigfox parameters for new device. Bailing out.");
      return;
    }
    let [sigfoxId, sigfoxTemplate] = sigfoxData;

    if (sigfoxId !== '') {
      this.cache.correlate_dojot_and_sigfox_device_id(event.data.id, sigfoxId);
    }

    console.log("Registering device in Sigfox backend...");
    console.log("Building Sigfox request from device data...");
    let dojotTemplateData = this.loadDojotDeviceTemplate(sigfoxTemplate);
    if (dojotTemplateData === null) {
      return;
    }
    let sigfoxRequestData = dojotTemplateData.extractDeviceRegistration();
    let sigfoxTypeId = dojotTemplateData.device_type_id;

    console.log("... Sigfox request was built.");
    console.log("Registering new device in Sigfox backend...");
    this.processDeviceRegistration(event.meta.service, dojotTemplateData.sigfox_user, sigfoxTypeId, sigfoxRequestData);
    console.log("... device registration request was sent.");
  }

  on_update_device(event: any) {
    console.log('device [%s] updated', event.data.id);

    let sigfoxData = this.findSigfoxData(event.data);
    if (sigfoxData === null) {
      console.log("Could not find Sigfox parameters for device edition. Bailing out.");
      return;
    }

    let [sigfoxId, sigfoxTemplate] = sigfoxData;
    if (sigfoxId !== '') {
      this.cache.correlate_dojot_and_sigfox_device_id(event.data.id, sigfoxId);
    }
    console.log("Editing device in Sigfox backend...");
    console.log("Building Sigfox request from device data...");
    let dojotTemplateData = this.loadDojotDeviceTemplate(sigfoxTemplate);
    if (dojotTemplateData === null) {
      return;
    }
    let sigfoxRequestData = dojotTemplateData.extractDeviceEdition();

    console.log("... Sigfox request was built.");
    console.log("Editing device in Sigfox backend...");
    this.processDeviceEdition(event.meta.service, dojotTemplateData.sigfox_user, sigfoxRequestData);
    console.log("... device edition request was sent.");
  }

  on_delete_device(event: any) {
    console.log('device [%s] removed', event.data.id);

    let sigfoxData = this.findSigfoxData(event.data);
    if (sigfoxData === null) {
      console.log("Could not find Sigfox parameters for device removal. Bailing out.");
      return;
    }
    let [sigfoxId] = sigfoxData;
    if (sigfoxId !== '') {
      this.cache.remove_correlation_dojot_and_sigfox_id(event.data.id, sigfoxId);
    }
  }

}

export { Agent };

