import AriaLoggerCore, { IContextData } from '../../../odsp-utilities/aria/AriaLoggerCore';
import { AccountType, ClonedEventType } from '../../../odsp-utilities/logging/EventBase';
import Api, { IApiStartSchema, IApiEndSchema } from '../../../odsp-utilities/logging/events/Api.event';
import CaughtError, { ICaughtErrorSingleSchema } from '../../../odsp-utilities/logging/events/CaughtError.event';
import Engagement, { IEngagementSingleSchema } from '../../../odsp-utilities/logging/events/Engagement.event';
import PlatformDetection from '../../../odsp-utilities/browser/PlatformDetection';
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

const platformDetection = new PlatformDetection();

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

const expectedContext = {
    AccountType: AccountType[testContext.accountType],
    Environment: testContext.environment,
    Workload: testContext.workload,
    IsAuthenticated: testContext.isAuthenticated ? 1 : 0,
    FarmLabel: testContext.farmLabel,
    SiteSubscriptionId: testContext.siteSubscriptionId,

    BrowserName: platformDetection.browserName,
    BrowserMajVer: platformDetection.browserMajor,
    BrowserMinVer: platformDetection.browserMinor,
    BrowserUserAgent: platformDetection.userAgent,
    BrowserIsMobile: platformDetection.isMobile
};

function validateObject(expected: { [key: string]: any }, actual: { [key: string]: any }): void {
    const expectedKeys = Object.keys(expected);
    const actualKeys = Object.keys(actual);
    for (const key of actualKeys) {
        expect(key in expected, `unexpected property ${key} with value ${actual[key]}`).to.equal(true);
    }
    for (const key of expectedKeys) {
        expect(key in actual, `missing required property ${key}`).to.equal(true);
    }
    for (const key of actualKeys) {
        if (expected[key] !== undefined) {
            expect(actual[key], `mismatch for property ${key}`).to.equal(expected[key]);
        } else {
            expect(actual[key], `expecting value for property ${key}`).to.exist;
        }
    }
}

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
        validateObject(expectedContext, logger.context);

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

        const expectedApiStartData = {
            CorrelationVector: undefined, // Verify existence only
            ValidationErrors: undefined, // Verify existence only
            WebLog_FullName: "Api,Qos,",
            WebLog_EventType: ClonedEventType[ClonedEventType.Start],
            WebLog_Type_Api: 1,
            WebLog_Type_Qos: 1,
            Name: startSchema.name,
            Qos_extraData_foo: startSchema.extraData['foo'],
            Api_url: startSchema.url
        };

        const event = new Api(startSchema);
        let values = eventProperties.values;
        expect(eventProperties.name).to.equal('ev_Qos');
        validateObject(expectedApiStartData, values);

        const endSchema: IApiEndSchema = {
            resultCode: 'testResultCode',
            resultType: ResultTypeEnum.Success,
            extraData: {
                bar: 'testEndValue'
            }
        };
        event.end(endSchema);
        values = eventProperties.values;
        expect(eventProperties.name).to.equal('ev_Qos');

        const expectedApiEndData = {
            CorrelationVector: undefined, // Verify existence only
            ValidationErrors: undefined, // Verify existence only
            WebLog_FullName: "Api,Qos,",
            WebLog_EventType: ClonedEventType[ClonedEventType.End],
            WebLog_Type_Api: 1,
            WebLog_Type_Qos: 1,
            Name: startSchema.name,
            Qos_extraData_bar: endSchema.extraData['bar'],
            Api_url: startSchema.url,
            ResultCode: endSchema.resultCode,
            ResultType: ResultTypeEnum[endSchema.resultType],
            Duration: undefined // Verify existence only
        };
        validateObject(expectedApiEndData, values);
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
        expect(eventProperties.name).to.equal('ev_Trace');

        const expectedCaughtErrorData = {
            CorrelationVector: undefined, // Verify existence only
            ValidationErrors: undefined, // Verify existence only
            WebLog_FullName: "CaughtError,Trace,",
            WebLog_EventType: ClonedEventType[ClonedEventType.Single],
            WebLog_Type_CaughtError: 1,
            WebLog_Type_Trace: 1,
            Trace_message: schema.message,
            CaughtError_stack: schema.stack,
            CaughtError_extraData_foo: schema.extraData['foo']
        };
        validateObject(expectedCaughtErrorData, values);
    });

    it("logs an Engagement Event correctly", () => {
        const schema: IEngagementSingleSchema = {
            name: 'testEvent',
            isIntentional: true,
            scenario: 'testScenario',
            location: 'testLocation',
            usageType: 'testUsageType',
            currentPage: 'testPage',
            previousPage: 'previousTestPage',
            extraData: {
                foo: 'testValue'
            }
        };

        Engagement.logData(schema);
        const values = eventProperties.values;
        expect(eventProperties.name).to.equal('ev_Engagement');

        const expectedCaughtErrorData = {
            CorrelationVector: undefined, // Verify existence only
            ValidationErrors: undefined, // Verify existence only
            WebLog_FullName: "Engagement,",
            WebLog_EventType: ClonedEventType[ClonedEventType.Single],
            WebLog_Type_Engagement: 1,
            Name: schema.name,
            IsIntentional: schema.isIntentional,
            Scenario: schema.scenario,
            Location: schema.location,
            UsageType: schema.usageType,
            CurrentPage: schema.currentPage,
            PreviousPage: schema.previousPage,
            Engagement_extraData_foo: schema.extraData['foo']
        };
        validateObject(expectedCaughtErrorData, values);
    });
});