"use strict";

const loudness = require('loudness');
let Service, Characteristic;

module.exports = function(homebridge) {
  // Service and Characteristic are from hap-nodejs
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  
  homebridge.registerAccessory("homebridge-pc-volume", "ComputerSpeakers", ComputerSpeakers);
}

function ComputerSpeakers(log, config, api) {
    const name = config["name"];

    this.lightService = new Service.Lightbulb(name);

    this.lightService
		.getCharacteristic(Characteristic.On)
		.on('set', this.setPowerState.bind(this))
		.on('get', this.getPowerState.bind(this));

	this.lightService
		.addCharacteristic(new Characteristic.Brightness())
		.on('set', this.setBrightness.bind(this))
		.on('get', this.getBrightness.bind(this));
}

ComputerSpeakers.prototype.getServices = function getServices() {
	return [this.lightService];
}

ComputerSpeakers.prototype.setPowerState = function setPowerState(powerState, callback) {
    const muted = !powerState;
    loudness.setMuted(muted, callback);
}

ComputerSpeakers.prototype.setBrightness = function setBrightness(volume, callback) {
    loudness.setVolume(volume, callback);
}

ComputerSpeakers.prototype.getPowerState = function getPowerState(callback) {
    loudness.getMuted((error, muted) => {
         if (error !== null) {
             callback(error, null);
         } else {
             callback(null, !muted);
         }
    });
}

ComputerSpeakers.prototype.getBrightness = function getBrightness(callback) {
    loudness.getVolume(callback);
}
