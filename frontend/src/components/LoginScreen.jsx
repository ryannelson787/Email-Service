import {Button, Grid, TextField, Typography} from '@mui/material';
import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
// import React from 'react';

/**
 * Login Screen
 *
 * @return {object} JSX
 */
function LoginScreen() {
  const history = useNavigate();

  // const [username, setUsername] = useState('molly@books.com');
  // const [password, setPassword] = useState('mollymember');

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  /**
   * Submit Button
   *
   * @param {Event} e
   */
  function onSubmit(e) {
    e.preventDefault();
    fetch('http://localhost:3010/v0/login', {
      method: 'POST',
      body: JSON.stringify({email: username, password: password}),
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw res;
        }
        return res.json();
      })
      .then((json) => {
        localStorage.setItem('user', JSON.stringify(json));
        window.location.href = '/';
        history('/');
      })
      .catch((err) => {
        localStorage.removeItem('user');
        alert('Error logging in, please try again');
      });
  }

  /**
   * Hanlde Username Change
   *
   * @param {Event} e
   */
  function onHandleUsername(e) {
    setUsername(e.target.value);
  }

  /**
   * Hanlde Password Change
   *
   * @param {Event} e
   */
  function onHandlePassword(e) {
    setPassword(e.target.value);
  }

  const loginBoxStyle = {
    'textAlign': 'center',
    'paddingTop': '20vh',
  };
  const textBoxStyle = {
    'textAlign': 'center',
  };
  return (
    <div>
      <Grid container columnSpacing={{xs: 12}} rowSpacing={{xs: 1}}>
        <Grid style={loginBoxStyle} item xs={12}>
          <Typography variant='h6'>
            Login
          </Typography>
        </Grid>
        <Grid style={textBoxStyle} item xs={12}>
          <TextField
            aria-label='username'
            name='username'
            inputProps={{'data-testid': 'usernameInput'}}
            onChange={onHandleUsername}
            autoFocus
            value={username || ''}/>
        </Grid>
        <Grid style={textBoxStyle} item xs={12}>
          <TextField
            aria-label='password'
            type='password'
            name='password'
            inputProps={{'data-testid': 'passwordInput'}}
            onChange={onHandlePassword}
            value={password || ''}/>
        </Grid>
        <Grid style={textBoxStyle} item xs={12}>
          <Button
            onClick={onSubmit}
            aria-label='loginButton'>Sign In</Button>
        </Grid>
      </Grid>
    </div>
  );
};

export default LoginScreen;
