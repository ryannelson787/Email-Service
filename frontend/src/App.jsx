import React from 'react';
import {BrowserRouter, Route, Routes} from 'react-router-dom';

// import Dummy from './components/Dummy';
// import Emoji from './components/Emoji';
import LoginScreen from './components/LoginScreen';
import HomeScreen from './components/HomeScreen';

/**
 * Simple component with no state.
 *
 * @return {object} JSX
 */
function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path='/login' element={<LoginScreen />}/>
          <Route path='/' exact element={<HomeScreen />}/>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
