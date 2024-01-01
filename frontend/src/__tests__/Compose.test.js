import {render, fireEvent} from '@testing-library/react';
import '@testing-library/jest-dom';
import {screen, waitFor} from '@testing-library/react';
import {rest} from 'msw';
import {setupServer} from 'msw/node';
import userEvent from '@testing-library/user-event';
import {MemoryRouter, Route, Routes} from 'react-router-dom';

import HomeScreen from '../components/HomeScreen';

const URLfetchEmails = 'http://localhost:3010/v0/mail';
const URLfetchboxNames = 'http://localhost:3010/v0/boxnames';
const URLfetchEmail = 'http://localhost:3010/v0/mail/someid';
const URLputOpened = 'http://localhost:3010/v0/opened/someid';
const URLpostEmail = 'http://localhost:3010/v0/mail';

const someEmail = {
  id: 'someid',
  from: {email: 'test1@books.com', name: 'Tester One'},
  to: {email: 'test2@books.com', name: 'Tester Two'},
  received: new Date().toISOString(),
  subject: 'In a mailbox',
  mailbox: 'Inbox',
  starred: false,
};

const postedEmail = {
  id: 'postedid',
  from: {email: 'test2@books.com', name: 'Tester Two'},
  to: {email: 'test1@books.com', name: 'Tester One'},
  received: new Date().toISOString(),
  subject: 'Just got Sent',
  mailbox: 'Inbox',
  starred: false,
};

let hasPosted = false;

const server = setupServer(
  rest.get(URLfetchEmails, async (req, res, ctx) => {
    const newEmail = Object.assign({}, someEmail);
    newEmail.subject = 'In ' + req.url.searchParams.get('mailbox');
    if (req.url.searchParams.get('mailbox') === 'Sent') {
      return res(ctx.json([postedEmail, newEmail]));
    }
    if (hasPosted) {
      newEmail.subject = 'YES In ' + req.url.searchParams.get('mailbox');
    }
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
  rest.post(URLpostEmail, async (req, res, ctx) => {
    hasPosted = true;
    return res(ctx.json(postedEmail));
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
test('open and close compose', async () => {
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
  fireEvent.click(screen.getByLabelText('composeButton'));
  await waitFor(() => {
    expect(screen.getByText('To:')).toBeVisible();
  });
  fireEvent.click(screen.getByLabelText('closeCompose'));
  await waitFor(() => {
    expect(screen.getByText('In Inbox')).toBeVisible();
  });
});

/**
 */
test('reply compose', async () => {
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
  fireEvent.click(screen.getByText('Tester One'));
  await waitFor(() => {
    screen.getByText('Gen Content');
  });
  fireEvent.click(screen.getByLabelText('replyButton'));
  await waitFor(() => {
    expect(screen.getByText('To:')).toBeVisible();
  });
});


/**
 */
test('post new email', async () => {
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
  fireEvent.click(screen.getByLabelText('composeButton'));
  await waitFor(() => {
    expect(screen.getByText('To:')).toBeVisible();
  });
  const compEm = screen.getByPlaceholderText('email');
  const compSub = screen.getByPlaceholderText('subject');
  const compCon = screen.getByPlaceholderText('content');
  await userEvent.type(compEm, 'test1@books.com');
  await userEvent.type(compSub, 'Just got Sent');
  await userEvent.type(compCon, 'Unimportant');
  fireEvent.click(screen.getByLabelText('sendEmailButton'));
  await waitFor(() => {
    expect(screen.getByText('YES In Inbox')).toBeVisible();
  });
  fireEvent.click(screen.getByText('Sent'));
  await waitFor(() => {
    screen.getByText('Mailbox: Sent');
  });
  expect(screen.getByText('Tester Two')).toBeVisible();
});
