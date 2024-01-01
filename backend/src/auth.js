const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const secrets = require('./data/secrets');

const {Pool} = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
});

exports.login = async (req, res) => {
  const {email, password} = req.body;
  let user = null;

  let select = 'SELECT * FROM person';
  select += ` WHERE email = $1`;
  const query = {
    text: select,
    values: [email],
  };
  const {rows} = await pool.query(query);

  if (rows.length == 1 && bcrypt.compareSync(password, rows[0].passhash)) {
    user = rows[0];
  }

  if (user) {
    const accessToken = jwt.sign(
      {email: user.email, name: user.title},
      secrets.accessToken, {
        expiresIn: '30m',
        algorithm: 'HS256',
      });
    res.status(200).json({
      email: user.email,
      name: user.title,
      accessToken: accessToken,
    });
  } else {
    res.status(401).send('Invalid credentials');
  }
};

exports.check = (req, res, next) => {
  const authHeader = req.headers.authorization;

  const token = authHeader.split(' ')[1];
  jwt.verify(token, secrets.accessToken, (err, user) => {
    if (err) {
      return res.sendStatus(403);
    }
    req.user = user;
    next();
  });
};

