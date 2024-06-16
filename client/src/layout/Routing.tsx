import React, { ReactElement, useEffect, useState } from "react";
import { Routes, Route, useSearchParams } from "react-router-dom";
import TokenFunctions from "../tokens/TokenFunctions";
import AccessTokenDB from "../tokens/AccessTokenDB";
import DisplayBalances from "../money/DisplayBalances";
import DisplayTransactions from "../money/DisplayTransactions";
import { getTransactions, storeAccessToken } from "../utils/api";
import { AccessTokenObj, Account, Transaction } from "../utils/types";

// function Routes() {
function Routing({ setAuthorisedUser }): ReactElement {
  const [accessTokenObj, setAccessTokenObj] = useState<AccessTokenObj>(
    {} as AccessTokenObj
  );

  // saves access_token to database
  // useEffect(() => {
  //   const abortController = new AbortController();

  //   if (Object.entries(accessTokenObj).length) {
  //     console.log(accessTokenObj);
  //     const { access_token, item_id } = accessTokenObj;

  //     // storeAccessToken(access_token, item_id, abortController.signal)
  //   }
  //   // getTransactions(abortController.signal)
  //   //   .then((response) => {
  //   //     // console.log(response);
  //   //     setTransactions(response);
  //   //   })
  //   //   .catch((error) => console.error(error));
  //   return () => abortController.abort();
  // }, [accessTokenObj]);

  return (
    <main>
      <TokenFunctions
        setAccessTokenObj={setAccessTokenObj}
        setAuthorisedUser={setAuthorisedUser}
      />
    </main>
  );
}

export default Routing;
