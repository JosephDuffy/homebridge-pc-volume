# homebridge-pc-volume

![Build Status](https://travis-ci.com/JosephDuffy/homebridge-pc-volume.svg?branch=master)](https://travis-ci.com/JosephDuffy/homebridge-pc-volume)
[![Coverage Status](https://coveralls.io/repos/github/JosephDuffy/homebridge-pc-volume/badge.svg?branch=master)](https://coveralls.io/github/JosephDuffy/homebridge-pc-volume?branch=master)
[![npm version](https://img.shields.io/npm/v/homebridge-pc-volume.svg)](https://www.npmjs.com/package/homebridge-pc-volume)
[![David dependencies](https://img.shields.io/david/josephduffy/homebridge-pc-volume.svg)]()

homebridge-pc-volume is a Homebridge plugin that adds a support for changing a computer's volume using HomeKit and Siri.

<img src="https://raw.githubusercontent.com/JosephDuffy/homebridge-pc-volume/master/.github/demo.gif" height="256" width="256" />

## OS Support

homebridge-pc-volume utilises [node-loudness](https://github.com/LinusU/node-loudness), which currently supports macOS, Linux (using ALSA), and Windows. Windows may need OpenSSL to be installed; it is required when being run on CI, which installs the latest 64-bit not-light 1.0.2 build avialable from [https://slproweb.com/products/Win32OpenSSL.html](https://slproweb.com/products/Win32OpenSSL.html). I have not personally tested this project on Linux or Windows.

## Installation

First, [install Homebridge](https://github.com/nfarina/homebridge#installation).

Then install homebridge-pc-volume via `npm`:

`npm install -g homebridge-pc-volume`

homebridge-pc-volume will also need to be specified as an accessory in your `~/.homebridge/config.json`:

```
  "accessories": [
    {
      "accessory": "ComputerSpeakers",
      "name": "MacBook"
    }
  ]
```

Note that `accessory` _must_ be "ComputerSpeakers", while the `name` can be any value of your choosing.

## Configuration

When the property `logarithmic` is set to `true` the volume will be [scaled logarithmically](https://www.wolframalpha.com/input/?i=100*(log10(1%2Bx)%2F2)+from+x%3D0+to+100).

The `services` property can be used to decide how your computer's speaker will be exposed: as a lightbulb, fan, speaker, or a combination of all 3.

Please note that while iOS 11 supports "HomeKit speakers" this appears to actually be via AirPlay 2, so the "speaker" option is unlikely to work!

If no services key is provided a lightbulb will be exposed.

### Lightbulb Only (default, implicit)

```
  "accessories": [
    {
      "accessory": "ComputerSpeakers",
      "name": "MacBook"
    }
  ]
```

### Lightbulb Only (default prior to 1.1)

```
  "accessories": [
    {
      "accessory": "ComputerSpeakers",
      "name": "MacBook",
      "services": ["lightbulb"]
    }
  ]
```

### Fan Only

```
  "accessories": [
    {
      "accessory": "ComputerSpeakers",
      "name": "MacBook",
      "services": ["fan"]
    }
  ]
```

### Speaker and Fan

```
  "accessories": [
    {
      "accessory": "ComputerSpeakers",
      "name": "MacBook",
      "services": ["speaker", "fan"]
    }
  ]
```

## Development

To develop homebridge-pc-volume locally:

1. Clone the project
2. Run `yarn install`
3. Run `npm install -g ./`

This will allow homebridge to find your local version of homebridge-pc-volume.

After making changes you will need to restart homebridge. You may also stop any homebridge instance you already have running and run `yarn run build:watch`, which will start homebridge, and automatically restart it when a source file is updated.
