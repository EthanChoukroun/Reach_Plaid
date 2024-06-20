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
    const { id, date, merchant_name, account_name, name, category, amount } =
      transaction;

    return (
      <tr key={id}>
        <td>{account_name}</td>
        <td className="no-wrap">{date}</td>
        <td>{merchant_name ? merchant_name : "N/A"}</td>
        <td>{name}</td>
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
            <th>Account Name</th>

            <th>date</th>
            <th>Merchant Name</th>
            <th>Name</th>
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
