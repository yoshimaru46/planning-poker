import React from "react";

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";

import Home from "./Home";
import CreateRoom from "./CreateRoom";
import Room from "./Room";
import { useSelector } from "react-redux";
import { RootState } from "../rootReducer";

// @ts-ignore
function PrivateRoute({ children, ...rest }) {
  const { auth } = useSelector((state: RootState) => state.auth);
  const user = auth?.user;

  return (
    <Route
      { ...rest }
      render={ ({ location }) =>
        user ? (
          children
        ) : (
          <Redirect
            to={ {
              pathname: "/",
              state: { from: location },
            } }
          />
        )
      }
    />
  );
}

function App() {
  return (
    <Router>
      <Switch>
        <Route exact path="/">
          <Home/>
        </Route>
        <PrivateRoute path="/create-room">
          <CreateRoom/>
        </PrivateRoute>
        <PrivateRoute path="/rooms/:id">
          <Room/>
        </PrivateRoute>
      </Switch>
    </Router>
  );
}

export default App;
