import React, { ReactElement, useEffect, useState } from "react";
import Menu from "./layout/Menu";
import Routing from "./layout/Routing";
import "./app.css";
import { fetchSession } from "./utils/api";
import { Route, Routes } from "react-router";
import UnprotectedComponent from "./layout/UnprotectedComponent";
import DisplayTransactions from "./money/DisplayTransactions";

function App(): ReactElement {
  const [authorisedUser, setAuthorisedUser] = useState<null | boolean>(null);

  useEffect(() => {
    const abortController = new AbortController();
    fetchSession(abortController.signal).then(({ data, error }) => {
      if (error) {
        setAuthorisedUser(false);
      } else {
        setAuthorisedUser(true);
      }
    });
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
