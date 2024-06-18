import React, { ReactElement, useState, useEffect } from "react";
import { Transaction, Account } from "../utils/types";
import { getTransactions } from "../utils/api";

interface Prop {
  accounts: Account[];
}

export default function DisplayTransactions({ accounts }: Prop): ReactElement {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const abortController = new AbortController();
    setLoading(true);
    getTransactions(abortController.signal)
      .then((response) => {
        setTransactions(response);
        setLoading(false);
      })
      .catch((error) => console.error(error));
  }, []);

  const transactionsRows = transactions.map((transaction: Transaction) => {
    const {
      account_id,
      transaction_id,
      date,
      merchant_name,
      name,
      category,
      amount,
    } = transaction;

    // should always find account - is there a way to remove the undefined?
    const accountFound: Account | undefined = accounts.find(
      (account: Account) => {
        return account.account_id === account_id;
      }
    );

    return (
      <tr key={transaction_id}>
        <td>{name}</td>
        <td className="no-wrap">{date}</td>
        {/* <td>{merchant_name ? merchant_name : "N/A"}</td> */}
        {/* <td>{name}</td> */}
        <td>{category}</td>
        <td className="no-wrap">${amount.toFixed(2)}</td>
      </tr>
    );
  });

  return (
    <>
      <table>
        <thead>
          <tr>
            {/* <th>account name</th> */}
            <th>date</th>
            <th>Name</th>
            {/* <th>name</th> */}
            <th>category</th>
            <th>amount</th>
          </tr>
        </thead>
        <tbody>{transactionsRows}</tbody>
      </table>
      {loading && <p>Loading transactions data ...</p>}
    </>
  );
}
