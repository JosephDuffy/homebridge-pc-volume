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
    const services = config["services"] || ["lightbulb"];
    const logarithmic = config["logarithmic"] || false;
    const debug = config["debug"] || false;

    if (services.indexOf("speaker") > -1) {
        this.speakerService = new Service.Speaker(name);

        this.speakerService
            .getCharacteristic(Characteristic.Mute)
            .on('set', this.setMuted.bind(this))
            .on('get', this.getMuted.bind(this));

        this.speakerService
            .addCharacteristic(new Characteristic.Volume())
            .on('set', this.setVolume(logarithmic, debug).bind(this))
            .on('get', this.getVolume(logarithmic, debug).bind(this));
    }

    if (services.indexOf("fan") > -1) {
        this.fanService = new Service.Fan(name);

        this.fanService
            .getCharacteristic(Characteristic.On)
            .on('set', this.setPowerState.bind(this))
            .on('get', this.getPowerState.bind(this));

        this.fanService
            .addCharacteristic(new Characteristic.RotationSpeed())
            .on('set', this.setRotationSpeed(logarithmic, debug).bind(this))
            .on('get', this.getRotationSpeed(logarithmic, debug).bind(this));
    }

    if (services.indexOf("lightbulb") > -1) {
        this.lightService = new Service.Lightbulb(name);

        this.lightService
            .getCharacteristic(Characteristic.On)
            .on('set', this.setPowerState.bind(this))
            .on('get', this.getPowerState.bind(this));

        this.lightService
            .addCharacteristic(new Characteristic.Brightness())
            .on('set', this.setBrightness(logarithmic, debug).bind(this))
            .on('get', this.getBrightness(logarithmic, debug).bind(this));
    }
}

ComputerSpeakers.prototype.getServices = function getServices() {
    return [this.speakerService, this.lightService, this.fanService].filter((service) => !!service);
}

// Speaker

ComputerSpeakers.prototype.setMuted = function setMuted(muted, callback) {
    loudness.setMuted(muted, callback);
}

ComputerSpeakers.prototype.getMuted = function getMuted(callback) {
    loudness.getMuted((error, muted) => {
         if (error !== null) {
             callback(error, null);
         } else {
             callback(null, muted);
         }
    });
}

ComputerSpeakers.prototype.setVolume = function (logarithmic, debug) {
    return function setVolume(volume, callback) {
        if (logarithmic) {
            if (debug) { console.log("Setting volume: " + volume); }
            var logvolume = Math.round(Math.log10(1 + volume) * 50);
            if (debug) { console.log("Setting logarithmic volume: " + logvolume); }
            loudness.setVolume(logvolume, callback);
        } else {
            if (debug) { console.log("Setting volume: " + volume); }
            loudness.setVolume(volume, callback);
        }
    }
}

ComputerSpeakers.prototype.getVolume = function (logarithmic, debug) {
    return function getVolume(callback) {
        if (logarithmic) {
            loudness.getVolume((error, logvolume) => {
                if (debug) { console.log("Getting logarithmic volume: " + logvolume); }
                var volume = Math.round(Math.pow(10, logvolume / 50) - 1);
                if (debug) { console.log("Getting volume: " + volume); }
                callback(error, volume);
            });
        } else {
            loudness.getVolume((error, volume) => {
                if (debug) { console.log("Getting volume: " + volume); }
                callback(error, volume);
            });
        }
    }
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

ComputerSpeakers.prototype.setRotationSpeed = function (logarithmic, debug) {
    return function setRotationSpeed(volume, callback) {
        this.setVolume(logarithmic, debug)(volume, callback);
    }
}

ComputerSpeakers.prototype.getRotationSpeed = function (logarithmic, debug) {
    return function getRotationSpeed(callback) {
        this.getVolume(logarithmic, debug)(callback);
    }
}

// Lightbulb

ComputerSpeakers.prototype.setBrightness = function (logarithmic, debug) {
    return function setBrightness(volume, callback) {
        this.setVolume(logarithmic, debug)(volume, callback);
    }
}

ComputerSpeakers.prototype.getBrightness = function (logarithmic, debug) {
    return function getBrightness(callback) {
        this.getVolume(logarithmic, debug)(callback);
    }
}
