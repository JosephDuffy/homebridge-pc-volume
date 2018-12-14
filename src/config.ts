export interface Config {
    name: string;
    services?: Config.Service[];
    logarithmic: boolean;
}

export namespace Config {
    export enum Service {
        Lightbulb = "lightbuld",
        Speaker = "speaker",
        Fan = "fan",
    }
}

export default Config;