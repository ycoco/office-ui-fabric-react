// OneDrive:IgnoreCodeCoverage

import DebugPriorityLevel = require("./DebugPriorityLevel");

interface IDebugData {
    Tag: string;
    Level: DebugPriorityLevel;
    Message: string;
    Misc: string;
    ClientTime: number;
}

export = IDebugData;