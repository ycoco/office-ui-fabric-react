import Promise from '@ms/odsp-utilities/lib/async/Promise';

export interface ISessionToken {
    accessToken: string;
    proofToken?: string;
    tokenUrl?: string;
}

export interface ITokenProvider {
    /**
     * Gets the access token for the current session
     */
    getToken(apiVersion?: 'v2.0' | 'v2.1'): Promise<ISessionToken>;
}