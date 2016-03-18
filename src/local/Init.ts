// OneDrive:IgnoreCodeCoverage

import 'odsp-utilities/logging/ManagerExtended';
import "odsp-utilities/logging/UnhandledErrorHandler";
import "odsp-utilities/logging/RequireJSErrorHandler";
import "odsp-shared/utilities/logging/KnockoutErrorHandler";
import "odsp-utilities/logging/PromiseErrorHandler";
import "odsp-utilities/logging/ErrorUI";
import PageInit from 'odsp-utilities/logging/PageInit';
import AriaLogger from 'odsp-utilities/aria/AriaLogger';
import Guid from 'odsp-utilities/guid/Guid';

// Fire Page Init
PageInit.init();

export interface ITokens {
    preProduction: string;
    msit: string;
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
    let env: string = window["_spPageContextInfo"].env;

    let version = '';
    let manifest = '';
    let _spModuleLink = window["_spModuleLink"];

    if (_spModuleLink) {
        version = _spModuleLink.buildNumber;
        manifest = _spModuleLink.manifestName;

        if (!_spModuleLink.usingRedirectCookie) {
            switch (env.toLowerCase()) {
                case "edog":
                    token = options.tokens.preProduction;
                    break;
                case "prodbubble":
                    token = options.tokens.msit;
                    break;
                case "prod":
                    token = options.tokens.prod;
                    break;
            }
        } else {
            token = options.tokens.preProduction;
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
                userId: window["_spPageContextInfo"].userLoginName,
                environment: env,
                workload: options.workload
            });
    }
}