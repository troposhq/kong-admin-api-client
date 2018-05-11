const axios = require('axios');

function Kong(opts) {
  if (!(this instanceof Kong)) { return new Kong(); }

  this.adminAPIURL = opts.adminAPIURL || 'http://localhost:8001';
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
  const route = await axios({
    method: 'POST',
    url: `${this.kongAdminAPIURL}/routes`,
    headers: {
      'Content-Type': 'application/json',
    },
  }).then(x => x.data);

  return route;
}

module.exports = Kong;
