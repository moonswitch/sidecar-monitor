'use strict';

const parseHeader = (inputs) => {
    const ret = {};

    for (const line of inputs) {
        if (ret.total && ret.tcp) {
            break;
        }

        const lower = line.toLowerCase();

        // Total: 5
        if (lower.startsWith('total:')) {
            ret.total = parseInt(line.split(' ')[1], 10);
            continue;
        }

        // TCP:   286 (estab 1, closed 284, orphaned 0, timewait 0)
        if (lower.startsWith('tcp:')) {
            ret.tcp = {}

            // remove extra chars
            // replace duplicate whitespace with single space
            // cleanLower = tcp 288 estab 2 closed 285 orphaned 0 timewait 0
            let cleanLower = lower.replace(/\(|\)|,|:/g, '');
            cleanLower = cleanLower.replace(/\s\s+/g, ' ');

            const split = cleanLower.split(' ');
            ret.tcp.total = parseInt(split[1]);

            // since we already took care of the first number 
            // above, we can skip it: let ii = 2
            for (let ii = 2; ii < split.length - 2; ii += 2) {
                ret.tcp[split[ii]] = parseInt(split[ii+1]);
            }

            continue;
        }
    }

    return ret;
}

/**
Transport Total     IP        IPv6
RAW	  2         1         1
UDP	  0         0         0
TCP	  2         0         2
INET	  4         1         3
FRAG	  0         0         0
 */
const parseStats = (inputs) => {
    const ret = {};

    let headers = [];
    let tableStartIdx = -1;
    ret.rows = [];

    // Create header array
    for (const idx in inputs) {
        const line = inputs[idx];
        
        if (line.startsWith('Transport')) {
            const cleanLine = line.replace(/\s\s+/g, ' ');
            headers = cleanLine.split(' ').map(item => item.toLowerCase());
            tableStartIdx = parseInt(idx);
            break;
        }
    }

    if (tableStartIdx === -1) {
        return null;
    }

    // Parse contents of table
    for (const line of inputs.slice(tableStartIdx + 1)) {
        if (!line.trim()) {
            break;
        }

        const row = {};
        const cleanLine = line.replace(/\s\s+/g, ' ');
        const splitLine = cleanLine.split(' ');

        // Creates objects which look like:
        // { transport: 'RAW', total: 2, ip: 1, ipv6: 1 }
        // { transport: 'UDP', total: 0, ip: 0, ipv6: 0 }
        splitLine.forEach((ele, idx) => row[headers[idx]] = ele);

        ret.rows.push(row);
    }

    return ret;
}

const parseConnections = (inputs) => {
    let headers = [];
    let tableStartIdx = 0;
    const connections = [];

    // Create header array
    for (const idx in inputs) {
        const line = inputs[idx];
        
        if (line.startsWith('Netid')) {
            const cleanLine = line.replace(/\s\s+/g, ' ');
            headers = cleanLine.split(' ').map(item => item.toLowerCase().replace(/-|:/g, '_'));
            tableStartIdx = parseInt(idx);
            break;
        }
    }

    // Parse contents of table
    for (const line of inputs.slice(tableStartIdx + 1)) {
        if (!line.trim()) {
            break;
        }

        const row = {};
        const cleanLine = line.replace(/\s\s+/g, ' ');
        const splitLine = cleanLine.split(' ');

        splitLine.forEach((ele, idx) => row[headers[idx]] = ele);

        connections.push(row);
    }

    return connections;
};

/**
ss -o state established
Netid              Recv-Q              Send-Q                                 Local Address:Port                                    Peer Address:Port
tcp                0                   0                                [::ffff:10.1.0.116]:8080                           [::ffff:192.168.65.6]:58956
 */
const parse = (input) => {
    const ret = {};
    const inputs = input.split('\n');

    console.log('Command Input', input);
    
    /**
     * Header and Stats parsing are probably not needed. They're obtained via:
     *  
     * `ss -sat`
     * 
     * This command returns data about all TCP connections. Currently we just
     * need active socket connection count which is done with:
     * 
     *  `ss -o state established`
     */
    // ret.header = parseHeader(inputs);
    // ret.stats = parseStats(inputs);
    ret.connections = parseConnections(inputs);

    return ret;
};

module.exports = parse;
