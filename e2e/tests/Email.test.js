const puppeteer = require('puppeteer');
const http = require('http');
const path = require('path');
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

require('dotenv').config();
const app = require('../../backend/src/app');

let backend;
let frontend;
let browser;
let page;

beforeAll(() => {
  jest.setTimeout(30000);
  backend = http.createServer(app);
  backend.listen(3010, () => {
    console.log('Backend Running at http://localhost:3010');
  });
  frontend = http.createServer(
    express()
      .use('/v0', createProxyMiddleware({ 
        target: 'http://localhost:3010/',
        changeOrigin: true}))
      .use('/static', express.static(
        path.join(__dirname, '..', '..', 'frontend', 'build', 'static')))
      .get('*', function(req, res) {
        res.sendFile('index.html', 
            {root:  path.join(__dirname, '..', '..', 'frontend', 'build')})
      })
  );
  frontend.listen(3020, () => {
    console.log('Frontend Running at http://localhost:3020');
  });
});

afterAll((done) => {
  backend.close(() => { 
    frontend.close(done);
  });
});

beforeEach(async () => {
  browser = await puppeteer.launch({
    args: [
      '--no-sandbox',
      '--headless',
    ],
  });
  page = await browser.newPage();

  // https://pptr.dev/api/puppeteer.page.setviewport/
  await page.setViewport({
    width: 1000,
    height: 600,
    deviceScaleFactor: 1,
  });
});

afterEach(async () => {
  await browser.close();
});

async function login() {
  await page.goto('http://localhost:3020');
  await page.click('aria/username');
  await page.type('aria/username', 'molly@books.com', {delay: 10});
  await page.click('aria/password');
  await page.type('aria/password', 'mollymember', {delay: 10});
  await page.click('aria/loginButton');

  await page.waitForFunction(
    'document.querySelector("body").textContent.includes("Slug Mail - Inbox")',
  );
}

test('Read Newest Email', async () => {
  await login();

  const emailBoxes = await page.$$('aria/emailBox');
  await emailBoxes[0].click();
  await page.waitForFunction(
    'document.querySelector("body").innerText.includes("frank@books.com")',
  );
  const content = await page.$('aria/readContent');
  const contentRes = await(await content.getProperty('textContent')).jsonValue();
  expect(contentRes).toBe('Random Context');
});

test('Star Some Emails', async () => {
  await login();

  // page.on('console', message => {
  //   console.log(message.text());
  // })

  const starButtons = await page.$$('aria/starButton');
  await starButtons[0].click();
  await starButtons[2].click();

  await page.waitForTimeout(100);

  const mailBoxButtons = await page.$$('aria/mailboxButton');
  for (const buttonInd in mailBoxButtons) {
    const button = mailBoxButtons[buttonInd];
    const buttonName = await ( await button.getProperty('textContent')).jsonValue();
    if (buttonName != 'Starred') {
      continue;
    }
    await button.click();
  }
  
  await page.waitForFunction(
    'document.querySelector("body").innerText.includes("Slug Mail - Starred")',
  );
  const emailBoxes = await page.$$('aria/emailBox');
  expect(emailBoxes.length).toBe(2);

  // TEST OVER, resetting
  const unstarButtons = await page.$$('aria/unstarButton');
  await unstarButtons[0].click();
  await unstarButtons[1].click();
  await page.waitForTimeout(100);
});

test('Move email to trash', async () => {
  await login();

  page.on('console', message => {
    console.log(message.text());
  })

  const emailBoxes = await page.$$('aria/emailBox');
  await emailBoxes[0].click();
  await page.waitForFunction(
    'document.querySelector("body").innerText.includes("frank@books.com")',
  );

  await page.click('aria/trashEmail');
  await page.waitForTimeout(100);
  
  const mailBoxButtons = await page.$$('aria/mailboxButton');
  for (const buttonInd in mailBoxButtons) {
    const button = mailBoxButtons[buttonInd];
    const buttonName = await ( await button.getProperty('textContent')).jsonValue();
    if (buttonName != 'Trash') {
      continue;
    }
    await button.click();
  }

  await page.waitForFunction(
    'document.querySelector("body").innerText.includes("Slug Mail - Trash")',
  );
  const trashEmailBoxes = await page.$$('aria/emailBox');
  expect(trashEmailBoxes.length).toBe(5);

  // TEST OVER, resetting
  trashEmailBoxes[4].click();
  await page.waitForFunction(
    'document.querySelector("body").innerText.includes("frank@books.com")',
  );
  await page.click('aria/moveButton');
  await page.click('aria/selectInbox');
  await page.click('aria/moveButton');
  await page.waitForTimeout(100);
});

test('Move email to trash', async () => {
  await login();

  page.on('console', message => {
    console.log(message.text());
  })

  const emailBoxes = await page.$$('aria/emailBox');
  await emailBoxes[0].click();
  await page.waitForFunction(
    'document.querySelector("body").innerText.includes("frank@books.com")',
  );

  await page.click('aria/trashEmail');
  await page.waitForTimeout(100);
  
  const mailBoxButtons = await page.$$('aria/mailboxButton');
  for (const buttonInd in mailBoxButtons) {
    const button = mailBoxButtons[buttonInd];
    const buttonName = await ( await button.getProperty('textContent')).jsonValue();
    if (buttonName != 'Trash') {
      continue;
    }
    await button.click();
  }

  await page.waitForFunction(
    'document.querySelector("body").innerText.includes("Slug Mail - Trash")',
  );
  const trashEmailBoxes = await page.$$('aria/emailBox');
  expect(trashEmailBoxes.length).toBe(5);

  // TEST OVER, resetting
  trashEmailBoxes[4].click();
  await page.waitForFunction(
    'document.querySelector("body").innerText.includes("frank@books.com")',
  );
  await page.click('aria/moveButton');
  await page.click('aria/selectInbox');
  await page.click('aria/moveButton');
  await page.waitForTimeout(100);
});

test('Send email', async () => {
  await login();

  page.on('console', message => {
    console.log(message.text());
  });

  await page.click('aria/composeButton');

  await page.click('aria/toEmail');
  await page.type('aria/toEmail', 'anna@books.com', {delay: 10});
  await page.click('aria/toSubject');
  await page.type('aria/toSubject', 'Let Us Talk', {delay: 10});
  await page.click('aria/toContent');
  await page.type('aria/toContent', 'About Testing', {delay: 10});

  await page.click('aria/sendEmailButton');
});

test('reply to email', async () => {
  await page.goto('http://localhost:3020');
  await page.click('aria/username');
  await page.type('aria/username', 'anna@books.com', {delay: 10});
  await page.click('aria/password');
  await page.type('aria/password', 'annaadmin', {delay: 10});
  await page.click('aria/loginButton');
  await page.waitForFunction(
    'document.querySelector("body").textContent.includes("Slug Mail - Inbox")',
  );

  const emailBoxes = await page.$$('aria/emailBox');
  await emailBoxes[0].click();
  await page.waitForFunction(
    'document.querySelector("body").innerText.includes("molly@books.com")',
  );

  await page.click('aria/replyButton');
  await page.click('aria/toContent');
  await page.type('aria/toContent', 'I So Love Testing', {delay: 10});

  await page.click('aria/sendEmailButton');
});

test('read replied email', async () => {
  await login();

  await page.waitForFunction(
    'document.querySelector("body").textContent.includes("RE: Let Us Talk")',
  );
});
