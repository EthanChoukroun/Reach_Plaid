import React, { ReactElement, useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Menu({ authorisedUser }): ReactElement {
  return (
    <header>
      <Link to="/">
        <h1 className="no-wrap">Reach</h1>
      </Link>
      <nav>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          {authorisedUser && (
            <li>
              <Link to="/transactions">View Transactions</Link>
            </li>
          )}
        </ul>
      </nav>
    </header>
  );
}
