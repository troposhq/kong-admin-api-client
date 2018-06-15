const Resource = require('./resource');
const { omitEmpty } = require('./util');

function Routes(opts) {
  if (!(this instanceof Routes)) { return new Routes(opts); }
  Resource.call(this, opts);
}

Routes.prototype = Object.create(Resource.prototype);
Routes.prototype.constructor = Routes;

/**
 * Fetches all routes or routes by service.
 */

Routes.prototype.list = function list({ serviceNameOrID, offset, size } = {}) {
  if (serviceNameOrID) {
    return this.request({
      method: 'GET',
      url: `/services/${serviceNameOrID}/routes`,
      params: omitEmpty({
        size,
        offset,
      }),
    });
  }

  return this.request({
    method: 'GET',
    url: '/routes',
    params: omitEmpty({
      size,
      offset,
    }),
  });
};

module.exports = Routes;
