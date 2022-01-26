import React, { ReactElement, useState, useEffect } from 'react';
import { Account } from '../utils/types';

export default function DisplayBalances({ accounts }: { accounts: Account[] }): ReactElement {

  // useEffect(() => {
  //   // immediately invoked function expression (IIFE)
  //   // (async () => await getBalance()
  //   //     .then(({ accounts }) => 
  //   //       setAccounts(accounts)
  //   //     )
  //   // )()
  //   getBalance()
  //     .then(({ accounts }) => {
  //       setAccounts(accounts)
  //     })
  // }, []);
  // console.log(accounts.length)
  const listAccountsAndBalances: React.ReactNode[] = accounts.map(({ account_id, balances: { current }, name }: Account) => {
      return (
        <li key={account_id}>{name}: ${(Math.round(current * 100) / 100).toFixed(2)}</li>
      )
    })

    return (
        <ul>{listAccountsAndBalances}</ul>
    )
}