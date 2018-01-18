const Proxy = require("./build");
const proxy = new Proxy({

});
proxy.listen(process.env.PORT || 8892);

setInterval(function() {
  console.log(`Going to reload proxy`);
  process.exit(0);
}, 14400 * 1000);
