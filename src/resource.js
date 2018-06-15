const axios = require('axios');
const { omitEmpty } = require('./util');
const errors = require('./errors');

function Resource(opts = {}) {
  if (!(this instanceof Resource)) { return new Resource(opts); }

  const { adminAPIURL, resourceURL } = opts;
  this.adminAPIURL = adminAPIURL;
  this.resourceURL = resourceURL;
}

Resource.prototype.request = function request(c) {
  const config = { ...c, baseURL: this.adminAPIURL };
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

Resource.prototype.create = function create(body) {
  return this.request({
    method: 'POST',
    url: this.resourceURL,
    headers: {
      'Content-Type': 'application/json',
    },
    data: omitEmpty(body),
  });
};

Resource.prototype.get = function get(id) {
  return this.request({
    method: 'GET',
    url: `${this.resourceURL}/${id}`,
  });
};

Resource.prototype.list = function list({ offset, size } = {}) {
  return this.request({
    method: 'GET',
    url: this.resourceURL,
    params: omitEmpty({
      size,
      offset,
    }),
  });
};

Resource.prototype.update = function update(id, body) {
  return this.request({
    method: 'PATCH',
    url: `${this.resourceURL}/${id}`,
    data: omitEmpty(body),
  });
};

Resource.prototype.del = function del(id) {
  return this.request({
    method: 'DELETE',
    url: `${this.resourceURL}/${id}`,
  });
};

Resource.prototype.delete = Resource.prototype.del;

module.exports = Resource;
