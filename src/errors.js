function ServerError(error) {
  Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  const { status, statusText } = error.response;
  this.message = `Server responded with status ${status} ${statusText}`;
  this.data = error.response.data;
  this.headers = error.response.headers;
  this.status = error.response.status;
}

ServerError.prototype.toJSON = function toJSON() {
  return {
    data: this.data,
    headers: this.headers,
    status: this.status,
  };
};

function NoResponseError(error) {
  Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  this.message = 'No response from server.';
  this.request = error.request;
}

NoResponseError.prototype.toJSON = function toJSON() {
  return {
    request: this.request,
  };
};

function RequestError(error) {
  Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  this.message = 'Error building request object.';
  this.message = error.message;
}

RequestError.prototype.toJSON = function toJSON() {
  return {
    message: this.message,
  };
};

require('util').inherits(ServerError, Error);
require('util').inherits(NoResponseError, Error);
require('util').inherits(RequestError, Error);

exports.ServerError = ServerError;
exports.NoResponseError = NoResponseError;
exports.RequestError = RequestError;
