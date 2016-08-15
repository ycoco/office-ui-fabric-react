import OdspPromise from '@ms/odsp-utilities/lib/async/Promise';

export interface IOAuthTokenDataSource {
  getToken(resource: string): OdspPromise<string>;
}