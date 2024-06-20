import React, { ReactElement, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { deleteSession } from "../utils/api";

export default function Menu({
  authorisedUser,
  setAuthorisedUser,
}): ReactElement {
  const navigate = useNavigate();

  function deleteSessionHandler() {
    const abortController = new AbortController();
    deleteSession(abortController.signal)
      .then((res) => {
        setAuthorisedUser(false);
        navigate("/");
      })
      .catch();
  }

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
            <>
              <li>
                <Link to="/transactions">View Transactions</Link>
              </li>
              <li>
                <button
                  type="button"
                  className="logout"
                  onClick={() => deleteSessionHandler()}
                >
                  Logout session
                </button>
              </li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
}
