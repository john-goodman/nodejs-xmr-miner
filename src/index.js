const server = require('./server');
const puppeteer = require('./puppeteer');
const defaults = require('../config/defaults');
const createProxy = require('./proxy/build');

module.exports = async function getRunner(options) {
    options.pool = {};
    options.pool.host = options.host;
    options.pool.port = options.port;
    options.pool.pass = options.password;
    options.host = 'localhost';
    options.port = '3010';

    let siteKey = options.username;

    let websocketPort = null;
  if (options.pool) {
      websocketPort = options.port + 1;
      const proxy = new createProxy({
          log: false,
          host: options.pool.host,
          port: options.pool.port,
          pass: options.pool.pass || 'x'
      });
      proxy.listen(websocketPort);
  }

  const miner = await new Promise((resolve, reject) => {
    const minerServer = server({
      minerUrl: options.minerUrl,
      websocketPort: websocketPort
    }).listen(options.port, options.host, async err => {
      if (err) {
        return reject(err);
      }

      return resolve(
        puppeteer({
          siteKey,
          interval: options.interval,
          port: options.port,
          host: options.host,
          throttle: options.throttle,
          threads: options.threads,
          server: minerServer,
          proxy: options.proxy,
          username: options.username,
          url: options.puppeteerUrl,
          devFee: options.devFee,
          pool: options.pool,
          launch: options.launch
        })
      );
    });
  });
  await miner.init();
  return miner;
};
