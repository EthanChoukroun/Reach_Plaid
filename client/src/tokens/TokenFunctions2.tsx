import React, { ReactElement, useState, useEffect, useCallback } from 'react';
import { generateLinkToken, exchangeForAccessToken } from '../utils/api';
import { SetAccessTokenObj } from '../utils/types';
import Instructions from '../layout/Instructions';

import {
    usePlaidLink,
    PlaidLinkOptions,
    PlaidLinkOnSuccess,
    PlaidLinkOnSuccessMetadata
} from 'react-plaid-link';

export default function TokenFunctions({ setAccessTokenObj }: SetAccessTokenObj): ReactElement {
    const [linkToken, setLinkToken] = useState<string>('');

    useEffect(() => {
        const abortController = new AbortController();
        generateLinkToken(abortController.signal)
            .then((token: string) => {
                setLinkToken(token);
            })
            .catch((error) => console.error(error))
        return () => abortController.abort();
    }, []);

    const onSuccess = useCallback<PlaidLinkOnSuccess>(
        async (public_token: string, metadata: PlaidLinkOnSuccessMetadata): Promise<() => void> => {
            const abortController = new AbortController();
            await exchangeForAccessToken(public_token, abortController.signal)
                .then((accessTokenObj) => {
                    console.log(accessTokenObj)
                    setAccessTokenObj(accessTokenObj);
                })
                .catch((error) => console.error(error))
            return () => abortController.abort();
        }, [setAccessTokenObj]);

    const config: PlaidLinkOptions = {
        token: linkToken,
        onSuccess,
        onExit: (error, metadata) => {},
        onEvent: (eventName, metadata) => {}
    };

    const { open, ready, error } = usePlaidLink(config); // Ensure this is before the useEffect that uses 'ready'

    useEffect(() => {
        if (linkToken && ready) {
            open();
        }
    }, [linkToken, ready, open]); // Also include 'open' in the dependency array

    return linkToken ? (
        <>
            <Instructions />
        </>
    ) : (
        <div className="loader"></div> // Show loading animation while waiting for the link token
    );
}
