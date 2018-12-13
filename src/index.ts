"use strict";

import loudness = require('loudness');
let Service, Characteristic;

module.exports = function(homebridge) {
    // Service and Characteristic are from hap-nodejs
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;

    homebridge.registerAccessory("homebridge-pc-volume", "ComputerSpeakers", ComputerSpeakers);
}

class ComputerSpeakers {

    private speakerService: any | undefined;
    private fanService: any | undefined;
    private lightService: any | undefined;
    private log: {
        debug: (...message: string[]) => void
        info: (...message: string[]) => void
        warn: (...message: string[]) => void
        error: (...message: string[]) => void
    }

    constructor(log, config, api) {
        this.log = log;
        const name = config["name"];
        const services = config["services"] || ["lightbulb"];

        if (services.indexOf("speaker") > -1) {
            log.debug("Creating speaker service");
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
            log.debug("Creating fan service");
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
            log.debug("Creating lightbulb service");
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

    public getServices() {
        return [this.speakerService, this.lightService, this.fanService].filter((service) => service !== undefined);
    }

    // Speaker

    private setMuted(muted, callback) {
        this.log.debug(`Setting muted status to ${muted}%`);
        loudness.setMuted(muted).then(() => {
            this.log.debug(`Set muted status to ${muted}%`);
            callback();
        }).catch((error) => {
            this.log.error(`Failed to set muted status to ${muted}%: ${error}`);
        });
    }

    private getMuted(callback) {
        this.log.debug(`Getting muted status`);
        loudness.getMuted().then((muted) => {
            this.log.debug(`Got muted status: ${muted}%`);
            callback(null, muted);
        }).catch((error) => {
            this.log.debug(`Failed to get muted status: ${error}`);
            callback(error, null);
        });
    }

    private setVolume(volume, callback) {
        this.log.debug(`Setting volume to ${volume}%`);
        loudness.setVolume(volume).then(() => {
            this.log.debug(`Set volume to ${volume}%`);
            callback
        }).catch((error) => {
            this.log.error(`Failed to set volume to ${volume}%: ${error}`);
        });
    }

    private getVolume(callback) {
        this.log.debug(`Getting volume`);
        loudness.getVolume().then((volume) => {
            this.log.debug(`Got volume: ${volume}%`);
            callback(null, volume);
        }).catch((error) => {
            this.log.debug(`Failed to get volume: ${error}`);
            callback(error, null);
        });
    }

    // Shared

    private setPowerState(powerState, callback) {
        const muted = !powerState;
        this.setMuted(muted, callback);
    }

    private getPowerState(callback) {
        this.getMuted((error, muted) => {
            if (error !== null) {
                callback(error, null);
            } else {
                callback(null, !muted);
            }
        });
    }

    // Fan

    private setRotationSpeed(volume, callback) {
        this.setVolume(volume, callback);
    }

    private getRotationSpeed(callback) {
        this.getVolume(callback);
    }

    // Lightbulb

    private setBrightness(volume, callback) {
        this.setVolume(volume, callback);
    }

    private getBrightness(callback) {
        this.getVolume(callback);
    }
}
