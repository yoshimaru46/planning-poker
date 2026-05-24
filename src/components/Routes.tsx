import { useContext, type ReactNode } from "react";
import {
  BrowserRouter as Router,
  Routes as RouterRoutes,
  Route,
  Navigate,
} from "react-router-dom";

import Home from "./Home";
import CreateRoom from "./CreateRoom";
import Room from "./Room";
import { UserContext } from "./UserContext";
import Loader from "./Loader";
import Navbar from "./Navbar";

const PrivateRoute = ({ children }: { children: ReactNode }) => {
  const user = useContext(UserContext);

  if (user === undefined) {
    return (
      <>
        <Navbar />
        <div className="mt-64">
          <Loader />
        </div>
      </>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const Routes = () => {
  return (
    <Router>
      <RouterRoutes>
        <Route path="/" element={<Home />} />
        <Route
          path="/create-room"
          element={
            <PrivateRoute>
              <CreateRoom />
            </PrivateRoute>
          }
        />
        <Route
          path="/rooms/:id"
          element={
            <PrivateRoute>
              <Room />
            </PrivateRoute>
          }
        />
      </RouterRoutes>
    </Router>
  );
};

export default Routes;
