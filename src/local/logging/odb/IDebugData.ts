// OneDrive:IgnoreCodeCoverage

import DebugPriorityLevel from "./DebugPriorityLevel";

interface IDebugData {
    Tag: string;
    Level: DebugPriorityLevel;
    Message: string;
    Misc: string;
    ClientTime: number;
}

export default IDebugData;