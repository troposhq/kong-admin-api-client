const axios = require('axios');
const errors = require('./errors');

function Kong(opts) {
  if (!(this instanceof Kong)) { return new Kong(); }

  this.adminAPIURL = opts.adminAPIURL || 'http://localhost:8001';
}

/**
 * 
 * @returns {Promise}
 */

Kong.prototype.request = function (config) {
  return axios(config)
    .then(x => x.data)
    .catch((error) => {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        throw new errors.ServerError(error);
      } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        throw new errors.NoResponseError(error);
      } else {
        // Something happened in setting up the request that triggered an Error
        throw new errors.RequestError(error);
      }
    });
};

Kong.prototype.createConsumer = function ({ username, customId }) {
  return this.request({
    method: 'POST',
    url: `${this.adminAPIURL}/consumers`,
    data: {
      custom_id: `${customId}`,
      username: `${username}`,
    },
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

Kong.prototype.createJWTCredential = function (consumerIDOrUsername) {
  return this.request({
    method: 'POST',
    url: `${this.adminAPIURL}/consumers/${consumerIDOrUsername}/jwt`,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
}

Kong.prototype.addService = function ({
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
  return this.request({
    method: 'POST',
    url: `${this.adminAPIURL}/services`,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

Kong.prototype.addRoute = function ({
  protocols,
  methods,
  hosts,
  paths,
  strip_path,
  preserve_host,
  service,
}) {
  return this.request({
    method: 'POST',
    url: `${this.adminAPIURL}/routes`,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

module.exports = Kong;
