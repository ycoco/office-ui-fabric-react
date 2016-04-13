// OneDrive:IgnoreCodeCoverage
/// <reference path='../../../knockout/knockout.d.ts' />

import ErrorHelper from 'odsp-utilities/logging/ErrorHelper';
import ko = require('knockout');

ko["onError"] = function (err: any) {
    ErrorHelper.log(err);
};