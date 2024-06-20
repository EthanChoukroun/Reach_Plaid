import React, { ReactElement, useEffect, useState } from "react";
import Menu from "./layout/Menu";
import Routing from "./layout/Routing";
import "./app.css";
import { fetchSession } from "./utils/api";
import { Route, Routes, useNavigate } from "react-router";
import UnprotectedComponent from "./layout/UnprotectedComponent";
import DisplayTransactions from "./money/DisplayTransactions";
import { useSearchParams } from "react-router-dom";

function App(): ReactElement {
  const [authorisedUser, setAuthorisedUser] = useState<null | boolean>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  function fetchUserSession() {
    const abortController = new AbortController();
    let phoneNumber = decodeURIComponent(searchParams.get("phone") || "");

    fetchSession(phoneNumber, abortController.signal).then(
      ({ plaidLoginRequired, error }) => {
        if (error) {
          let sign = window.prompt(
            "Invalid Request as Phone number is required. Enter your phone number"
          );
          if (sign) {
            navigate(`/?phone=${sign}`);
          }
        } else {
          if (plaidLoginRequired) {
            setAuthorisedUser(false);
          } else {
            setAuthorisedUser(true);
          }
        }
      }
    );
  }

  useEffect(() => {
    fetchUserSession();
    console.log(searchParams);
  }, [searchParams]);

  return (
    <>
      <Menu
        authorisedUser={authorisedUser}
        setAuthorisedUser={setAuthorisedUser}
      />
      <Routes>
        <Route
          path="/"
          element={
            <UnprotectedComponent authorisedUser={authorisedUser}>
              <Routing setAuthorisedUser={setAuthorisedUser} />
            </UnprotectedComponent>
          }
        />
        <Route
          path="/transactions"
          element={<DisplayTransactions accounts={[]} />}
        />
      </Routes>
    </>
  );
}

export default App;
