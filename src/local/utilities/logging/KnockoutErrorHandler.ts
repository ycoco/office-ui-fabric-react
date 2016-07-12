// OneDrive:IgnoreCodeCoverage

import ErrorHelper from '@ms/odsp-utilities/lib/logging/ErrorHelper';
import ko = require('knockout');

ko["onError"] = function (err: any) {
    ErrorHelper.log(err);
};