import { AccessTokenObj, Account, Transaction } from "./types";
const API_BASE_URL: string = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";
const headers = new Headers();
headers.append("Content-Type", "application/json");

export const generateLinkToken = async (signal): Promise<string> => {
    // deployed Vercel application cannot properly calculate timezone offset from server
    const timezoneOffset = new Date().getTimezoneOffset() * 60000;
    const url: any = new URL(`${API_BASE_URL}/link/token/create`);
    // const url = new URL(`${API_BASE_URL}/api/create_link_token`);
    const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify({ timezoneOffset }),
        credentials: "include",
        signal
    });
    const { link_token: linkToken } = await response.json();
    return linkToken;
}

// adjust to use api endpoint found within documentation...
export const exchangeForAccessToken = async (public_token: string, phoneNumber: string, signal): Promise<AccessTokenObj> => {
    const url: any = new URL(`${API_BASE_URL}/item/public_token/exchange`);
    // const url: any = new URL(`${API_BASE_URL}/api/set_access_token`);
    const response = await fetch(url, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({public_token, phoneNumber}),
        credentials: "include",
        signal
    })
    // console.log(JSON.stringify({data: public_token}))
    // what happens if await is removed?
    // return await response.json();
    return await response.json();
}

export const storeAccessToken = async (access_token: string, item_id: string, signal) => {
    // console.log(access_token);
    const url: any = new URL(`${API_BASE_URL}/accessToken`);
    const response = await fetch(url, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            access_token,
            item_id
        }),
        signal
    })
    return await response.json();
}

export const getBalance = async (signal): Promise<Transaction[]> => {
    const url: any = new URL(`${API_BASE_URL}/balance/get`);
    const options = {
        method: "GET",
        headers,
        body: null,
        signal
    }
    const response = await fetch(url, options);
    return response.json();
}

export const getTransactions = async (signal): Promise<Transaction[]> => {
    const url: any = new URL(`${API_BASE_URL}/transactions/get`);
    const response = await fetch(url, {
        method: "GET",
        headers,
        body: null,
        signal,
        credentials: "include"
    });
    return response.json();
}

export const fetchSession = async (phone, signal) : Promise<any> => {
    const url: any = new URL(`${API_BASE_URL}/session`);
    const response = await fetch(url, {
        method: "POST",
        body: JSON.stringify({
            phone: phone
        }),
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: "include",
        signal
    })
    if (response.status == 200) {
        const data = await response.json()
        return {plaidLoginRequired: false}
    } else if (response.status == 401 ){
        return {plaidLoginRequired: true }
    } else {
        return { error: "Invalid Request" }
    }
}