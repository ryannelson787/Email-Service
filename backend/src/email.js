const {Pool} = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
});

exports.getMailbox = async (req, res) => {
  const boxName = req.query.mailbox;

  let select = 'SELECT * FROM mail';
  select += ` WHERE (details->'from'->>'email' = $1`;
  select += ` AND from_mailbox = $2)`;
  select += ` OR (details->'to'->>'email' = $1`;
  select += ` AND to_mailbox = $2);`;

  let values = [req.user.email, boxName];

  if (boxName == 'Starred') {
    select = 'SELECT * FROM mail';
    select += ` WHERE (details->'to'->>'email' = $1`;
    select += ` AND to_starred)`;
    select += ` OR (details->'from'->>'email' = $2`;
    select += ` AND from_starred);`;
    values = [req.user.email, req.user.email];
  }

  const query = {
    text: select,
    values: values,
  };

  const {rows} = await pool.query(query);

  const retArr = [];
  for (let i = 0; i < rows.length; i++) {
    const newEmail = rows[i].details;
    newEmail['id'] = rows[i].id;

    if (newEmail.to.email == req.user.email) {
      newEmail['starred'] = rows[i].to_starred;
      newEmail['opened'] = rows[i].to_opened;
    } else {
      newEmail['starred'] = rows[i].from_starred;
      newEmail['opened'] = rows[i].from_opened;
    }
    delete newEmail.content;
    retArr.push(newEmail);
  }

  retArr.sort((a, b) => (a.received < b.received) ? 1 : -1);

  res.status(200).json(retArr);
};

exports.getBoxNames = async (req, res) => {
  let select = 'SELECT title FROM mailboxes';
  select += ` WHERE email_owner = $1;`;
  const query = {
    text: select,
    values: [req.user.email],
  };
  const {rows} = await pool.query(query);

  const retArr = [];
  for (let i = 0; i < rows.length; i++) {
    const newEmail = rows[i].title;
    retArr.push(newEmail);
  }

  res.status(200).json(retArr);
};

exports.getOneMail = async (req, res) => {
  let select = 'SELECT * FROM mail';
  select += ` WHERE id = $1;`;
  const query = {
    text: select,
    values: [req.params.id],
  };

  const {rows} = await pool.query(query);

  if (rows.length == 0) {
    res.status(404).send();
    return;
  }

  const newEmail = rows[0].details;

  if (newEmail.to.email == req.user.email) {
    newEmail.mailbox = rows[0].to_mailbox;
  } else {
    newEmail.mailbox = rows[0].from_mailbox;
  }

  newEmail.id = rows[0].id;

  if (newEmail.to.email == req.user.email) {
    newEmail['starred'] = rows[0].to_starred;
    newEmail['opened'] = rows[0].to_opened;
  } else {
    newEmail['starred'] = rows[0].from_starred;
    newEmail['opened'] = rows[0].from_opened;
  }

  res.status(200).json(newEmail);
};

exports.postMail = async (req, res) => {
  const body = req.body;

  let select = 'SELECT * FROM person';
  select += ` WHERE email = $1;`;
  const query = {
    text: select,
    values: [body.to_email],
  };
  const {rows} = await pool.query(query);

  const to = {
    email: body.to_email,
  };
  const from = {
    email: req.user.email,
    name: req.user.name,
  };

  if (rows.length == 1) {
    to.name = rows[0].title;
  } else {
    to.name = 'Unknown';
  }

  const details = {
    to: to,
    from: from,
    received: new Date().toISOString(),
    subject: body.subject,
    content: body.content,
  };

  let insert = `INSERT INTO mail(details) VALUES ('`;
  insert += JSON.stringify(details) + `') RETURNING id;`;
  const query2 = {
    text: insert,
    values: [],
  };
  const rows2 = await insertToTable(query2);

  details.id = rows2[0].id;
  details.starred = false;
  details.opened = false;
  delete details.content;

  res.status(201).json(details);
};

const insertToTable = async (query2) => {
  const {rows} = await pool.query(query2);
  return rows;
};

exports.putStarred = async (req, res) => {
  let select = 'SELECT details, to_starred, from_starred FROM mail';
  select += ' WHERE id = $1;';

  const query = {
    text: select,
    values: [req.params.id],
  };
  const {rows} = await pool.query(query);

  const details = rows[0].details;

  let update;
  if (details.to.email == req.user.email) {
    update = 'UPDATE mail SET to_starred = NOT to_starred';
  } else {
    update = 'UPDATE mail SET from_starred = NOT from_starred';
  }
  update += ' WHERE id = $1;';
  const query2 = {
    text: update,
    values: [req.params.id],
  };
  await pool.query(query2);
  res.status(204).send();
};

exports.putOpened = async (req, res) => {
  let select = 'SELECT details, to_opened, from_opened FROM mail';
  select += ' WHERE id = $1;';

  const query = {
    text: select,
    values: [req.params.id],
  };
  const {rows} = await pool.query(query);

  const details = rows[0].details;

  let update;
  if (details.to.email == req.user.email) {
    update = 'UPDATE mail SET to_opened = NOT to_opened';
  } else {
    update = 'UPDATE mail SET from_opened = NOT from_opened';
  }
  update += ' WHERE id = $1;';
  const query2 = {
    text: update,
    values: [req.params.id],
  };
  await pool.query(query2);
  res.status(204).send();
};

exports.createMailbox = async (req, res) => {
  const newName = req.body.name;

  let insert = `INSERT INTO mailboxes(title, email_owner)`;
  insert += ` VALUES ($1, $2);`;
  const query = {
    text: insert,
    values: [newName, req.user.email],
  };
  await pool.query(query);
  res.status(201).json(req.body);
};

exports.putMailbox = async (req, res) => {
  let select = 'SELECT details, to_opened, from_opened FROM mail';
  select += ' WHERE id = $1;';

  const query = {
    text: select,
    values: [req.params.id],
  };
  const {rows} = await pool.query(query);

  const details = rows[0].details;

  let update;
  if (details.to.email == req.user.email) {
    update = 'UPDATE mail SET to_mailbox = $1';
  } else {
    update = 'UPDATE mail SET from_mailbox = $1';
  }
  update += ' WHERE id = $2;';
  const query2 = {
    text: update,
    values: [req.query.mailbox, req.params.id],
  };
  await pool.query(query2);
  res.status(204).send();
};

exports.searchMail = async (req, res) => {
  const searchText = req.query.search;

  let select = 'SELECT * FROM mail';
  select += ` WHERE (details->'from'->>'email' = $1`;
  select += ` AND (details->'to'->>'email' LIKE '%' || $2 || '%'`;
  select += ` OR details->'to'->>'name' LIKE '%' || $2 || '%'`;
  select += ` OR details->>'subject' LIKE '%' || $2 || '%'`;
  select += ` OR details->>'content' LIKE '%' || $2 || '%'))`;
  select += ` OR (details->'to'->>'email' = $1`;
  select += ` AND (details->'from'->>'email' LIKE '%' || $2 || '%'`;
  select += ` OR details->'from'->>'name' LIKE '%' || $2 || '%'`;
  select += ` OR details->>'subject' LIKE '%' || $2 || '%'`;
  select += ` OR details->>'content' LIKE '%' || $2 || '%'))`;

  const values = [req.user.email, searchText];

  const query = {
    text: select,
    values: values,
  };

  const {rows} = await pool.query(query);

  const retArr = [];
  for (let i = 0; i < rows.length; i++) {
    const newEmail = rows[i].details;
    newEmail['id'] = rows[i].id;

    if (newEmail.to.email == req.user.email) {
      newEmail['starred'] = rows[i].to_starred;
      newEmail['opened'] = rows[i].to_opened;
    } else {
      newEmail['starred'] = rows[i].from_starred;
      newEmail['opened'] = rows[i].from_opened;
    }
    delete newEmail.content;
    retArr.push(newEmail);
  }

  retArr.sort((a, b) => (a.received < b.received) ? 1 : -1);

  res.status(200).json(retArr);
};
