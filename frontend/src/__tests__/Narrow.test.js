import {render} from '@testing-library/react';
import '@testing-library/jest-dom';
import {screen, waitFor} from '@testing-library/react';
import {rest} from 'msw';
import {setupServer} from 'msw/node';
import {MemoryRouter, Route, Routes} from 'react-router-dom';

import HomeScreen from '../components/HomeScreen';

const URLfetchEmails = 'http://localhost:3010/v0/mail';
const URLfetchboxNames = 'http://localhost:3010/v0/boxnames';

const someEmail = {
  id: 'someid',
  from: {email: 'test1@books.com', name: 'Tester One'},
  to: {email: 'test2@books.com', name: 'Tester Two'},
  received: '2022-01-10T06:00:04+0000',
  subject: 'In a mailbox',
  content: 'Content is testing',
  mailbox: 'Inbox',
};

const server = setupServer(
  rest.get(URLfetchEmails, async (req, res, ctx) => {
    const newEmail = Object.assign({}, someEmail);
    newEmail.subject = 'In ' + req.url.searchParams.get('mailbox');
    return res(ctx.json([newEmail]));
  }),
  rest.get(URLfetchboxNames, async (req, res, ctx) => {
    return res(ctx.json(['Test Box 1', 'Test Box 2']));
  }),
);

beforeAll(() => {
  server.listen();
  window.innerHeight = 768;
  window.innerWidth = 650;
  window.dispatchEvent(new Event('resize'));
});
beforeEach(() => {
  localStorage.setItem('user', JSON.stringify({accessToken: 'yes'}));
});
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

/**
 */
test('read inbox', async () => {
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
});

/**
 */
test('make less narrow', async () => {
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
  window.innerHeight = 768;
  window.innerWidth = 750;
  window.dispatchEvent(new Event('resize'));
});
