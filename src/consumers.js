const querystring = require('querystring');
const Resource = require('./resource');

function Consumers(opts) {
  if (!(this instanceof Consumers)) { return new Consumers(opts); }
  Resource.call(this, opts);
}

Consumers.prototype = Object.create(Resource.prototype);
Consumers.prototype.constructor = Consumers;

Consumers.prototype.createCredential = function createCredential(
  consumerIDOrUsername,
  type = 'jwt',
  body = {},
) {
  return this.request({
    method: 'POST',
    url: `${this.resourceURL}/${consumerIDOrUsername}/${type}`,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    data: querystring.stringify(body),
  });
};

module.exports = Consumers;
