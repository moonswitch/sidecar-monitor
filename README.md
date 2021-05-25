# Sidecar Monitor

> This is in early stages of development so there are limited features and creature comforts. Enter at your own risk!

Easily monitor Kubernetes pod network traffic with this utility sidecar.

## What does it do?

The `sidecar-monitor` image executes `ss -t -o state established` every second to get active TCP socket connections, parses the output to populate a [Prometheus Gauge](https://github.com/siimon/prom-client#gauge), and serves the Prometheus exposition format output over Node's `http` module.

## Getting Started

1. Add the following manifest to the Kubernetes Deployment you'd like to monitor:
```
    - image: moonswitch/sidecar-monitor:latest
      name: sidecar-monitor
      ports:
        - containerPort: 8089
          name: sidecar-monitor
      env:
        - name: SIDECAR_MONITOR_PORT
          value: "8089"
```
1. Point Prometheus to scrape your newly deployed container.

## Getting Started - Locally

1. `npm install`
1. `make build` - Builds the docker image on your machine
1. Add the following manifest to the Kubernetes Deployment you'd like to monitor:
```
    - image: moonswitch/sidecar-monitor:latest
      imagePullPolicy: Never
      name: sidecar-monitor
      ports:
        - containerPort: 8089
          name: sidecar-monitor
      env:
        - name: SIDECAR_MONITOR_PORT
          value: "8089"
```

## Future

1. Add parsers for multiple utility commands
1. Add the ability to combine the output from several commands
1. Select output format: prometheus, json, stdout, http endpoint
