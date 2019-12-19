
/**
 * Class used to hold data to be published in dojot
 */
export interface IDojotDeviceData {
  /**
   * Device data. 
   * This should be a simple "key-value" structure containing device attributes
   */
  data: any;

  /**
   * Metadata.
   * This should be a simple "key-value" structure containing attribute metadata
   */
  metadata: any;
};
