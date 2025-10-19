const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const TARGET = process.env.TARGET || 'http://127.0.0.1:4004';
const DESP_EMAIL = process.env.LOAD_USER || 'despachante@test.local';
const ADMIN_EMAIL = process.env.ADMIN_USER || 'theostracke11@gmail.com';
const PASSWORD = process.env.LOAD_PASS || 'SenhaForte123!';

async function login(email, password) {
  try {
    const { data } = await axios.post(`${TARGET}/api/auth/login`, {
      emailOrCnpj: email,
      password,
    }, { timeout: 10000 });
    return data?.accessToken || '';
  } catch (e) {
    return '';
  }
}

async function getFirstMotoristaId(token) {
  try {
    const { data } = await axios.get(`${TARGET}/api/motoristas`, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 10000,
    });
    const list = data?.motoristas || [];
    if (list.length > 0) return list[0].id;
    return '';
  } catch (e) {
    return '';
  }
}

function randomString(n = 8) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let s = '';
  for (let i = 0; i < n; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

module.exports = {
  // Loga como despachante e captura motoristaId
  prepDesp: async function (context, events, next) {
    const token = await login(DESP_EMAIL, PASSWORD);
    context.vars.despToken = token;
    context.vars.token = token; // default
    context.vars.motoristaId = process.env.MOTORISTA_ID || await getFirstMotoristaId(token);
    return next();
  },

  // Loga como admin
  prepAdmin: async function (context, events, next) {
    const token = await login(ADMIN_EMAIL, PASSWORD);
    context.vars.adminToken = token;
    return next();
  },

  // Define um token inválido aleatório
  invalidToken: function (context, events, next) {
    context.vars.badToken = `bad.${randomString(16)}.${randomString(24)}`;
    return next();
  },

  // Envia upload válido como despachante
  uploadValido: async function (context, events, next) {
    try {
      const form = new FormData();
      form.append('motoristaId', context.vars.motoristaId || '');
      form.append('tipo', 'CNH');
      form.append('file', fs.createReadStream(require('path').join(__dirname, 'fixtures', 'sample.pdf')));

      await axios.post(`${TARGET}/api/documentos/upload`, form, {
        headers: { Authorization: `Bearer ${context.vars.despToken || context.vars.token}` , ...form.getHeaders() },
        maxBodyLength: 15 * 1024 * 1024,
        timeout: 15000,
      }).catch(() => {});
    } catch (_) {}
    return next();
  },

  // Envia upload inválido (tipo não permitido)
  uploadInvalido: async function (context, events, next) {
    try {
      const form = new FormData();
      form.append('motoristaId', context.vars.motoristaId || '');
      form.append('tipo', 'CNH');
      form.append('file', fs.createReadStream(require('path').join(__dirname, 'fixtures', 'evil.txt')));

      await axios.post(`${TARGET}/api/documentos/upload`, form, {
        headers: { Authorization: `Bearer ${context.vars.despToken || context.vars.token}`, ...form.getHeaders() },
        timeout: 10000,
      }).catch(() => {});
    } catch (_) {}
    return next();
  },

  // Pequeno fuzz de login para simular falhas/ataques
  fuzzLogin: async function (context, events, next) {
    const candidates = [
      { emailOrCnpj: DESP_EMAIL, password: 'senha_errada' },
      { emailOrCnpj: "' OR '1'='1", password: 'x' },
      { emailOrCnpj: '<script>alert(1)</script>@mail.com', password: 'x' },
      { emailOrCnpj: '00000000000191', password: 'x' },
    ];
    const body = candidates[Math.floor(Math.random() * candidates.length)];
    await axios.post(`${TARGET}/api/auth/login`, body).catch(() => {});
    return next();
  },
};
