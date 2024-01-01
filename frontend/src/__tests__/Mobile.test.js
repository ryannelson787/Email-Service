import {render, fireEvent} from '@testing-library/react';
import '@testing-library/jest-dom';
import {screen, waitFor} from '@testing-library/react';
import {rest} from 'msw';
import {setupServer} from 'msw/node';
import {MemoryRouter, Route, Routes} from 'react-router-dom';

import HomeScreen from '../components/HomeScreen';

const URLfetchEmails = 'http://localhost:3010/v0/mail';
const URLfetchboxNames = 'http://localhost:3010/v0/boxnames';
const URLfetchEmail = 'http://localhost:3010/v0/mail/someid';
const URLputOpened = 'http://localhost:3010/v0/opened/someid';
const URLputStarred = 'http://localhost:3010/v0/starred/someid';

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
  rest.get(URLfetchEmail, async (req, res, ctx) => {
    const newEmail = Object.assign({}, someEmail);
    newEmail.content = 'Gen Content';
    return res(ctx.json(newEmail));
  }),
  rest.put(URLputOpened, async (req, res, ctx) => {
    return res();
  }),
  rest.put(URLputStarred, async (req, res, ctx) => {
    return res();
  }),
);

beforeAll(() => {
  server.listen();
  window.innerHeight = 768;
  window.innerWidth = 375;
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
test('open menu', async () => {
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
  fireEvent.click(screen.getByLabelText('menu'));
  await waitFor(() => {
    screen.getByText('Slug Mail');
  });
});

/**
 */
test('read email', async () => {
  render(<MemoryRouter>
    <Routes>
      <Route path='/' element={<HomeScreen />}></Route>
    </Routes>
  </MemoryRouter>,
  );

  await waitFor(() => {
    screen.getByText('Mailbox: Inbox');
  });
  fireEvent.click(screen.getByText('Tester One'));

  // screen.debug(undefined, 300000);

  await waitFor(() => {
    screen.getByText('Gen Content');
  });
});
