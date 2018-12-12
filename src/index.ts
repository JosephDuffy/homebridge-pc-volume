"use strict";

import loudness = require('loudness');
let Service, Characteristic;

module.exports = function(homebridge) {
    // Service and Characteristic are from hap-nodejs
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;

    homebridge.registerAccessory("homebridge-pc-volume", "ComputerSpeakers", ComputerSpeakers);
}

function ComputerSpeakers(log, config, api) {
    const name = config["name"];
    const services = config["services"] || ["lightbulb"];

    if (services.indexOf("speaker") > -1) {
        this.speakerService = new Service.Speaker(name);

        this.speakerService
            .getCharacteristic(Characteristic.Mute)
            .on('set', this.setMuted.bind(this))
            .on('get', this.getMuted.bind(this));

        this.speakerService
            .addCharacteristic(new Characteristic.Volume())
            .on('set', this.setVolume.bind(this))
            .on('get', this.getVolume.bind(this));
    }

    if (services.indexOf("fan") > -1) {
        this.fanService = new Service.Fan(name);

        this.fanService
            .getCharacteristic(Characteristic.On)
            .on('set', this.setPowerState.bind(this))
            .on('get', this.getPowerState.bind(this));

        this.fanService
            .addCharacteristic(new Characteristic.RotationSpeed())
            .on('set', this.setRotationSpeed.bind(this))
            .on('get', this.getRotationSpeed.bind(this));
    }

    if (services.indexOf("lightbulb") > -1) {
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
}

ComputerSpeakers.prototype.getServices = function getServices() {
    return [this.speakerService, this.lightService, this.fanService].filter((service) => !!service);
}

// Speaker

ComputerSpeakers.prototype.setMuted = function setMuted(muted, callback) {
    loudness.setMuted(muted).then(callback);
}

ComputerSpeakers.prototype.getMuted = function getMuted(callback) {
    loudness.getMuted().then((muted) => {
        callback(null, muted);
    }).catch((error) => {
        callback(error, null);
    });
}

ComputerSpeakers.prototype.setVolume = function setVolume(volume, callback) {
    loudness.setVolume(volume).then(callback);
}

ComputerSpeakers.prototype.getVolume = function getVolume(callback) {
    loudness.getVolume().then((volume) => {
        callback(null, volume);
    }).catch((error) =>  {
        callback(error, null);
    });
}

// Shared

ComputerSpeakers.prototype.setPowerState = function setPowerState(powerState, callback) {
    const muted = !powerState;
    this.setMuted(muted, callback);
}

ComputerSpeakers.prototype.getPowerState = function getPowerState(callback) {
    this.getMuted((error, muted) => {
         if (error !== null) {
             callback(error, null);
         } else {
             callback(null, !muted);
         }
    });
}

// Fan

ComputerSpeakers.prototype.setRotationSpeed = function setRotationSpeed(volume, callback) {
    this.setVolume(volume, callback);
}

ComputerSpeakers.prototype.getRotationSpeed = function getRotationSpeed(callback) {
    this.getVolume(callback);
}

// Lightbulb

ComputerSpeakers.prototype.setBrightness = function setBrightness(volume, callback) {
    this.setVolume(volume, callback);
}

ComputerSpeakers.prototype.getBrightness = function getBrightness(callback) {
    this.getVolume(callback);
}
