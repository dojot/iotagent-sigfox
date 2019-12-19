class CacheHandler {
  // Map correlating dojot's device ID and sigfox's device ID
  dojot_to_sigfox: {
    [id: string]: string
  }

  // Map correlating sigfox's device ID and dojot's device ID
  sigfox_to_dojot: {
    [id: string]: {deviceId: string, templates: string[]}
  }

  constructor() {
    this.dojot_to_sigfox = {};
    this.sigfox_to_dojot = {};
  }

  correlate_dojot_and_sigfox_device_id(dojot_device_id: string, templates: string[], sigfox_device_id: string) {
    this.dojot_to_sigfox[dojot_device_id] = sigfox_device_id;
    this.sigfox_to_dojot[sigfox_device_id] = {deviceId: dojot_device_id, templates};

    console.log("Adding correlation dojot [%s] <-> [%s] sigfox", dojot_device_id, sigfox_device_id);
  }

  remove_correlation_dojot_and_sigfox_id(dojot_device_id: string, sigfox_device_id: string) {
    delete this.dojot_to_sigfox[dojot_device_id];
    delete this.sigfox_to_dojot[sigfox_device_id];

    console.log("Removing correlation dojot [%s] <-> [%s] sigfox", dojot_device_id, sigfox_device_id);
  }

  get_dojot_device_id(sigfox_device_id: string): {deviceId: string, templates: string[]} {
    return this.sigfox_to_dojot[sigfox_device_id];
  }

  get_sigfox_device_id(dojot_device_id: string) : string {
      return this.dojot_to_sigfox[dojot_device_id];
  }
}

export {CacheHandler};
