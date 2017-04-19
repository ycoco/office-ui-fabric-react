// OneDrive:IgnoreCodeCoverage

import "@ms/odsp-utilities/lib/logging/ManagerExtended";
import "@ms/odsp-utilities/lib/logging/UnhandledErrorHandler";
import "@ms/odsp-utilities/lib/logging/RequireJSErrorHandler";
import "@ms/odsp-shared/lib/utilities/logging/KnockoutErrorHandler";
import "@ms/odsp-utilities/lib/logging/PromiseErrorHandler";
import "@ms/odsp-utilities/lib/logging/ErrorUI";
import PageInit from '@ms/odsp-utilities/lib/logging/PageInit';
import AriaLogger from '@ms/odsp-utilities/lib/aria/AriaLogger';
import Guid from '@ms/odsp-utilities/lib/guid/Guid';
import { AccountType as AccountTypeEnum } from '@ms/odsp-utilities/lib/logging/EventBase';

// Fire Page Init
PageInit.init();

export interface ITokens {
    ppe: string;
    prod: string;
}

export interface IOptions {
    tokens: ITokens;
    workload: string;
}

export default function init(options: IOptions) {
    "use strict";
    // Initialize Aria
    let token = '';
    let env: string = window["_spPageContextInfo"].env || "devbox";

    let version = '';
    let manifest = '';
    let _spModuleLink = window["_spModuleLink"];

    if (_spModuleLink) {
        version = _spModuleLink.buildNumber;
        manifest = _spModuleLink.manifestName;

        if (!_spModuleLink.usingRedirectCookie) {
            switch (env.toLowerCase()) {
                case "edog":
                    token = options.tokens.ppe;
                    break;
                case "prodbubble":
                    token = options.tokens.ppe;
                    break;
                case "prod":
                    token = options.tokens.prod;
                    break;
                case "dprod":
                    token = options.tokens.prod;
                    break;
                default:
                    token = options.tokens.ppe;
                    break;
            }
        } else {
            token = options.tokens.ppe;
        }
    }

    // Only send the logging if the env is configured
    if (token) {
        AriaLogger.Init(token,
            {
                isAuthenticated: !!window["_spPageContextInfo"].userLoginName,
                market: window["_spPageContextInfo"].currentUICultureName,
                session: Guid.generate(),
                version: version,
                manifest: manifest,
                userId: window["_spPageContextInfo"].systemUserKey,
                accountType: !!window["_spPageContextInfo"].userLoginName ? AccountTypeEnum.Business : AccountTypeEnum.BusinessAnonymous,
                siteSubscriptionId: window["_spPageContextInfo"].siteSubscriptionId,
                farmLabel: window["_spPageContextInfo"].farmLabel,
                environment: env,
                workload: options.workload
            });
    }
}