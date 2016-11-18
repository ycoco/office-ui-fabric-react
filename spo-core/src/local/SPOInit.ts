// OneDrive:IgnoreCodeCoverage
import Init from './Init';

export default function init(workloadName: string) {
    "use strict";
    Init({
        workload: workloadName,
        tokens: {
            preProduction: "a220feed3a784dadaffa8496d2ef0fd7-4de4a2a0-a8e2-4ce3-8921-621c5304a5f7-7565",
            msit: "3620e5572cf04917bf4993285ebe4e15-d5c60963-35a1-45e2-9430-928e0656b9cd-6718",
            prod: "a9e9a63d9df4411ebbf89297947d7666-b5f0498b-a808-4b74-bb7b-2b33f7971660-7417"
        }
    });
}