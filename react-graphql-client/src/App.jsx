import { useContext } from 'react';
import { BrowserRouter, Route, Redirect, Switch } from 'react-router-dom';

import AuthContext from './context/auth-context';
import AuthPage from './pages/Auth';
import BookingsPage from './pages/Bookings';
import EventsPage from './pages/Events';
import Navigation from './components/Navigation';
import './App.css';

const App = () => {
  const authContext = useContext(AuthContext);

  return (
    <BrowserRouter>
      <>
        <Navigation />
        <main className='main-content'>
          <Switch>
            {authContext.token && <Redirect from='/' to='/events' exact />}
            {authContext.token && <Redirect from='/auth' to='/events' exact />}
            {!authContext.token && <Route path='/auth' component={AuthPage} />}
            <Route path='/events' component={EventsPage} />
            {authContext.token && (
              <Route path='/bookings' component={BookingsPage} />
            )}
            {!authContext.token && <Redirect to='/auth' exact />}
          </Switch>
        </main>
      </>
    </BrowserRouter>
  );
};

export default App;
