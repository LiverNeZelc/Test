const os = require('os');

function getIPv4Address() {
    const networkInterfaces = os.networkInterfaces();

    for (const interfaceName in networkInterfaces) {
        for (const iface of networkInterfaces[interfaceName]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return null; 
}

module.exports = getIPv4Address;