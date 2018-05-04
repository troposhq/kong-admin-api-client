const axios = require('axios');

class Client {
  constructor(opts) {
    this.adminAPIHost = opts.adminAPIHost || 'http://localhost';
    this.adminAPIPort = opts.adminAPIPort || '8001';
    this.kongAdminAPIURL = `${this.adminAPIHost}:${this.adminAPIPort}`
  }

  async createConsumer(username, customId) {
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

  async createJWTCredential(consumerIDOrUsername) {
    const credential = await axios({
      method: 'POST',
      url: `${this.kongAdminAPIURL}/consumers/${consumerIDOrUsername}/jwt`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }).then(x => x.data);

    return credential;
  }
}

module.exports = Client;
