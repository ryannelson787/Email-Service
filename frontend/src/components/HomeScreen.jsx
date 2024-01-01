// import React, {useState} from 'react';
import {AppBar, Drawer, IconButton, TextField,
  Typography, Button, Grid, TextareaAutosize} from '@mui/material';
import React, {useState, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import MoveToInboxIcon from '@mui/icons-material/MoveToInbox';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import CancelIcon from '@mui/icons-material/Cancel';
import StarOutlineIcon from '@mui/icons-material/StarOutline';
import StarIcon from '@mui/icons-material/Star';
import ReplyIcon from '@mui/icons-material/Reply';
import {useCallback} from 'react';

const styles = {
  appBar: (readEmail, screenInd) => ({
    'width': '100%',
    'height': '66px',
    'display': (screenInd !== 0 || !readEmail) ? 'inline-block' : 'none',
    'padding': '5px',
    'textAlignment': 'center',
  }),
  iconButton: {
    'top': '10px',
    'left': '0px',
    'width': '10%',
  },
  iconButtonMenu: (screenInd) => ({
    'top': '10px',
    'left': '0px',
    'width': '20%',
    'display': (screenInd === 2) ? 'none' : 'inline-block',
  }),
  title: (screenInd) => ({
    'top': '10px',
    'left': '0px',
    'width': '20%',
    'display': (screenInd < 2) ? 'none' : 'inline-block',
  }),
  searchBar: {
    'backgroundColor': 'white',
    'width': '60%',
  },
  searchButton: {
    'position': 'absolute',
    'top': '10px',
    'left': '60%',
  },
  searchCancelButton: {
    'position': 'absolute',
    'top': '10px',
    'left': '65%',
  },
  mailboxContainer: (readEmail, screenInd) => ({
    'paddingLeft': (screenInd === 2) ? '210px' : '0px',
    'paddingRight': (screenInd === 0) ? '0px' : '50%',
    'display': (screenInd === 0 && readEmail) ? 'none' : 'block',
  }),
  mail: (opened) => ({
    'border': '1px solid black',
    'fontWeight': (!opened) ? 'bold' : 'normal',
  }),
  mailboxInd: {
    'paddingTop': '66px',
  },
  stars: (isDisplayed) => ({
    'display': (isDisplayed) ? 'block' : 'none',
    'position': 'absolute',
    'top': '0px',
    'right': '0',
  }),
  starsReader: (isDisplayed) => ({
    'display': (isDisplayed) ? 'inline-block' : 'none',
  }),
  paperProps: (screenInd) => ({
    'width': '200px',
    'padding': '5px',
    'zIndex': (screenInd < 2) ? 1500 : 100,
  }),
  newMailboxField: (isDisplayed) => ({
    'display': (isDisplayed) ? 'block' : 'none',
  }),
  reader: (isDisplayed, screenInd) => ({
    'position': 'fixed',
    'top': (screenInd === 0) ? '0' : '66px',
    'left': (screenInd === 0) ? '0' : '50%',
    'width': (screenInd === 0) ? '100%' : '50%',
    'height': '100%',
    'display': isDisplayed ? 'block' : 'none',
  }),
  composeContainer: (isDisplayed) => ({
    'position': 'fixed',
    'top': '0',
    'left': '0',
    'width': '100%',
    'height': '100%',
    'display': isDisplayed ? 'block' : 'none',
    'backgroundColor': 'rgba(150, 150, 150, 0.5)',
    'zIndex': '1500',
  }),
  composeDialog: (isDisplayed, screenInd) => ({
    'position': 'fixed',
    'top': (screenInd === 0) ? '0%' : '10%',
    'left': (screenInd === 0) ? '0%' : '10%',
    'width': (screenInd === 0) ? '100%' : '80%',
    'height': (screenInd === 0) ? '100%' : '80%',
    'display': isDisplayed ? 'block' : 'none',
    'backgroundColor': 'white',
    'zIndex': '1500',
  }),
  selectBox: (isVisible, isHighlighted) => ({
    'display': (isVisible) ? 'block' : 'none',
    'backgroundColor': (isHighlighted) ? 'lightblue' : 'white',
  }),
};

/**
 * Fetch emails
 *
 * @param {String} mailbox
 * @param {function} setEmails
 * @param {function} setBoxName
 * @param {function} goToLogin
 */
const fetchEmails = (mailbox, setEmails, setBoxName, goToLogin) => {
  const item = localStorage.getItem('user');
  if (!item) {
    goToLogin();
    return;
  }
  const user = JSON.parse(item);
  const bearerToken = user.accessToken;
  fetch('http://localhost:3010/v0/mail?mailbox=' + mailbox, {
    method: 'get',
    headers: new Headers({
      'Authorization': `Bearer ${bearerToken}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    }),
  })
    .then((response) => {
      return response.json();
    })
    .then((json) => {
      setEmails(json);
      setBoxName(mailbox);
    });
};

/**
 * Fetch boxnames
 *
 * @param {function} setBoxNames
 */
const fetchBoxNames = (setBoxNames) => {
  const item = localStorage.getItem('user');
  if (!item) {
    return;
  }
  const user = JSON.parse(item);
  const bearerToken = user.accessToken;
  fetch('http://localhost:3010/v0/boxnames', {
    method: 'get',
    headers: new Headers({
      'Authorization': `Bearer ${bearerToken}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    }),
  })
    .then((response) => {
      return response.json();
    })
    .then((json) => {
      setBoxNames(json);
    });
};

/**
 * Fetch one email
 *
 * @param {Object} email
 * @param {function} setReadEmail
 */
const fetchEmail = (email, setReadEmail) => {
  const item = localStorage.getItem('user');
  const user = JSON.parse(item);
  const bearerToken = user.accessToken;
  fetch('http://localhost:3010/v0/mail/' + email.id, {
    method: 'get',
    headers: new Headers({
      'Authorization': `Bearer ${bearerToken}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    }),
  })
    .then((response) => {
      return response.json();
    })
    .then((json) => {
      setReadEmail(json);
    });
};

const postEmail = (emailBody, boxName, setEmails,
  setBoxName, goToLogin) => {
  const item = localStorage.getItem('user');
  const user = JSON.parse(item);
  const bearerToken = user.accessToken;

  fetch('http://localhost:3010/v0/mail', {
    method: 'POST',
    body: JSON.stringify(emailBody),
    headers: new Headers({
      'Authorization': `Bearer ${bearerToken}`,
      'Content-Type': 'application/json',
    }),
  })
    .then((response) => {
      fetchEmails(boxName, setEmails, setBoxName, goToLogin);
      return response.json();
    });
};

const putStarred = (email) => {
  const item = localStorage.getItem('user');
  const user = JSON.parse(item);
  const bearerToken = user.accessToken;

  fetch('http://localhost:3010/v0/starred/' + email.id, {
    method: 'PUT',
    headers: new Headers({
      'Authorization': `Bearer ${bearerToken}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    }),
  })
    .then((response) => {
      return;
    });
};

const putOpened = (email) => {
  const item = localStorage.getItem('user');
  const user = JSON.parse(item);
  const bearerToken = user.accessToken;

  fetch('http://localhost:3010/v0/opened/' + email.id, {
    method: 'PUT',
    headers: new Headers({
      'Authorization': `Bearer ${bearerToken}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    }),
  })
    .then((response) => {
      return;
    });
};

const postNewMailbox = (newName, boxNames, setBoxNames) => {
  const item = localStorage.getItem('user');
  const user = JSON.parse(item);
  const bearerToken = user.accessToken;

  fetch('http://localhost:3010/v0/boxnames', {
    method: 'POST',
    body: JSON.stringify({name: newName}),
    headers: new Headers({
      'Authorization': `Bearer ${bearerToken}`,
      'Content-Type': 'application/json',
    }),
  })
    .then((response) => {
      return response.json();
    })
    .then((json) => {
      const returnedName = json.name;
      boxNames.push(returnedName);
      setBoxNames([...boxNames]);
    });
};

const putMailbox = (email, toName, boxName,
  setEmails, setBoxName, goToLogin) => {
  const item = localStorage.getItem('user');
  const user = JSON.parse(item);
  const bearerToken = user.accessToken;

  fetch('http://localhost:3010/v0/mailbox/' +
    email.id + '?mailbox=' + toName, {
    method: 'PUT',
    headers: new Headers({
      'Authorization': `Bearer ${bearerToken}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    }),
  })
    .then((response) => {
      fetchEmails(boxName, setEmails, setBoxName, goToLogin);
      return;
    });
};

const fetchSearchEmails = (searchText, setEmails, setBoxName) => {
  const item = localStorage.getItem('user');
  const user = JSON.parse(item);
  const bearerToken = user.accessToken;
  fetch('http://localhost:3010/v0/search?search=' + searchText, {
    method: 'get',
    headers: new Headers({
      'Authorization': `Bearer ${bearerToken}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    }),
  })
    .then((response) => {
      return response.json();
    })
    .then((json) => {
      setEmails(json);
      setBoxName('Search: ' + searchText);
    });
};

/**
 * Home Screen
 *
 * @return {object} JSX
 */
function HomeScreen() {
  const history = useNavigate();

  // partly from dimension provider
  const winDims = () => ({
    height: window.innerHeight,
    width: window.innerWidth,
  });

  const [dimensions, setDimensions] = useState(winDims);
  useEffect(() => {
    const handleResize = () => {
      setDimensions(winDims);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const [emails, setEmails] = React.useState([]);
  const [boxName, setBoxName] = React.useState('');

  const [menuOpen, setMenuOpen] = React.useState(true);

  const [boxNames, setBoxNames] = React.useState([]);

  const [readEmail, setReadEmail] = React.useState(null);

  const [isComposing, setIsComposing] = React.useState(false);

  const [compEmail, setCompEmail] = React.useState('');
  const [compSubject, setCompSubject] = React.useState('');
  const [compContent, setCompContent] = React.useState('');

  const [nameDiag, setNameDiag] = React.useState(false);
  const [newBoxName, setNewBoxName] = React.useState('');

  const [selectBox, setSelectBox] = React.useState('');
  const [isSelecting, setIsSelecting] = React.useState(false);

  const [searchText, setSearchText] = React.useState('');

  const logout = () => {
    localStorage.removeItem('user');
    setEmails([]);
    setBoxName('');
    history('/login');
  };

  const openMenu = () => {
    setMenuOpen(true);
  };

  const menuClose = () => {
    setMenuOpen(false);
  };

  const handleBoxClick = (box) => {
    fetchEmails(box, setEmails, setBoxName, goToLogin);
    setMenuOpen(false);
  };

  const handleEmailClick = (email) => {
    fetchEmail(email, setReadEmail);
    if (!email.opened) {
      putOpened(email);
      email.opened = true;
      const newEmails = [...emails];
      setEmails(newEmails);
    }
  };

  const handleStarButton = (email) => {
    putStarred(email);
    email.starred = !email.starred;
    for (let i = 0; i < emails.length; i++) {
      if (emails[i].id === email.id) {
        emails[i].starred = email.starred;
      }
    }
    const newEmails = [...emails];
    setEmails(newEmails);
    if (readEmail && readEmail.id === email.id) {
      readEmail.starred = email.starred;
      const newReadEmail = Object.assign({}, readEmail);
      setReadEmail(newReadEmail);
    }
  };

  const handleUnread = (email) => {
    setReadEmail(null);
    putOpened(email);

    for (let i = 0; i < emails.length; i++) {
      if (emails[i].id === email.id) {
        emails[i].opened = false;
      }
    }
    const newEmails = [...emails];
    setEmails(newEmails);
  };

  const handleSendButton = () => {
    const emailBody = {
      to_email: compEmail + '',
      subject: compSubject + '',
      content: compContent + '',
    };
    postEmail(emailBody, boxName, setEmails,
      setBoxName, goToLogin);
    setIsComposing(false);
    setCompEmail('');
    setCompSubject('');
    setCompContent('');
  };

  const handleComposeClose = () => {
    setIsComposing(false);
    setCompEmail('');
    setCompSubject('');
    setCompContent('');
  };

  const handleReplyButton = (email) => {
    setIsComposing(true);
    setCompEmail(email.from.email);
    setCompSubject('RE: ' + email.subject);
  };

  const handleNewBoxButton = () => {
    if (!nameDiag) {
      setNameDiag(true);
      setNewBoxName('');
    } else {
      if (newBoxName !== '') {
        postNewMailbox(newBoxName, boxNames, setBoxNames);
        setNewBoxName('');
      }
      setNameDiag(false);
    }
  };

  const handleMoveTo = (email, toName) => {
    if (toName === '') {
      return;
    }
    putMailbox(email, toName, boxName,
      setEmails, setBoxName, goToLogin);
    setSelectBox(toName);
    setReadEmail(null);
  };

  const handleSelectBox = (email, toName) => {
    if (isSelecting) {
      setIsSelecting(false);
      handleMoveTo(email, toName);
    } else {
      setIsSelecting(true);
      setSelectBox('');
    }
  };

  const handleSearchButton = (searchText) => {
    if (searchText === '') {
      setSearchText('');
      return;
    }
    setSearchText('');
    fetchSearchEmails(searchText, setEmails, setBoxName);
  };

  const goToLogin = useCallback(() => {
    history('/login');
  }, [history]);

  const getScreenInd = () => {
    const deskSmall = dimensions.width > 600;
    const deskLarge = dimensions.width > 900;

    if (deskLarge) {
      return 2;
    } else if (deskSmall) {
      return 1;
    } else {
      return 0;
    }
  };

  const getDropDownBoxes = () => {
    if (!readEmail) {
      return [];
    }

    const origBoxes = ['Inbox', 'Draft'];
    const allBoxes = boxNames.concat(origBoxes);

    for (let i = 0; i < allBoxes.length; i++) {
      if (allBoxes[i] === readEmail.mailbox) {
        allBoxes.splice(i, 1);
      }
    }

    return allBoxes;
  };

  React.useEffect(() => {
    fetchEmails('Inbox', setEmails, setBoxName, goToLogin);
    fetchBoxNames(setBoxNames);
    menuClose();
  }, [goToLogin]);

  return (
    <div>
      <AppBar
        style={styles.appBar(readEmail, getScreenInd())}
        aria-label='appbar'>
        <IconButton
          aria-label='menu'
          style={styles.iconButtonMenu(getScreenInd())}
          onClick={openMenu}>
          <MenuIcon />
        </IconButton>
        <Typography
          variant='h6'
          style={styles.title(getScreenInd())}>
          Slug Mail - {boxName}
        </Typography>
        <TextField
          style={styles.searchBar}
          value={searchText || ''}
          aria-label='searchBarText'
          name='searchBarText'
          inputProps={{'data-testid': 'searchBarText'}}
          autoFocus
          onChange={(e) => setSearchText(e.target.value)}/>
        <IconButton
          aria-label='submitSearch'
          style={styles.searchButton}
          onClick={() => handleSearchButton(searchText)}>
          <SearchIcon/>
        </IconButton>
        <IconButton
          aria-label='cancelSearch'
          style={styles.searchCancelButton}
          onClick={() => setSearchText('')}>
          <CancelIcon/>
        </IconButton>
        <IconButton
          aria-label='composeButton'
          style={styles.iconButton}
          onClick={() => setIsComposing(true)}>
          <MailOutlineIcon />
        </IconButton>
        <IconButton
          aria-label='logout'
          style={styles.iconButton}
          onClick={logout}>
          <AccountCircleIcon />
        </IconButton>
      </AppBar>
      <Drawer
        aria-label='menudrawer'
        style={styles.menu}
        PaperProps={{
          sx: styles.paperProps(getScreenInd()),
        }}
        variant={(getScreenInd() < 2) ? 'temporary' : 'permanent'}
        open={menuOpen}
        onClose={menuClose}>
        <Typography variant='h6'>
          Slug Mail
        </Typography>
        <Button
          aria-label='closeMenu'
          onClick={menuClose}>
          Close Menu
        </Button>
        <Typography variant='h6' backgroundColor='lightgray'>
          {boxName}
        </Typography>
        <Typography>
          Main Mailboxes:
        </Typography>
        {['Starred',
          'Inbox',
          'Sent',
          'Trash',
          'Draft'].map((box) => {
          return (
            <Button
              aria-label='mailboxButton'
              key={box}
              onClick={() => handleBoxClick(box)}>
              {box}
            </Button>
          );
        })}
        <Typography>
          Custom Mailboxes:
        </Typography>
        {boxNames.map((box) => {
          return (
            <Button
              aria-label='mailboxButton'
              key={box}
              onClick={() => handleBoxClick(box)}>
              {box}
            </Button>
          );
        })}
        <Button
          onClick={() => handleNewBoxButton()}>
          <b>Create New Mailbox</b>
        </Button>
        <TextField
          style={styles.newMailboxField(nameDiag)}
          value={newBoxName}
          onChange={(e) => setNewBoxName(e.target.value)}
          placeholder='mailbox name'/>
      </Drawer>
      <div
        style={styles.mailboxContainer(readEmail, getScreenInd())}>
        <Typography
          style={styles.mailboxInd}
          variant='h6'>
          <b>Mailbox: {boxName || ''}</b>
        </Typography>
        <div>
          {emails.map((email) => {
            return (
              <div
                style={{'position': 'relative'}}
                key={email.id}
                aria-label='emailBox'>
                <div style={styles.mail(email.opened)}
                  onClick={() => handleEmailClick(email)}>
                  <div>{email.from.name}</div>
                  <div>{getFormDate(email.received)}</div>
                  <div>{email.subject}</div>
                </div>
                <IconButton
                  onClick={() => handleStarButton(email)}
                  style={styles.stars(email.starred)}
                  aria-label='unstarButton'>
                  <StarIcon/>
                </IconButton>
                <IconButton
                  onClick={() => handleStarButton(email)}
                  style={styles.stars(!email.starred)}
                  aria-label='starButton'>
                  <StarOutlineIcon/>
                </IconButton>
              </div>
            );
          })}
        </div>
      </div>
      <div
        style={styles.reader(readEmail, getScreenInd())}>
        <Grid
          container
          justifyContent='space-between'>
          <Grid>
            <IconButton
              aria-label='closeEmail'
              onClick={() => setReadEmail(null)}>
              <ArrowBackIosIcon />
            </IconButton>
          </Grid>
          <Grid>
            <IconButton
              aria-label='unreadEmail'
              onClick={() => handleUnread(readEmail)}>
              <MailOutlineIcon />
            </IconButton>
          </Grid>
          <Grid>
            <IconButton
              aria-label='moveButton'
              onClick={() => handleSelectBox(readEmail, selectBox)}>
              <MoveToInboxIcon />
            </IconButton>
            <div>
              {getDropDownBoxes().map((name) => {
                return (
                  <div
                    onClick={() => setSelectBox(name)}
                    style={styles.selectBox(
                      isSelecting,
                      name === selectBox,
                    )}
                    aria-label={'select' + name}>{name}</div>
                );
              })}
            </div>
          </Grid>
          <Grid>
            <IconButton
              aria-label='trashEmail'
              onClick={() => handleMoveTo(readEmail, 'Trash')}>
              <DeleteIcon />
            </IconButton>
          </Grid>
        </Grid>
        <Typography
          variant='h3'
          aria-label='readSub'>
          {readEmail ? readEmail.subject : ''}
        </Typography>
        <Typography
          variant='h4'
          aria-label='readMailbox'>
          {readEmail ? readEmail.mailbox : ''}
        </Typography>
        <IconButton
          onClick={() => handleStarButton(readEmail)}
          aria-label='readUnstarButton'
          style={styles.starsReader((readEmail) ? readEmail.starred : false)}>
          <StarIcon/>
        </IconButton>
        <IconButton
          onClick={() => handleStarButton(readEmail)}
          aria-label='readStarButton'
          style={styles.starsReader((readEmail) ? !readEmail.starred : false)}>
          <StarOutlineIcon/>
        </IconButton>
        <IconButton
          aria-label='replyButton'
          onClick={() => handleReplyButton(readEmail)}>
          <ReplyIcon/>
        </IconButton>
        <br/>
        <AccountCircleIcon/>
        <Typography
          variant='h6'
          aria-label='readFromName'>
          {readEmail ? readEmail.from.name : ''}
        </Typography>
        <Typography
          variant='h6'
          aria-label='readFromEmail'>
          {readEmail ? readEmail.from.email : ''}
        </Typography>
        <Typography
          variant='h6'
          aria-label='readDate'>
          {readEmail ? getFormDate(readEmail.received) : ''}
        </Typography>
        <div
          aria-label='readContent'>{readEmail ? readEmail.content : ''}</div>
      </div>
      <div style={styles.composeContainer(isComposing)}>
        <div
          style={styles.composeDialog(isComposing, getScreenInd())}>
          <Grid
            container
            justifyContent='space-between'>
            <Grid>
              <IconButton
                aria-label='closeCompose'
                onClick={() => handleComposeClose()}>
                <ArrowBackIosIcon />
              </IconButton>
            </Grid>
            <Grid>
              <IconButton
                aria-label='sendEmailButton'
                onClick={() => handleSendButton()}>
                <ArrowForwardIcon />
              </IconButton>
            </Grid>
          </Grid>
          <div>
            To:<br/>
            <TextField
              aria-label='toEmail'
              value={compEmail}
              onChange={(e) => setCompEmail(e.target.value)}
              placeholder='email'/>
          </div>
          <div>
            Subject:<br/>
            <TextField
              aria-label='toSubject'
              value={compSubject}
              onChange={(e) => setCompSubject(e.target.value)}
              placeholder='subject'/>
          </div>
          <div>
            Content: <br/>
            <TextareaAutosize
              aria-label='toContent'
              placeholder='content'
              minRows={25}
              maxRows={25}
              onChange={(e) => setCompContent(e.target.value)}
              style={{width: '98%'}}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

const getFormDate = (dateStr) => {
  const sent = new Date(dateStr);
  const now = new Date();
  const yest = new Date();
  yest.setDate(yest.getDate() - 1);
  const ly = new Date();
  ly.setFullYear(ly.getFullYear() - 1);

  const yearCond = sent.getFullYear() === now.getFullYear();
  const monthCond = sent.getMonth() === now.getMonth();
  const dateCond = sent.getDate() === now.getDate();

  const yearCond2 = sent.getFullYear() === yest.getFullYear();
  const monthCond2 = sent.getMonth() === yest.getMonth();
  const dateCond2 = sent.getDate() === yest.getDate();

  const yearCond3a = sent.getFullYear() > ly.getFullYear();
  const yearCond3b = sent.getFullYear() === ly.getFullYear();
  const monthCond3 = sent.getMonth() >= ly.getMonth();

  if (yearCond && monthCond && dateCond) {
    const options = {
      hour: 'numeric',
      minute: 'numeric',
    };

    return sent.toLocaleTimeString('en-us', options);
  } else if (yearCond2 && monthCond2 && dateCond2) {
    return 'Yesterday';
  } else if (yearCond3a || (yearCond3b && monthCond3)) {
    const options = {
      month: 'short',
      day: 'numeric',
    };

    return sent.toLocaleDateString('en-us', options);
  } else {
    return sent.getFullYear() + '';
  }
};

export default HomeScreen;
