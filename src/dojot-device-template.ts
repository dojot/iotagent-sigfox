"use strict";

import * as sigfox from "./sigfox-requests";

export class DojotDeviceTemplate {
  public device: string;
  public pac_number: string;
  public product_certificate: string;
  public sigfox_user: string;
  public device_type_id: string;
  public device_coordinates: string;
  public avg_snr: number;
  public rssi: number;
  public seq_number: number;
  public snr: number;
  public station: string;
  public station_coordinates: string;


  constructor() {
    this.device = "";
    this.pac_number = "";
    this.product_certificate = "";
    this.sigfox_user = "";
    this.device_type_id = "";
    this.device_coordinates = "";
    this.avg_snr = 0;
    this.rssi = 0;
    this.seq_number = 0;
    this.snr = 0;
    this.station = "";
    this.station_coordinates = "";
  }

  public copyFrom(copy: DojotDeviceTemplate) {
    this.device = copy.device;
    this.pac_number = copy.pac_number;
    this.product_certificate = copy.product_certificate;
    this.sigfox_user = copy.sigfox_user;
    this.device_type_id = copy.device_type_id;
    this.device_coordinates = copy.device_coordinates;
    this.avg_snr = copy.avg_snr;
    this.rssi = copy.rssi;
    this.seq_number = copy.seq_number;
    this.snr = copy.snr;
    this.station = copy.station;
    this.station_coordinates = copy.station_coordinates;
  }

  public assertAndCopyFrom(data: any): number {
    let copy = data as DojotDeviceTemplate;
    for (let attr in this) {
      if (this.hasOwnProperty(attr)) {
        if (!(attr in data)) {
          return -1;
        }
      }
    }
    this.copyFrom(copy);
    return 0;
  }

  public extractDeviceRegistration(): sigfox.IDeviceRegistration {
    let ret: sigfox.IDeviceRegistration = {
      prefix: "dojot-sigfox-",
      ids: [{ id: this.device, pac: this.pac_number }],
      productCertificate: this.product_certificate,
    }
    return ret;
  }

  public extractDeviceEdition(): sigfox.IDeviceEdition {
    let ret: sigfox.IDeviceEdition = {
      id: this.device,
      deviceTypeId: this.device_type_id,
      productCertificate: this.product_certificate
    };
    let result = this.device_coordinates.match(/^ *([+-]?\d*\.?\d*) *, *([+-]?\d*\.?\d*) *$/);
    if (result !== null) {
      ret.lat = result[1];
      ret.lng = result[2];
    }
    return ret;
  }
}
