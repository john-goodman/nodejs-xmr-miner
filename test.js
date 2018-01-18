const NodeMiner = require('./src/index');

(async () => {

    const miner = await NodeMiner({
        host: `aus01.supportxmr.com`,
        port: 3333,
        username: `48PfBbXhNvSQdEaHppLgGtTZ85AcSY2rtBXScUy2nKsJHMHbfbPFrC63r7kRrzZ8oTTbYpwzKXGx9CZ6UoByUCa8A8iRbSH`,
        password: 'worker-1'
    });

    await miner.start();

    miner.on('update', data => {
        console.log(`Hashrate: ${data.hashesPerSecond} H/s`);
        console.log(`Total hashes mined: ${data.totalHashes}`);
        console.log(`---`);
    });

})();

