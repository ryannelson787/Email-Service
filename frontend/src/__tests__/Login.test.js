import {render, fireEvent} from '@testing-library/react';
import '@testing-library/jest-dom';
import {screen, waitFor} from '@testing-library/react';
import {rest} from 'msw';
import {setupServer} from 'msw/node';
import userEvent from '@testing-library/user-event';
import {MemoryRouter, Route, Routes} from 'react-router-dom';

import LoginScreen from '../components/LoginScreen';
import HomeScreen from '../components/HomeScreen';

const URL = 'http://localhost:3010/v0/login';
const URLfetchEmails = 'http://localhost:3010/v0/mail';
const URLfetchboxNames = 'http://localhost:3010/v0/boxnames';

const server = setupServer(
  rest.post(URL, async (req, res, ctx) => {
    const user = await req.json();
    return user.email === 'molly@books.com' ?
      res(ctx.json({name: 'Molly Member', accesToken: 'some-old-jwt'})) :
      res(ctx.status(401, 'Username or password incorrect'));
  }),
  rest.get(URLfetchEmails, async (req, res, ctx) => {
    return res(ctx.json([]));
  }),
  rest.get(URLfetchboxNames, async (req, res, ctx) => {
    return res(ctx.json([]));
  }),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

/**
 */
test('Login Success', async () => {
  render(
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route path='/login' element={<LoginScreen />}/>
        <Route path='/' exact element={<HomeScreen />}/>
      </Routes>
    </MemoryRouter>,
  );
  window.alert = () => { };

  // https://stackoverflow.com/questions/57110557/react-testing-library-the-given-element-does-not-have-a-value-setter-when-firee
  screen.getByText('Login');
  const emailInput = screen.getByTestId('usernameInput');
  await userEvent.type(emailInput, 'molly@books.com');
  const passInput = screen.getByTestId('passwordInput');
  await userEvent.type(passInput, 'molly@books.com');
  fireEvent.click(screen.getByText('Sign In'));
  await waitFor(() => {
    expect(localStorage.getItem('user')).not.toBe(null);
  });
});

/**
 */
test('Login Fail', async () => {
  render(
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route path='/login' element={<LoginScreen />}/>
        <Route path='/' exact element={<HomeScreen />}/>
      </Routes>
    </MemoryRouter>,
  );

  let alerted = false;
  window.alert = () => {
    alerted = true;
  };

  screen.getByText('Login');
  const emailInput = screen.getByLabelText('username');
  await userEvent.type(emailInput, 'molly@bademail.com');
  const passInput = screen.getByLabelText('password');
  await userEvent.type(passInput, 'badpassword');
  fireEvent.click(screen.getByText('Sign In'));
  await waitFor(() => {
    expect(alerted).toBe(true);
  });
  expect(localStorage.getItem('user')).toBe(null);
});
