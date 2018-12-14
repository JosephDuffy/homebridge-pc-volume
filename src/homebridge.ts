import 'hap-nodejs';

export interface Homebridge {
    hap: HAPNodeJS.HAPNodeJS;
    log: Homebridge.Log;
    registerAccessory(pluginName: string, accessoryName: string, constructor: Function)
}

export namespace Homebridge {
    export interface Log {
        debug: (...message: string[]) => void
        info: (...message: string[]) => void
        warn: (...message: string[]) => void
        error: (...message: string[]) => void
    }
}

export default Homebridge;