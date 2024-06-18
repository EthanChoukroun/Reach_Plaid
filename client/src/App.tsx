import React, { ReactElement, useEffect, useState } from "react";
import Menu from "./layout/Menu";
import Routing from "./layout/Routing";
import "./app.css";
import { fetchSession } from "./utils/api";
import { Route, Routes } from "react-router";
import UnprotectedComponent from "./layout/UnprotectedComponent";
import DisplayTransactions from "./money/DisplayTransactions";
import { useSearchParams } from "react-router-dom";

function App(): ReactElement {
  const [authorisedUser, setAuthorisedUser] = useState<null | boolean>(null);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const abortController = new AbortController();
    let phoneNumber = decodeURIComponent(searchParams.get("phone") || "");

    fetchSession(phoneNumber, abortController.signal).then(
      ({ plaidLoginRequired, error }) => {
        if (error) {
          alert("Invalid Request. Put phone number in params");
        } else {
          if (plaidLoginRequired) {
            setAuthorisedUser(false);
          } else {
            setAuthorisedUser(true);
          }
        }
      }
    );
  }, []);
  console.log(authorisedUser);

  return (
    <>
      <Menu authorisedUser={authorisedUser} />
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
