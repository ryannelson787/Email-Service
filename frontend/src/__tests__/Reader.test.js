import {render, fireEvent} from '@testing-library/react';
import '@testing-library/jest-dom';
import {screen, waitFor} from '@testing-library/react';
import {rest} from 'msw';
import {setupServer} from 'msw/node';
import {MemoryRouter, Route, Routes} from 'react-router-dom';

import HomeScreen from '../components/HomeScreen';

const URLfetchEmails = 'http://localhost:3010/v0/mail';
const URLfetchboxNames = 'http://localhost:3010/v0/boxnames';
const URLfetchEmail = 'http://localhost:3010/v0/mail/someidInbox';
const URLputOpened = 'http://localhost:3010/v0/opened/someidInbox';
const URLputStarred = 'http://localhost:3010/v0/starred/someidInbox';
const URLputTrash = 'http://localhost:3010/v0/mailbox/someidInbox?mailbox=Trash';
const URLputDraft = 'http://localhost:3010/v0/mailbox/someidInbox?mailbox=Draft';

const someEmail = {
  id: 'someid',
  from: {email: 'test1@books.com', name: 'Tester One'},
  to: {email: 'test2@books.com', name: 'Tester Two'},
  received: '2022-01-10T06:00:04+0000',
  subject: 'In Reader',
  mailbox: 'Inbox',
  starred: false,
  opened: false,
};

let readId;

const server = setupServer(
  rest.get(URLfetchEmails, async (req, res, ctx) => {
    const newEmail = Object.assign({}, someEmail);
    newEmail.subject = 'In ' + req.url.searchParams.get('mailbox');
    newEmail.id = 'someid' + req.url.searchParams.get('mailbox');
    readId = newEmail.id;
    return res(ctx.json([newEmail]));
  }),
  rest.get(URLfetchboxNames, async (req, res, ctx) => {
    return res(ctx.json(['Test Box 1']));
  }),
  rest.get(URLfetchEmail, async (req, res, ctx) => {
    const newEmail = Object.assign({}, someEmail);
    newEmail.content = 'Gen Content';
    newEmail.id = readId;
    return res(ctx.json(newEmail));
  }),
  rest.put(URLputOpened, async (req, res, ctx) => {
    return res();
  }),
  rest.put(URLputStarred, async (req, res, ctx) => {
    return res();
  }),
  rest.put(URLputTrash, async (req, res, ctx) => {
    return res();
  }),
  rest.put(URLputDraft, async (req, res, ctx) => {
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

/**
 */
test('star email in reader', async () => {
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
  fireEvent.click(screen.getByLabelText('readStarButton'));
  await waitFor(() => {
    expect(screen.getByLabelText('unstarButton').style.display).toBe('block');
  });
  fireEvent.click(screen.getByLabelText('readUnstarButton'));
});

/**
 */
test('click on close and reread', async () => {
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
  fireEvent.click(screen.getByLabelText('closeEmail'));
  fireEvent.click(screen.getByText('Tester One'));
  await waitFor(() => {
    screen.getByText('Gen Content');
  });
});

/**
 */
test('click on unread', async () => {
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
  fireEvent.click(screen.getByLabelText('unreadEmail'));
});

/**
 */
test('click on unread after move', async () => {
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
  fireEvent.click(screen.getByText('Trash'));
  await waitFor(() => {
    screen.getByText('Mailbox: Trash');
  });
  fireEvent.click(screen.getByLabelText('unreadEmail'));
});

/**
 */
test('trash email', async () => {
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
  fireEvent.click(screen.getByLabelText('trashEmail'));
});

/**
 */
test('selector box email', async () => {
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

  fireEvent.click(screen.getByLabelText('moveButton'));
  fireEvent.click(screen.getByLabelText('selectDraft'));
  fireEvent.click(screen.getByLabelText('moveButton'));
});

/**
 */
test('selector box none email', async () => {
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

  fireEvent.click(screen.getByLabelText('moveButton'));
  fireEvent.click(screen.getByLabelText('moveButton'));
});
