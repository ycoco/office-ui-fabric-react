declare module "aria" {
    export enum CallbackEventType {
        SENT,
        SEND_FAILED
    }

    /**
     * LogManager class allows initialization of the telemetry library.
     */
    export class LogManager {
        static initialize(tenantToken: string);

        static initializeWithConfiguration(tenantToken: string, configuration: LogConfiguration);

        static flush(func: (responseCode: number,
            tenantToken: string,
            events: datamodels.Record[]) => any);

        /**
        * When events have been sent or sent failed, you can get the notification
        * if you registered the listener. If the listener has been added already,
        * the function will do nothing.
        * 
        * @param func (callbackType: microsoft.applications.telemetry._sender.CallbackEventType, responseCode: number, tenantToken: string,
        *  events: microsoft.applications.telemetry.datamodels.Record[]) => any
        */
        static addCallbackListener(func: (callbackType: CallbackEventType,
            responseCode: number,
            tenantToken: string,
            events: datamodels.Record[]) => any);

        static isInitialized(): boolean;

        static getDefaultToken(): string;
    }

    /**
     * Contains methods to log custom events.
     */
    export class Logger {
        constructor(tenantToken?: string);

        /**
        * Log a custom event, including custom key-value properties.
        */
        logEvent(eventProperties: EventProperties);

        setContext(key: string, value: Object, pii?: datamodels.PIIKind);
    }

    /**
     * Configuration for the ARIA logger.
     */
    export class LogConfiguration {
        /**
         *  Set the collector url.
         */
        collectorUrl: string;
    }


    /**
     * eventProperties class allows adding custom key value pairs, including PII data to events.
     */
    export class EventProperties {
        /**
         * Specify a name for this event. This is required if you send any custom key, value pairs.
         */
        name: string;

        /**
         * Override the timestamp on the event being sent, which is set to the current time by default. 
         */
        timestamp: number;

        /**
         * Property bag that can be used to add custom extensions to the logged event.
         */
        properties: Property[];

        /**
         * Specify a type for this event. The type provided will be prefixed with the string
         * "Custom.".
         */
        eventType: string;

        /**
         * Add a named property and optionally tag it as PII.
         */
        setProperty(key: string, value: Object, pii?: datamodels.PIIKind);
    }

    export class Property {
        key: string;

        value: Object;

        pii: datamodels.PIIKind;
    }

    export enum TelemetryError {
        INVALID_TENANT_TOKEN = 1,
        MISSING_EVENT_PROPERTIES_NAME = 2,
        INVALID_PROPERTY_NAME = 3,
        INVALID_COLLECTOR_URL = 4
    }

    /**
     * Helper class to throw exceptions. 
     */
    export class Exception {
        constructor(errorCode: TelemetryError);

        ErrorCode(): TelemetryError;

        toString(): string;
    }

    export module datamodels {
        export class utils {
            static GetGuid(): string;

            static GetTimeStamp(): any;

            static GetTimeStampWithValue(timestamp: number): any;
        }

        export enum RecordType {
            NotSet = 0,
            Event = 1,
            // Deprecated, please use PerformanceCounterAzure and PerformanceCounterGfs instead
            PerformanceCounter = 2,
            Anomaly = 3,
            Prediction = 4,
            TraceLog = 5,
            EventSourceLog = 6,
            HttpLog = 7,
            PerformanceCounterAzure = 8,
            PerformanceCounterGfs = 9
        }

        export enum PIIScrubber {
            NotSet = 0,
            O365 = 1,
            SkypeBI = 2,
            SkypeData = 3
        }

        export enum PIIKind {
            NotSet = 0,
            DistinguishedName = 1,
            GenericData = 2,
            IPV4Address = 3,
            IPv6Address = 4,
            MailSubject = 5,
            PhoneNumber = 6,
            QueryString = 7,
            SipAddress = 8,
            SmtpAddress = 9,
            Identity = 10,
            Uri = 11,
            Fqdn = 12,

            // Supports scrubbing of the last octet in a IPV4 address. E.g. 10.121.227.147 becomes 10.121.227.*
            IPV4AddressLegacy = 13
        }

        export class PII {
            // 1: optional PIIScrubber ScrubType
            ScrubType: datamodels.PIIScrubber;

            // 2: optional PIIKind Kind
            Kind: datamodels.PIIKind;

            // 3: optional string RawContent
            RawContent: string;

            Write(writer: any): void;

            WriteImpl(writer: any, isBase: boolean): void;

            Read(reader: any): void;

            ReadImpl(reader: any, isBase: boolean): void;

        }

        export class Record {
            // 1: optional string Id
            Id: string;

            // 3: optional int64 Timestamp
            Timestamp: any;

            // 5: optional string Type
            Type: string;

            // 6: optional string EventType
            EventType: string;

            // 13: optional map<string, string> Extension
            Extension: any;

            // 24: optional RecordType RecordType
            RecordType: datamodels.RecordType;

            // 30: optional map<string, PII> PIIExtensions
            PIIExtensions: any;

            AddOrReplacePII(key: string, piiValue: string, piiKind: datamodels.PIIKind): void;

            Write(writer: any): void;

            WriteImpl(writer: any, isBase: boolean): void;

            Read(reader: any): void;

            ReadImpl(reader: any, isBase: boolean): void;
        }

        export class DataPackage {

            // 2: optional string Source
            Source: string;

            // 5: optional string DataPackageId
            DataPackageId: string;

            // 6: optional int64 Timestamp
            Timestamp: any;

            // 8: optional vector<clienttelemetry.data.v1.Record> Records
            Records: datamodels.Record[];

            Write(writer: any): void;

            WriteImpl(writer: any, isBase: boolean): void;

            Read(reader: any): void;

            ReadImpl(reader: any, isBase: boolean): void;
        }

        export class ClientToCollectorRequest {
            // 1: optional vector<clienttelemetry.data.v1.DataPackage> DataPackages
            DataPackages: datamodels.DataPackage[];

            // 2: optional int32 RequestRetryCount
            RequestRetryCount: number;

            Write(writer: any): void;

            WriteImpl(writer: any, isBase: boolean): void;

            Read(reader: any): void;

            ReadImpl(reader: any, isBase: boolean): void;
        }
    }
}
