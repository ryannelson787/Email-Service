const express = require('express');
const cors = require('cors');
const yaml = require('js-yaml');
const swaggerUi = require('swagger-ui-express');
const fs = require('fs');
const path = require('path');
const OpenApiValidator = require('express-openapi-validator');

const auth = require('./auth');
const dummy = require('./dummy');
const email = require('./email');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: false}));

const apiSpec = path.join(__dirname, '../api/openapi.yaml');

const apidoc = yaml.load(fs.readFileSync(apiSpec, 'utf8'));
app.use('/v0/api-docs', swaggerUi.serve, swaggerUi.setup(apidoc));

app.use(
  OpenApiValidator.middleware({
    apiSpec: apiSpec,
    validateRequests: true,
    validateResponses: true,
  }),
);

app.get('/v0/dummy', dummy.get);
// Your routes go here
app.post('/v0/login', auth.login);
app.get('/v0/mail', auth.check, email.getMailbox);
app.get('/v0/boxnames', auth.check, email.getBoxNames);
app.get('/v0/mail/:id', auth.check, email.getOneMail);
app.post('/v0/mail', auth.check, email.postMail);
app.put('/v0/starred/:id', auth.check, email.putStarred);
app.put('/v0/opened/:id', auth.check, email.putOpened);
app.post('/v0/boxnames', auth.check, email.createMailbox);
app.put('/v0/mailbox/:id', auth.check, email.putMailbox);
app.get('/v0/search', auth.check, email.searchMail);

app.use((err, req, res, next) => {
  res.status(err.status).json({
    message: err.message,
    errors: err.errors,
    status: err.status,
  });
});

module.exports = app;
