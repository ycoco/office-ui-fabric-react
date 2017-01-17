// OneDrive:IgnoreCodeCoverage
import Init from './Init';
import '@ms/odsp-utilities/lib/logging/QOEHelper';

Init({
    workload: 'ODB',
    tokens: {
        preProduction: "5a87118d6a0341fdabc3ce984ad47c1a-ff11203d-d0cf-4c2d-90e7-e78da6479bc4-7118",
        msit: "f74c101dfd474d06a7b40fed2051df7e-edb10b9a-779e-4b75-b0cc-ee0cee0f831b-7189",
        prod: "af7114704a204580909f08c904c5ac6f-6f6f4c13-294c-4a00-8e55-71180ed7d627-7044",
        dprod: "fed591d88f554b84ad97b660f29b1814-f02e2db4-b4d2-4e4f-8595-ef6dc2a3e708-7848"
    }
});

export default function init() {
    "use strict";
}