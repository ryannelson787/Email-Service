const supertest = require('supertest');
const http = require('http');

const db = require('./db');
const app = require('../app');
const {randomUUID} = require('crypto');

let server;

let user;

let inboxId;
let sentId;

beforeAll(() => {
  server = http.createServer(app);
  server.listen();
  request = supertest(server);
  return db.reset();
});

afterAll((done) => {
  server.close(done);
  db.shutdown();
});

test('POST login', async () => {
  await request.post('/v0/login')
    .send({
      'email': 'molly@books.com',
      'password': 'mollymember',
    })
    .expect(200)
    .expect('Content-Type', /json/)
    .then((res) => {
      expect(res).toBeDefined();
      expect(res.body).toBeDefined();
      expect(res.body.name).toBe('Molly Member');
      expect(res.body.accessToken).toBeDefined();
      user = res.body;
    });
});

test('POST login bad email', async () => {
  await request.post('/v0/login')
    .send({
      'email': 'molly@BADBOOKS.com',
      'password': 'mollymember',
    })
    .expect(401);
});

test('POST login bad pass', async () => {
  await request.post('/v0/login')
    .send({
      'email': 'molly@books.com',
      'password': 'BADmollymember',
    })
    .expect(401);
});

test('GET inbox Bad Token', async () => {
  await request.get('/v0/mail?mailbox=Inbox')
    .set({
      'Authorization': `Bearer BADTOKEN`,
    })
    .expect(403);
});

test('GET inbox no Token', async () => { // for app coverage
  await request.get('/v0/mail?mailbox=Inbox')
    .expect(401);
});

test('GET inbox Molly', async () => {
  await request.get('/v0/mail?mailbox=Inbox')
    .set({
      'Authorization': `Bearer ${user.accessToken}`,
    })
    .expect(200)
    .expect('Content-Type', /json/)
    .then((data) => {
      expect(data).toBeDefined();
      expect(data.body).toBeDefined();
      inboxId = data.body[0].id;
    });
});

test('GET sent Molly', async () => {
  await request.get('/v0/mail?mailbox=Sent')
    .set({
      'Authorization': `Bearer ${user.accessToken}`,
    })
    .expect(200)
    .expect('Content-Type', /json/)
    .then((data) => {
      expect(data).toBeDefined();
      expect(data.body).toBeDefined();
      sentId = data.body[0].id;
    });
});


test('GET starred Molly', async () => {
  await request.get('/v0/mail?mailbox=Starred')
    .set({
      'Authorization': `Bearer ${user.accessToken}`,
    })
    .expect(200)
    .expect('Content-Type', /json/)
    .then((data) => {
      expect(data).toBeDefined();
      expect(data.body).toBeDefined();
    });
});

test('GET mailbox names Molly', async () => {
  await request.get('/v0/boxnames')
    .set({
      'Authorization': `Bearer ${user.accessToken}`,
    })
    .expect(200)
    .expect('Content-Type', /json/)
    .then((data) => {
      expect(data).toBeDefined();
      expect(data.body).toBeDefined();
    });
});

test('GET one email inbox', async () => {
  await request.get('/v0/mail/' + inboxId)
    .set({
      'Authorization': `Bearer ${user.accessToken}`,
    })
    .expect(200)
    .expect('Content-Type', /json/)
    .then((data) => {
      expect(data).toBeDefined();
      expect(data.body).toBeDefined();
      expect(data.body.content).toBeDefined();
    });
});

test('GET one email sent', async () => {
  await request.get('/v0/mail/' + sentId)
    .set({
      'Authorization': `Bearer ${user.accessToken}`,
    })
    .expect(200)
    .expect('Content-Type', /json/)
    .then((data) => {
      expect(data).toBeDefined();
      expect(data.body).toBeDefined();
      expect(data.body.content).toBeDefined();
    });
});

test('GET bad email Molly', async () => {
  await request.get('/v0/mail/' + randomUUID())
    .set({
      'Authorization': `Bearer ${user.accessToken}`,
    })
    .expect(404);
});

test('POST new email Molly', async () => {
  await request.post('/v0/mail')
    .set({
      'Authorization': `Bearer ${user.accessToken}`,
      'Content-Type': 'application/json',
    })
    .send({
      'to_email': 'anna@books.com',
      'subject': 'Molly to Anna',
      'content': 'New Random Context',
    })
    .expect(201)
    .expect('Content-Type', /json/)
    .then((res) => {
      expect(res).toBeDefined();
      expect(res.body).toBeDefined();
      expect(res.body.id).toBeDefined();
      postedId = res.body.id;
    });
});

test('POST new email to unknown', async () => {
  await request.post('/v0/mail')
    .set({
      'Authorization': `Bearer ${user.accessToken}`,
      'Content-Type': 'application/json',
    })
    .send({
      'to_email': 'mystery@books.com',
      'subject': 'Molly to Mystery',
      'content': 'New Random Context',
    })
    .expect(201)
    .expect('Content-Type', /json/)
    .then((res) => {
      expect(res).toBeDefined();
      expect(res.body).toBeDefined();
      expect(res.body.id).toBeDefined();
      expect(res.body.to.name).toBe('Unknown');
    });
});

test('PUT star inbox', async () => {
  await request.put('/v0/starred/' + inboxId)
    .set({
      'Authorization': `Bearer ${user.accessToken}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    })
    .expect(204);
});

test('PUT star sent', async () => {
  await request.put('/v0/starred/' + sentId)
    .set({
      'Authorization': `Bearer ${user.accessToken}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    })
    .expect(204);
});

test('PUT opened inbox', async () => {
  await request.put('/v0/opened/' + inboxId)
    .set({
      'Authorization': `Bearer ${user.accessToken}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    })
    .expect(204);
});

test('PUT opened sent', async () => {
  await request.put('/v0/opened/' + sentId)
    .set({
      'Authorization': `Bearer ${user.accessToken}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    })
    .expect(204);
});

test('POST new mailbox', async () => {
  await request.post('/v0/boxnames')
    .set({
      'Authorization': `Bearer ${user.accessToken}`,
      'Content-Type': 'application/json',
    })
    .send({
      'name': 'Test Boxname',
    })
    .expect(201)
    .expect('Content-Type', /json/)
    .then((res) => {
      expect(res).toBeDefined();
      expect(res.body).toBeDefined();
      expect(res.body.name).toBe('Test Boxname');
    });
});

test('PUT inbox into trash', async () => {
  await request.put('/v0/mailbox/' + inboxId +
    '?mailbox=Trash')
    .set({
      'Authorization': `Bearer ${user.accessToken}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    })
    .expect(204);
});

test('PUT sent into trash', async () => {
  await request.put('/v0/mailbox/' + sentId +
    '?mailbox=Trash')
    .set({
      'Authorization': `Bearer ${user.accessToken}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    })
    .expect(204);
});

test('GET search for gary', async () => {
  await request.get('/v0/search/?search=Four')
    .set({
      'Authorization': `Bearer ${user.accessToken}`,
    })
    .expect(200);
});
