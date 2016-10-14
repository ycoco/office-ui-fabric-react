// OneDrive:IgnoreCodeCoverage

import IUserEngagementData from "./IUserEngagementData";
import IDebugData from "./IDebugData";
import IRUMOneData from "./IRUMOneData";

interface ILogData {
    userEngagementData?: IUserEngagementData;
    debugData?: IDebugData;
    rumOneData?: IRUMOneData;
}

export default ILogData;