import React from "react";
import { Switch, Route, Link, Redirect } from "react-router-dom";
import { Nav, Navbar } from "react-bootstrap";
import Home from "./components/Home";
import MerchantInvoiceFull from "./components/MerchantInvoiceFull.js";
import MerchantInfoForm from "./components/MerchantInfoForm";
import Login from "./components/Login";
import Logout from "./components/Logout";
import Payment from "./components/Payment";
import Footer from "./components/Footer";
import { isLoaded, isEmpty } from "react-redux-firebase";
import { useSelector } from "react-redux";
import MerchantInvoice from "./components/MerchantInvoice";
import LoadingPage from "./components/LoadingPage";
import "./App.css";

function AuthIsLoaded({ children }) {
  const auth = useSelector((state) => state.firebase.auth);
  if (!isLoaded(auth)) return <LoadingPage />;
  return children;
}

function PrivateRoute({ children, ...rest }) {
  const auth = useSelector((state) => state.firebase.auth);
  return (
    <Route
      {...rest}
      render={({ location }) =>
        isLoaded(auth) && !isEmpty(auth) ? (
          children
        ) : (
          <Redirect
            to={{
              pathname: "/login",
              state: { from: location },
            }}
          />
        )
      }
    />
  );
}

function App() {
  const auth = useSelector((state) => state.firebase.auth);

  return (
    <div>
      <AuthIsLoaded>
        <Navbar className="navBlue">
          <Navbar.Brand href="/">
            <img
              src="https://cdn.visa.com/cdn/assets/images/logos/visa/logo.png"
              className="visaLogo"
              alt="visa logo"
            ></img>
          </Navbar.Brand>
          <Nav className="navBlue" id="navOptions">
            <Link className="navText" to="/">
              Consumer
            </Link>
            <Link className="navText" to="/merchant">
              Merchant
            </Link>
            {isLoaded(auth) && !isEmpty(auth) ? (
              <>
                <Link className="navText" to="/merchantform">
                  Update Info
                </Link>
                <Link className="navText" to="/logout">
                  Logout
                </Link>
              </>
            ) : (
              <Link className="navText" to="/login">
                Merchant Login
              </Link>
            )}
          </Nav>
        </Navbar>
        <div id="indicatorStripe"></div>
        <Switch>
          <Route exact path="/">
            <Home />
          </Route>
          <Route exact path="/invoice/">
            <Home />
          </Route>
          <Route exact path="/invalid/">
            <div className="fullPageText">
              Invoice code is expired or invalid.
            </div>
          </Route>
          <Route exact path="/invoice/:id" component={Payment} />
          <Route
            path="/merchant"
            render={({ location }) =>
              isLoaded(auth) && !isEmpty(auth) ? (
                <MerchantInvoice />
              ) : (
                <MerchantInvoiceFull />
              )
            }
          />
          <Route path="/login" component={Login} />
          <Route path="/logout" component={Logout} />
          <PrivateRoute path="/merchantform">
            <MerchantInfoForm />
          </PrivateRoute>
        </Switch>
        
      </AuthIsLoaded>
    </div>
  );
}

export default App;
