function ServerError(error) {
  Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  this.data = error.response.data;
  this.headers = error.response.headers;
  this.status = error.response.status;
}

ServerError.prototype.toJSON = function () {
  return {
    data: this.data,
    headers: this.headers,
    status: this.status,
  };
}

function NoResponseError(error) {
  Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  this.request = error.request;
}

NoResponseError.prototype.toJSON = function () {
  return {
    request: this.request,
  };
}

function RequestError(error) {
  Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  this.message = error.message;
}

RequestError.prototype.toJSON = function () {
  return {
    message: this.message,
  };
}

require('util').inherits(ServerError, Error);
require('util').inherits(NoResponseError, Error);
require('util').inherits(RequestError, Error);

exports.ServerError = ServerError;
exports.NoResponseError = NoResponseError;
exports.RequestError = RequestError;
