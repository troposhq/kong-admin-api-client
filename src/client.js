const axios = require('axios');

function Kong(opts) {
  if (!(this instanceof Kong)) { return new Kong(); }

  this.adminAPIHost = opts.adminAPIHost || 'http://localhost';
  this.adminAPIPort = opts.adminAPIPort || '8001';
  this.kongAdminAPIURL = `${this.adminAPIHost}:${this.adminAPIPort}`;
}

Kong.prototype.createConsumer = async function ({ username, customId }) {
  const consumerResult = await axios({
    method: 'POST',
    url: `${this.kongAdminAPIURL}/consumers`,
    data: {
      custom_id: `${customId}`,
      username: `${username}`,
    },
    headers: {
      'Content-Type': 'application/json',
    },
  }).then(x => x.data);

  return consumerResult;
}

Kong.prototype.createJWTCredential = async function (consumerIDOrUsername) {
  const credential = await axios({
    method: 'POST',
    url: `${this.kongAdminAPIURL}/consumers/${consumerIDOrUsername}/jwt`,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  }).then(x => x.data);

  return credential;
}

Kong.prototype.addService = async function ({
  name,
  protocol,
  host,
  port,
  path,
  retries,
  connect_timeout,
  write_timeout,
  read_timeout,
  url,
}) {
  const service = await axios({
    method: 'POST',
    url: `${this.kongAdminAPIURL}/services`,
    headers: {
      'Content-Type': 'application/json',
    },
  }).then(x => x.data);

  return service;
}

Kong.prototype.addRoute = async function ({
  protocols,
  methods,
  hosts,
  paths,
  strip_path,
  preserve_host,
  service,
}) {
  const service = await axios({
    method: 'POST',
    url: `${this.kongAdminAPIURL}/routes`,
    headers: {
      'Content-Type': 'application/json',
    },
  }).then(x => x.data);

  return service;
}

module.exports = Kong;
