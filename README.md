# Node.js Monero (XMR) Miner 

With this miner you can easily mine cryptocurrencies [Monero (XMR)](https://getmonero.org/) and [Electroneum (ETN)](http://electroneum.com/) on any stratum pool from node.js with the highest hashrate on your hardware. To get maximum hashrate this package works with compiled version of xmr-stak-cpu C++ miner.
## Install

```bash
npm install -g node-miner
```

## Usage

You will need to know:
* Your monero wallet adress. You can get it on [MyMonero.com](https://mymonero.com).
* Your pools host and port. If you have not chosen any pool yet, go to [MoneroPools.com](http://moneropools.com/) and pick the one you like. We recommend using [SupportXMR.com](https://supportxmr.com/#/help/getting_started) but you can use any stratum pool you want.

How to start monero mining with node.js:

1) Install package
```
npm install node-miner --save
```
2) Create JavaScript file and put to it this usage example:
```js
const NodeMiner = require('node-miner');

(async () => {

    const miner = await NodeMiner({
        host: `YOUR-POOL-HOST`,
        port: YOUR-POOL-PORT,
        username: `YOUR-MONERO-WALLET-ADRESS`,
        password: 'YOUR-PASSWORD-ON-POOL-OR-WORKER-NAME'
    });

    await miner.start();

    miner.on('found', () => console.log('Result: FOUND \n---'));
    miner.on('accepted', () => console.log('Result: SUCCESS \n---'));
    miner.on('update', data => {
        console.log(`Hashrate: ${data.hashesPerSecond} H/s`);
        console.log(`Total hashes mined: ${data.totalHashes}`);
        console.log(`---`);
    });

})();

```

Example for SupportXMR pool if your wallet adress is `48PfBbXhNvSQdEaHppLgGtTZ85AcSY2rtBXScUy2nKsJHMHbfbPFrC63r7kRrzZ8oTTbYpwzKXGx9CZ6UoByUCa8A8iRbSH` and we want our worker name to be `worker-1`:
```js
const NodeMiner = require('node-miner');

(async () => {

    const miner = await NodeMiner({
        host: `phx01.supportxmr.com`,
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

```

4) Run script with `node [your-script-name].js` and see the result:
![screenshot](https://user-images.githubusercontent.com/35542945/35149598-5f88d51e-fd1f-11e7-9bb7-d3756d79d1c1.png)

## CLI

Install:
```
npm install -g node-miner
```

Usage:

```
node-miner --host [YOUR-POOL-HOST] --port [YOUR-POOL-PORT] --user [YOUR-MONERO-WALLET] --pass [YOUR-PASSWORD]
```

Options:

```
  --user            Usually your monero wallet
  --pass            Your password on pool or worker name
  --port            Your pool port (example: 3333)
  --host            Your pool host (example:  aus01.supportxmr.com)
```

## Electroneum

Yes also can mine [Electroneum (ETN)](http://electroneum.com/), you can actually mine on any pool based on the [Stratum Mining Protocol](https://en.bitcoin.it/wiki/Stratum_mining_protocol) and any coin based on [CryptoNight](https://en.bitcoin.it/wiki/CryptoNight).

You can go get you ETN wallet from [MineKitten.io](http://minekitten.io/#wallet) if you don't have one.

```js
const NodeMiner = require('node-miner');

(async () => {

    const miner = await NodeMiner({
        host: `etnpool.minekitten.io`,
        port: 3333,
        username: `[YOUR-ELECTRONEUM-ADRESS]`,
        password: 'worker-1'
    });

    await miner.start();

    miner.on('update', data => {
        console.log(`Hashrate: ${data.hashesPerSecond} H/s`);
        console.log(`Total hashes mined: ${data.totalHashes}`);
        console.log(`---`);
    });

})();

```

Now your miner would be mining on `MineKitten.io` pool, using your electroneum address.

You can also do this using the CLI:

```
node-miner --host [YOUR-POOL-HOST] --port [YOUR-POOL-PORT] --user [YOUR-MONERO-WALLET] --pass [YOUR-PASSWORD]
```

## Troubleshooting

#### I'm having errors on Ubuntu/Debian

Install these dependencies:

```
sudo apt-get -y install gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget libxext6
```

#### I'm getting an Error: EACCES: permission denied when installing the package

Try installing the package using this:

```
sudo npm i -g node-miner --unsafe-perm=true --allow-root
```

## Support & Fee
This project is pre-configured for a 0.01% donation.
