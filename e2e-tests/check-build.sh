#!/usr/bin/expect -f

# 10 minutes
set timeout 600
spawn docker run homebridge-pc-volume-e2e
expect {
    "ERROR LOADING PLUGIN" {exit 1}
    # Version 1.2.3 used to output "Homebridge v1.2.3 is running", but now appears to output "Homebridge is running" so both are accepted. This would also match version like `v1.2.` but 🤷‍♂️
    -re {Homebridge( v[0-9]+[0-9.]*)? is running}
}
