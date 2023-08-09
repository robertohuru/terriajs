/**
 * Holds data for what the AddressGeocoder returns.
 *
 * @alias BulkAddressGeocoderResult
 * @constructor
 */
class BulkAddressGeocoderResult {
  constructor(
    startTime,
    numberOfAddressesConverted,
    nullAddresses,
    missingAddresses
  ) {
    /**
     * Time geocoder started.
     * @type {JulianDate}
     */
    this.startTime = startTime;

    /**
     * Number of addresses converted to lat-long coordinates.
     * @type {Number}
     */
    this.numberOfAddressesConverted = numberOfAddressesConverted;

    /**
     * Number of addresses that were null.
     * @type {Number}
     */
    this.nullAddresses = nullAddresses;
    /**
     * Addresses that couldn't be geocoded.
     * @type {Array}
     */
    this.missingAddresses = missingAddresses;
  }
}

export default BulkAddressGeocoderResult;