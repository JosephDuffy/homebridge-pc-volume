#!/usr/bin/expect -f

# 10 minutes
set timeout 600
spawn docker run homebridge-pc-volume-e2e
expect {
    "ERROR LOADING PLUGIN" {exit 1}
    -re {Homebridge is running}
}
