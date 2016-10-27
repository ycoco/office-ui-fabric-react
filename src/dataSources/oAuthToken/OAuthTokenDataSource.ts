import { IOAuthUtilityContext, ILogger, IQosMonitor } from '@ms/sp-client-shared/lib/tokenUtility/IOAuthUtilityContext';
import { IOAuthToken } from '@ms/sp-client-shared/lib/tokenUtility/IOAuthToken';
import OAuthUtility from '@ms/sp-client-shared/lib/tokenUtility/OAuthUtility';
import DataSource from '../base/DataSource';
import OdspPromise from '@ms/odsp-utilities/lib/async/Promise';
import { ISpPageContext, getSafeWebServerRelativeUrl } from '../../interfaces/ISpPageContext';
import { IOAuthTokenDataSource } from './IOAuthTokenDataSource';
import QosEvent, { ResultTypeEnum } from '@ms/odsp-utilities/lib/logging/events/Qos.event';

class Monitor implements IQosMonitor {
  private _qos: QosEvent;

  public constructor() {
    this._qos = new QosEvent({
      name: 'OAuthTokenDataSource'
    });
  }

  public writeSuccess() {
    this._qos.end({
      resultType: ResultTypeEnum.Success
    });
  }

  public writeUnexpectedFailure(tag?: string, ex?: Error) {
    this._qos.end({
      resultCode: tag,
      resultType: ResultTypeEnum.Failure,
      error: JSON.stringify(ex)
    });
  }

  public writeExpectedFailure(tag?: string, ex?: Error) {
    this._qos.end({
      resultCode: tag,
      resultType: ResultTypeEnum.ExpectedFailure,
      error: JSON.stringify(ex)
    });
  }
}

class Logger implements ILogger {
  public logWarning(message: string): void {/* EMPTY BLOCK */}
  public logError(message: string): void {/* EMPTY BLOCK */}
}

export interface IOAuthTokenDataSourceParams {
  /**
   * This function should return a new monitor instance at each call
   */
  createMonitor?: () => IQosMonitor;
  /**
   * Logger to be used internally by the data source
   */
  logger?: ILogger;
}

export default class OAuthTokenDataSource extends DataSource implements IOAuthUtilityContext, IOAuthTokenDataSource {
  public logger: ILogger = new Logger();
  private _oAuthUtility: OAuthUtility;
  private _createMonitor: () => IQosMonitor;

  public constructor(context: ISpPageContext, params?: IOAuthTokenDataSourceParams) {
    super(context);
    if (params) {
      if (params.createMonitor) {
        this._createMonitor = params.createMonitor;
      }
      if (params.logger) {
        this.logger = params.logger;
      }
    }
    this._oAuthUtility = new OAuthUtility(this);
  }

  public qosMonitor(): IQosMonitor {
    return new Monitor();
  }

  public get webUrl(): string {
    return getSafeWebServerRelativeUrl(this._pageContext);
  }

  public fetchWithDigest(request: Request): Promise<Response> {
    return request.text().then<Response>((requestBody: string) => {
      const contentType: string = request.headers.get('Content-Type');
      /* Content-Type needs to be removed from the headers because it is passed
      as a stand-alone parameter and set accordingly in getData */
      request.headers.delete('Content-Type');

      return this._odspPromiseToEs6Promise(
        this.getData<string>(
          () => { return request.url; },
          (responseText: string) => { return responseText; },
          'DelegationTokenDataSource',
          () => { return requestBody; },
          'POST',
          this._getHeadersDictionary(request),
          contentType
        ).then<Response>((responseBody: string) => {
          return new Response(responseBody, {
            status: 200
          });
        }, (error: any) => {
          return new Response(JSON.stringify(error), {
            status: error.status
          });
        }));
    });
  }

  public getToken(resource: string): OdspPromise<string> {
    return this._es6PromiseToOdspPromise<string>(
      this._oAuthUtility.getOAuthToken(resource).then<string>((tokenInfo: IOAuthToken) => {
      return tokenInfo.token;
    }));
  }

  private _getHeadersDictionary(request: Request): { [key: string]: string } {
    const requestHeaders: { [key: string]: string } = {};
    request.headers.forEach((value: string, index: number) => {
      requestHeaders[index] = value;
    });
    return requestHeaders;
  }

  private _odspPromiseToEs6Promise<T>(promise: OdspPromise<T>): Promise<T> {
    return new Promise<T>((resolve: (response: T) => void, reject: (error?: any) => void) => {
      promise.then((value: T) => { resolve(value); },
        (error?: any) => { reject(error); });
    });
  }

  private _es6PromiseToOdspPromise<T>(promise: Promise<T>): OdspPromise<T> {
    return new OdspPromise<T>((resolve: (response: T) => void, reject: (error?: any) => void) => {
      promise.then((value: T) => { resolve(value); },
        (error?: any) => { reject(error); });
    });
  }
}
