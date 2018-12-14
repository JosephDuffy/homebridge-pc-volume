"use strict";

import loudness = require('loudness');
import Config from './config';
import Homebridge from './homebridge';
// hap-nodejs is used for the types, but the instances
// provided by homebridge are used to ensure compatibility
import 'hap-nodejs';
let Service: HAPNodeJS.Service;
let Characteristic: HAPNodeJS.Characteristic;
let UUIDGen: HAPNodeJS.uuid;

module.exports = function(homebridge: Homebridge) {
    // Service and Characteristic are from hap-nodejs
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    UUIDGen = homebridge.hap.uuid;

    homebridge.registerAccessory("homebridge-pc-volume", "ComputerSpeakers", ComputerSpeakers);
}

class ComputerSpeakers {

    private speakerService: HAPNodeJS.Service | undefined;
    private fanService: HAPNodeJS.Service | undefined;
    private lightService: HAPNodeJS.Service | undefined;
    private log: Homebridge.Log;

    constructor(log: Homebridge.Log, config: Config) {
        this.log = log;
        const name = config["name"];
        const services = config["services"] || [Config.Service.Lightbulb];
        const logarithmic = config["logarithmic"] || false;

        // The same UUID is used for each of the services, but a different
        // subsystem is used. This might not be needed because they are each
        // different types of services, but it shouldn't do any harm
        const uuid = UUIDGen.generate(name);

        if (services.indexOf(Config.Service.Speaker) > -1) {
            log.debug("Creating speaker service");

            this.speakerService = new Service.Speaker(name, uuid, Config.Service.Speaker);

            this.speakerService
                .getCharacteristic(Characteristic.Mute)
                .on('set', this.setMuted.bind(this))
                .on('get', this.getMuted.bind(this));

            this.speakerService
                .addCharacteristic(Characteristic.Volume)
                .on('set', this.setVolume.bind(this, logarithmic))
                .on('get', this.getVolume.bind(this, logarithmic));
        }

        if (services.indexOf(Config.Service.Fan) > -1) {
            log.debug("Creating fan service");
            this.fanService = new Service.Fan(name, uuid, Config.Service.Fan);

            this.fanService
                .getCharacteristic(Characteristic.On)
                .on('set', this.setPowerState.bind(this))
                .on('get', this.getPowerState.bind(this));

            this.fanService
                .addCharacteristic(Characteristic.RotationSpeed)
                .on('set', this.setVolume.bind(this, logarithmic))
                .on('get', this.getVolume.bind(this, logarithmic));
        }

        if (services.indexOf(Config.Service.Lightbulb) > -1) {
            log.debug("Creating lightbulb service");
            this.lightService = new Service.Lightbulb(name, uuid, Config.Service.Lightbulb);

            this.lightService
                .getCharacteristic(Characteristic.On)
                .on('set', this.setPowerState.bind(this))
                .on('get', this.getPowerState.bind(this));

            this.lightService
                .addCharacteristic(Characteristic.Brightness)
                .on('set', this.setVolume.bind(this, logarithmic))
                .on('get', this.getVolume.bind(this, logarithmic));
        }
    }

    public getServices() {
        return [this.speakerService, this.lightService, this.fanService].filter((service) => service !== undefined);
    }

    // Speaker

    private setMuted(muted: boolean, callback: () => void) {
        this.log.debug(`Setting muted status to ${muted}%`);
        loudness.setMuted(muted).then(() => {
            this.log.debug(`Set muted status to ${muted}%`);
            callback();
        }).catch((error) => {
            this.log.error(`Failed to set muted status to ${muted}%: ${error}`);
        });
    }

    private getMuted(callback: (error: Error | null, muted: boolean | null) => void) {
        this.log.debug(`Getting muted status`);
        loudness.getMuted().then((muted) => {
            this.log.debug(`Got muted status: ${muted}%`);
            callback(null, muted);
        }).catch((error) => {
            this.log.debug(`Failed to get muted status: ${error}`);
            callback(error, null);
        });
    }

    private setVolume(logarithmic: boolean, homekitVolume: number, callback: () => void) {
        const volume = logarithmic ? Math.round(Math.log10(1 + homekitVolume) * 50) : homekitVolume;
        this.log.debug(`Being requested to set volume to ${homekitVolume}%`);
        if (logarithmic) {
            this.log.debug(`Converted requested volume to ${volume}%`);
        }
        loudness.setVolume(volume).then(() => {
            this.log.debug(`Set volume to ${volume}%`);
            callback();
        }).catch((error) => {
            this.log.error(`Failed to set volume to ${volume}%: ${error}`);
        });
    }

    private getVolume(logarithmic: boolean, callback: (error: Error | null, muted: number | null) => void) {
        this.log.debug(`Getting volume`);
        loudness.getVolume().then((homekitVolume) => {
            const volume = logarithmic ? Math.round(Math.pow(10, homekitVolume / 50) - 1) : homekitVolume;
            this.log.debug(`Got volume: ${homekitVolume}%`);
            if (logarithmic) {
                this.log.debug(`Converted volume to: ${volume}%`);
            }
            callback(null, volume);
        }).catch((error) => {
            this.log.debug(`Failed to get volume: ${error}`);
            callback(error, null);
        });
    }

    private setPowerState(powerState: boolean, callback: () => void) {
        const muted = !powerState;
        this.setMuted(muted, callback);
    }

    private getPowerState(callback: (error: Error | null, muted: boolean | null) => void) {
        this.getMuted((error, muted) => {
            if (error !== null) {
                callback(error, null);
            } else {
                callback(null, !muted);
            }
        });
    }
}
