const axios = require('axios');

class Client {
  constructor(opts) {
    this.adminAPIHost = opts.adminAPIHost || 'http://localhost';
    this.adminAPIPort = opts.adminAPIPort || '8001';
    this.kongAdminAPIURL = `${this.adminAPIHost}:${this.adminAPIPort}`
  }

  createConsumer(customId, username) {
    const consumerResult = await axios({
      method: 'POST',
      url: `${this.kongAdminAPIURL}/consumers`,
      data: {
        custom_id: customId,
        username,
      },
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return consumerResult;
  }
}

module.exports = Client;
