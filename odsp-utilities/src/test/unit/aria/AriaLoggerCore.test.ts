import AriaLoggerCore, { IContextData } from '../../../odsp-utilities/aria/AriaLoggerCore';
import { AccountType, ClonedEventType } from '../../../odsp-utilities/logging/EventBase';
import Api, { IApiStartSchema, IApiEndSchema } from '../../../odsp-utilities/logging/events/Api.event';
import CaughtError, { ICaughtErrorSingleSchema } from '../../../odsp-utilities/logging/events/CaughtError.event';
import { ResultTypeEnum } from '../../../odsp-utilities/logging/events/ResultTypeEnum';
import Features from '../../../odsp-utilities/features/Features';
import { expect } from 'chai';

let logger: MockAriaLogger;

class MockContextMap {
    public values: { [key: string]: any } = {};

    public Add(key: string, value: any): void {
        this.values[key] = value;
    }
}

class MockSemanticContext {
    public contextMap = new MockContextMap();

    public setAppVersion(value: string) {
        // Do Nothing
    }
    public setUserLanguage(value: string) {
        // Do Nothing
    }
    public setUserId(value: string) {
        // Do Nothing
    }
    public setDeviceOsName(value: string) {
        // Do Nothing
    }
    public setDeviceOsVersion(value: string) {
        // Do Nothing
    }
}

class MockAriaLogger {
    public context: { [key: string]: any } = {};
    public semanticContext: MockSemanticContext = new MockSemanticContext();

    constructor() {
        logger = this;
    }

    public logEvent(properties: any): void {
        // Do Nothing
    }
    public getSemanticContext(): any {
        return this.semanticContext;
    }
    public setContext(key: string, value: any): void {
        this.context[key] = value;
    }
}

const expectedTenantToken = "someTenantToken";
let tenantToken: string;

class MockLogManager {
    public static initialize(token: string): void {
        tenantToken = token;
    }
    public static addCallbackListener(listener: (isSuccess: number, statusCode: number, tenantToken: string, events: any[]) => void): void {
        // Do nothing
    }
    public static flush(): void {
        // Do nothing
    }
}

class MockEventProperties {
    public name: string;
    public values: { [key: string]: any } = {};

    public setProperty(key: string, value: any): void {
        this.values[key] = value;
    }
}

const ariaTelemetry = {
    Logger: MockAriaLogger,
    EventProperties: MockEventProperties,
    LogManager: MockLogManager
};

const testContext: IContextData = {
    isAuthenticated: true,
    accountType: AccountType.Consumer,
    market: 'testMarket',
    userId: 'testUserId',
    version: 'testVersion',
    manifest: 'testManifest',
    session: 'testSession',
    environment: 'testEnvironment',
    workload: 'testWorkload',
    siteSubscriptionId: 'testSiteSubscriptionId',
    farmLabel: 'testFarmLabel'
};

describe("AriaLoggerCore", () => {
    let eventProperties: MockEventProperties;
    let isFeatureEnabled: typeof Features.isFeatureEnabled;

    before(() => {
        AriaLoggerCore.Init(expectedTenantToken, testContext, ariaTelemetry as any);
        logger.logEvent = (properties: MockEventProperties) => {
            eventProperties = properties;
        };
        isFeatureEnabled = Features.isFeatureEnabled;
        Features.isFeatureEnabled = function () { return true; };
    });

    after(() => {
        Features.isFeatureEnabled = isFeatureEnabled;
    });

    it("sets context data correctly", () => {
        const contextData = logger.context;
        expect(contextData['AccountType']).to.equal(AccountType[testContext.accountType]);
        expect(contextData['Environment']).to.equal(testContext.environment);
        expect(contextData['Workload']).to.equal(testContext.workload);
        expect(contextData['IsAuthenticated']).to.equal(testContext.isAuthenticated ? 1 : 0);
        expect(contextData['BrowserName']).to.exist;
        expect(contextData['BrowserMajVer']).to.exist;
        expect(contextData['BrowserMinVer']).to.exist;
        expect(contextData['BrowserUserAgent']).to.exist;
        expect(contextData['BrowserIsMobile']).to.exist;
        expect(contextData['SiteSubscriptionId']).to.equal(testContext.siteSubscriptionId);
        expect(contextData['FarmLabel']).to.equal(testContext.farmLabel);

        expect(tenantToken).to.equal(expectedTenantToken);
    });

    it("logs an Api Event correctly", () => {
        const startSchema: IApiStartSchema = {
            url: 'testUrl',
            name: 'testName',
            extraData: {
                foo: 'testValue'
            }
        };

        const event = new Api(startSchema);
        let values = eventProperties.values;
        expect(values['CorrelationVector']).to.exist;
        expect(values['ValidationErrors']).to.exist;
        expect(values['WebLog_FullName']).to.equal("Api,Qos,");
        expect(values['WebLog_EventType']).to.equal(ClonedEventType[ClonedEventType.Start]);
        expect(values['WebLog_Type_Qos']).to.equal(1);
        expect(eventProperties.name).to.equal('ev_Qos');

        expect(values['Name']).to.equal(startSchema.name);
        expect(values['Qos_extraData_foo']).to.equal(startSchema.extraData['foo']);
        expect(values['Api_url']).to.equal(startSchema.url);

        const endSchema: IApiEndSchema = {
            resultCode: 'testResultCode',
            resultType: ResultTypeEnum.Success,
            extraData: {
                bar: 'testEndValue'
            }
        };
        event.end(endSchema);
        values = eventProperties.values;
        expect(values['CorrelationVector']).to.exist;
        expect(values['ValidationErrors']).to.exist;
        expect(values['WebLog_FullName']).to.equal("Api,Qos,");
        expect(values['WebLog_EventType']).to.equal(ClonedEventType[ClonedEventType.End]);
        expect(values['WebLog_Type_Qos']).to.equal(1);
        expect(eventProperties.name).to.equal('ev_Qos');

        expect(values['Name']).to.equal(startSchema.name);
        expect(values['Qos_extraData_bar']).to.equal(endSchema.extraData['bar']);
        expect(values['Api_url']).to.equal(startSchema.url);
        expect(values['ResultCode']).to.equal(endSchema.resultCode);
        expect(values['ResultType']).to.equal(ResultTypeEnum[endSchema.resultType]);
        expect(values['Duration']).to.exist;
    });

    it("logs a CaughtError Event correctly", () => {
        const schema: ICaughtErrorSingleSchema = {
            message: 'testMessage',
            stack: 'testStack',
            extraData: {
                foo: 'testValue'
            }
        };

        CaughtError.logData(schema);
        const values = eventProperties.values;
        expect(values['CorrelationVector']).to.exist;
        expect(values['ValidationErrors']).to.exist;
        expect(values['WebLog_FullName']).to.equal("CaughtError,Trace,");
        expect(values['WebLog_EventType']).to.equal(ClonedEventType[ClonedEventType.Single]);
        expect(values['WebLog_Type_CaughtError']).to.equal(1);
        expect(eventProperties.name).to.equal('ev_Trace');

        expect(values['Trace_message']).to.equal(schema.message);
        expect(values['CaughtError_stack']).to.equal(schema.stack);
        expect(values['CaughtError_extraData_foo']).to.equal(schema.extraData['foo']);
    });
});