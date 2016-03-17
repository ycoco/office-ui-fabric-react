// OneDrive:IgnoreCodeCoverage

import 'odsp-utilities/logging/ManagerExtended';
import "odsp-utilities/logging/UnhandledErrorHandler";
import "odsp-utilities/logging/RequireJSErrorHandler";
import "odsp-shared/utilities/logging/KnockoutErrorHandler";
import "odsp-utilities/logging/PromiseErrorHandler";
import "odsp-utilities/logging/ErrorUI";
import { Manager } from 'odsp-utilities/logging/Manager';
import PageInit from 'odsp-utilities/logging/PageInit';
import AriaLogger from 'odsp-utilities/aria/AriaLogger';
import PageConfig from './PageConfig';

let MAX_STRING_LENGTH = 2048; // 2KB
const CLEAN_STRING_REGEX = /authkey=[!a-zA-Z0-9]*/ig;

if (DEBUG) {
    MAX_STRING_LENGTH = 10024; // 10KB
}

// Register logging clean string as early as possible
Manager.cleanString = (str: string) => {
    if (str) {
        // Make sure its a string
        str = (str + '');

        // Truncate the string if its too long
        if (str.length > MAX_STRING_LENGTH) {
            str = str.substring(0, MAX_STRING_LENGTH);
        }

        str = str.replace(CLEAN_STRING_REGEX, '');
    }

    return str;
};

PageInit.init();

// Initialize Aria
let preProductionToken = "3d697adc11914fa4991f1c3870255788-1afd84c4-bb01-494a-bfb0-0216ab2771c6-6977";
let productionToken = "a23e4f242c9c4097a968f28c62633e19-62d0d830-5afd-4df3-8e40-351c8711cf5c-7157";
let isProduction = (window["Flight"].version !== 'dev' &&
    !!window["Flight"].UserGroup &&
    (window["Flight"].UserGroup.toLowerCase() === 'df' ||
        window["Flight"].UserGroup.toLowerCase() === 'prod'));
AriaLogger.Init(isProduction ? productionToken : preProductionToken,
    {
        isAuthenticated: PageConfig.isAuthenticated(),
        market: PageConfig.getMarket(),
        session: window["Flight"].session,
        version: window["Flight"].version,
        manifest: window["Flight"].manifest,
        userId: PageConfig.isAuthenticated() ? window["Flight"].cid : window["Flight"].xid,
        userMsaId: window["$Config"] && window["$Config"].upsellUserId,
        userANID: PageConfig.getAnid(),
        environment: `ODC_${window["Flight"].UserGroup}`,
        workload: 'ODC'
    });

export default function init() {
    "use strict";
}