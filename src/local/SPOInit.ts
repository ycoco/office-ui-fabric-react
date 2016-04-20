// OneDrive:IgnoreCodeCoverage
import Init from './Init';

export default function init(workloadName: string) {
    "use strict";
    Init({
        workload: workloadName,
        tokens: {
            preProduction: "a220feed3a784dadaffa8496d2ef0fd7-4de4a2a0-a8e2-4ce3-8921-621c5304a5f7-7565",
            msit: "",
            prod: ""
        }
    });
}