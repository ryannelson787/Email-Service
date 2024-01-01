import {render, fireEvent} from '@testing-library/react';
import '@testing-library/jest-dom';
import {screen, waitFor} from '@testing-library/react';
import {rest} from 'msw';
import {setupServer} from 'msw/node';
import {MemoryRouter, Route, Routes} from 'react-router-dom';

import HomeScreen from '../components/HomeScreen';

const URLfetchEmails = 'http://localhost:3010/v0/mail';
const URLfetchboxNames = 'http://localhost:3010/v0/boxnames';
const URLputStarred = 'http://localhost:3010/v0/starred/someid1';

const now = new Date();
const yest = new Date();
yest.setDate(yest.getDate() - 1);
const monsAgo = new Date();
monsAgo.setMonth(monsAgo.getMonth() - 2);
const lotMonsAgo = new Date();
lotMonsAgo.setMonth(lotMonsAgo.getMonth() - 11);
const yearsAgo = new Date();
yearsAgo.setFullYear(yearsAgo.getFullYear() - 2);

const email1 = {
  id: 'someid1',
  from: {email: 'test3@books.com', name: 'Tester Three'},
  to: {email: 'test2@books.com', name: 'Tester Two'},
  received: now.toISOString(),
  subject: 'In a mailbox',
  mailbox: 'Inbox',
  starred: false,
};

const email2 = {
  id: 'someid2',
  from: {email: 'test1@books.com', name: 'Tester One'},
  to: {email: 'test2@books.com', name: 'Tester Two'},
  received: yest.toISOString(),
  subject: 'In a mailbox',
  mailbox: 'Inbox',
  starred: true,
};

const email3 = {
  id: 'someid3',
  from: {email: 'test1@books.com', name: 'Tester One'},
  to: {email: 'test2@books.com', name: 'Tester Two'},
  received: monsAgo.toISOString(),
  subject: 'In a mailbox',
  mailbox: 'Inbox',
  starred: true,
};

const email4 = {
  id: 'someid4',
  from: {email: 'test1@books.com', name: 'Tester One'},
  to: {email: 'test2@books.com', name: 'Tester Two'},
  received: yearsAgo.toISOString(),
  subject: 'In a mailbox',
  mailbox: 'Inbox',
  starred: true,
};

const email5 = {
  id: 'someid5',
  from: {email: 'test1@books.com', name: 'Tester One'},
  to: {email: 'test2@books.com', name: 'Tester Two'},
  received: lotMonsAgo.toISOString(),
  subject: 'In a mailbox',
  mailbox: 'Inbox',
  starred: true,
};

const server = setupServer(
  rest.get(URLfetchEmails, async (req, res, ctx) => {
    return res(ctx.json([email1, email2, email3, email4, email5]));
  }),
  rest.get(URLfetchboxNames, async (req, res, ctx) => {
    return res(ctx.json(['Test Box 1', 'Test Box 2']));
  }),
  rest.put(URLputStarred, async (req, res, ctx) => {
    return res();
  }),
);

beforeAll(() => {
  server.listen();
  window.innerWidth = 1024;
  window.innerHeight = 768;
  // window.innerWidth = 375;
  window.dispatchEvent(new Event('resize'));
});
beforeEach(() => {
  localStorage.setItem('user', JSON.stringify({accessToken: 'yes'}));
});
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

/**
 */
test('star/unstar email', async () => {
  render(<MemoryRouter>
    <Routes>
      <Route path='/' element={<HomeScreen />}></Route>
    </Routes>
  </MemoryRouter>,
  );

  // screen.debug(undefined, 300000);

  await waitFor(() => {
    screen.getByText('Mailbox: Inbox');
  });
  fireEvent.click(screen.getAllByLabelText('starButton')[0]);
  await waitFor(() => {
    expect(screen.getAllByLabelText('unstarButton')[0].style.display)
      .toBe('block');
  });
  fireEvent.click(screen.getAllByLabelText('unstarButton')[0]);
});
