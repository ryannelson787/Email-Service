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
const URLpostNewBox = 'http://localhost:3010/v0/boxnames';
const URLfetchSearch = 'http://localhost:3010/v0/search';

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
  rest.post(URLpostNewBox, async (req, res, ctx) => {
    return res(ctx.json({name: 'Test Box New'}));
  }),
  rest.get(URLfetchSearch, async (req, res, ctx) => {
    const newEmail = Object.assign({}, someEmail);
    newEmail.subject = 'In ' + req.url.searchParams.get('mailbox');
    return res(ctx.json([newEmail]));
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
test('Look at trash', async () => {
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
  await waitFor(() => {
    screen.getByText('Trash');
  });
  fireEvent.click(screen.getByText('Trash'));
  await waitFor(() => {
    screen.getByText('Mailbox: Trash');
  });
  screen.getByText('In Trash');
});

/**
 */
test('Look at test box 1', async () => {
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
  await waitFor(() => {
    screen.getByText('Test Box 1');
  });
  fireEvent.click(screen.getByText('Test Box 1'));
  await waitFor(() => {
    screen.getByText('Mailbox: Test Box 1');
  });
  screen.getByText('In Test Box 1');
});

/**
 */
test('create new mailbox', async () => {
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
  await waitFor(() => {
    screen.getByText('Create New Mailbox');
  });
  fireEvent.click(screen.getByText('Create New Mailbox'));
  await waitFor(() => {
    screen.getByPlaceholderText('mailbox name');
  });
  const newNameField = screen.getByPlaceholderText('mailbox name');
  await userEvent.type(newNameField, 'Test Box New');
  fireEvent.click(screen.getByText('Create New Mailbox'));
  await waitFor(() => {
    screen.getByText('Test Box New');
  });
  fireEvent.click(screen.getByText('Test Box New'));
  await waitFor(() => {
    screen.getByText('Mailbox: Test Box New');
  });
  screen.getByText('In Test Box New');
});

/**
 */
test('empty name mailbox submit', async () => {
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
  await waitFor(() => {
    screen.getByText('Create New Mailbox');
  });
  fireEvent.click(screen.getByText('Create New Mailbox'));
  await waitFor(() => {
    screen.getByPlaceholderText('mailbox name');
  });
  fireEvent.click(screen.getByText('Create New Mailbox'));
});

/**
 */
test('Search for Gary', async () => {
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

  const searchBar = screen.getByTestId('searchBarText');
  await userEvent.type(searchBar, 'Gary');

  fireEvent.click(screen.getByLabelText('submitSearch'));

  await waitFor(() => {
    screen.getByText('Mailbox: Search: Gary');
  });
});

/**
 */
test('Search for nothing', async () => {
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

  fireEvent.click(screen.getByLabelText('cancelSearch'));
  fireEvent.click(screen.getByLabelText('submitSearch'));
});
