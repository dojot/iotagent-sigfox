
export interface IDeviceID {
  /** Device ID to be registered */
  id: string;
  /** Porting Authorization Code for this device */
  pac: string;
}

/**
 * Device registation request
 */
export interface IDeviceRegistration {
  /** Name prefix for each device */
  prefix: string;
  /** Device identifiers to be registered */
  ids: IDeviceID[];
  /** Product Authorization Key for this device. */
  productCertificate: string;
}

export interface IDeviceRegistrationResponse {
  /**
   * Job ID used to request device registration status.
   */
  jobId: string;
  /**
   * Total number of devices pushed in the request
   */
  total: number;
  /**
   * List of devices with invalid PAC or ownership transfer was rejected.
   */
  transferFailed: string[];
}

/**
 * Device edition request
 */
export interface IDeviceEdition {
  /** Device ID to change */
  id: string;
  /** New device name */
  name?: string;
  /** New device latitude */
  lat?: string;
  /** New device longitude */
  lng?: string;
  /** New device type */
  deviceTypeId?: string;
  /** New product certificate */
  productCertificate?: string;
}

/**
 * Device edition response
 */
export interface IDeviceEditionResponse {
  /** Total number of successful edited devices */
  total: number;
  /** Total number of errors */
  error: number;
  /** Error messsages */
  log: string[];
}