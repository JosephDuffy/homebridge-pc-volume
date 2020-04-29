#!/usr/bin/expect -f

set timeout -1
spawn docker run homebridge-pc-volume-e2e
expect {
    "ERROR LOADING PLUGIN" {exit 1}
    "Homebridge is running"
}
