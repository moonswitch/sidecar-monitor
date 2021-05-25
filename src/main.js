'use strict';
const client = require('prom-client');
const http = require('http');
const { exec } = require('child_process');
const { ss } = require('./parsers');

const host = process.env.SIDECAR_MONITOR_HOST || '';
const port = process.env.SIDECAR_MONITOR_PORT || 8089;
let timer, output;

// Prometheus
const registry = new client.Registry();

const activeConnectionsGauge = new client.Gauge({
    name: 'active_ws_connections', 
    help: 'Active web socket connections',
    async collect() {
        this.set(output.connections.length);
    }
});

registry.registerMetric(activeConnectionsGauge);

const repeater = () => {
    exec('ss -t -o state established', {timeout: 50, maxBuffer: 4096}, (err, stdout, stderr) => {
        output = ss(stdout.toString('utf-8'));

        console.log('OUTPUT', output);

        if (stderr) {
            console.log('ERROR', stderr);
        }

        if (err) {
            console.log('ERROR', err);
        }
    });

    timer = setTimeout(repeater, 1000);
};

const requestListener = async (req, res) => {
    res.writeHead(200);
    res.end(await registry.metrics());
};

const server = http.createServer(requestListener);

repeater();
server.listen(parseInt(port), host, () => {
    console.log(`Server is running on http://${host}:${port}`);
});
