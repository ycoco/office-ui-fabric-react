// OneDrive:IgnoreCodeCoverage

import IUserEngagementData = require("./IUserEngagementData");
import IDebugData = require("./IDebugData");
import IRUMOneData = require("./IRUMOneData");

interface ILogData {
    userEngagementData?: IUserEngagementData;
    debugData?: IDebugData;
    rumOneData?: IRUMOneData;
}

export = ILogData;