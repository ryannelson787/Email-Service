import {render, fireEvent} from '@testing-library/react';
import '@testing-library/jest-dom';
import {screen, waitFor} from '@testing-library/react';
import {rest} from 'msw';
import {setupServer} from 'msw/node';
// import userEvent from '@testing-library/user-event';
import {MemoryRouter, Route, Routes} from 'react-router-dom';

import HomeScreen from '../components/HomeScreen';
import LoginScreen from '../components/LoginScreen';

const URLfetchEmails = 'http://localhost:3010/v0/mail';
const URLfetchboxNames = 'http://localhost:3010/v0/boxnames';
const URLfetchEmailId = 'http://localhost:3010/v0/mail/someid';

const someEmail = {
  id: 'someid',
  from: {email: 'test1@books.com', name: 'Tester One'},
  to: {email: 'test2@books.com', name: 'Tester Two'},
  received: '2022-05-18T06:00:04+0000',
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
  rest.get(URLfetchEmailId, async (req, res, ctx) => {
    const newEmail = Object.assign({}, someEmail);
    return res(ctx.json(newEmail));
  }),
);

beforeAll(() => {
  server.listen();
  window.innerWidth = 1024;
  window.dispatchEvent(new Event('resize'));
});
beforeEach(() => {
  localStorage.setItem('user', JSON.stringify({accesToken: 'yes'}));
});
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

/**
 */
test('Reroute to login', async () => {
  localStorage.removeItem('user');

  render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path='/login' element={<LoginScreen />}/>
        <Route path='/' exact element={<HomeScreen />}/>
      </Routes>
    </MemoryRouter>,
  );

  await waitFor(() => {
    screen.getByText('Login');
  });
});

/**
 */
test('Logout', async () => {
  render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path='/login' element={<LoginScreen />}/>
        <Route path='/' exact element={<HomeScreen />}/>
      </Routes>
    </MemoryRouter>,
  );

  await waitFor(() => {
    screen.getByText('Mailbox: Inbox');
  });
  const logoutButton = screen.getByLabelText('logout');
  fireEvent.click(logoutButton);
  await waitFor(() => {
    screen.getByText('Login');
  });
});
