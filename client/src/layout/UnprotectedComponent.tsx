import React, { ReactElement } from "react";

function UnprotectedComponent({ authorisedUser, children }): ReactElement {
  if (authorisedUser === null) {
    console.log(authorisedUser)
    return <>Loading ...</>;
  } else if (authorisedUser) {
    return <>Already authorised through Plaid</>;
  } else {
    return children;
  }
}

export default UnprotectedComponent;
