module.exports = {
  login: function (userContext, events, done) {
    const axios = require('axios');
    axios
  .post(`${process.env.TARGET || 'http://127.0.0.1:4003'}/api/auth/login`, {
        emailOrCnpj: process.env.LOAD_USER || 'despachante@test.local',
        password: process.env.LOAD_PASS || 'SenhaForte123!'
      })
      .then((res) => {
        userContext.vars.token = res.data.accessToken;
        userContext.vars.motoristaId = process.env.MOTORISTA_ID || '';
        return done();
      })
      .catch((err) => {
        userContext.vars.token = '';
        return done();
      });
  }
};
