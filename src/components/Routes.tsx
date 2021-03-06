import React, { ReactChild, useContext } from "react";

import { isUndefined } from "lodash-es";

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";

import Home from "./Home";
import CreateRoom from "./CreateRoom";
import Room from "./Room";
import { UserContext } from "./UserContext";
import Loader from "./Loader";
import Navbar from "./Navbar";

type Props = {
  children: ReactChild;
  path: string;
};

const PrivateRoute = ({ children }: Props) => {
  const user = useContext(UserContext);

  if (isUndefined(user)) {
    return (
      <>
        <Navbar />
        <div className="mt-64">
          <Loader />
        </div>
      </>
    );
  }

  return (
    <Route
      render={({ location }) =>
        user ? (
          children
        ) : (
          <Redirect
            to={{
              pathname: "/",
              state: { from: location },
            }}
          />
        )
      }
    />
  );
};

const Routes = () => {
  return (
    <Router>
      <Switch>
        <Route exact path="/">
          <Home />
        </Route>
        <PrivateRoute path="/create-room">
          <CreateRoom />
        </PrivateRoute>
        <PrivateRoute path="/rooms/:id">
          <Room />
        </PrivateRoute>
      </Switch>
    </Router>
  );
};

export default Routes;
