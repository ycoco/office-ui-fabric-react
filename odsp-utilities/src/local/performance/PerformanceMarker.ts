// OneDrive:IgnoreCodeCoverage
const performance = window.performance;
const HighResolutionTimingSupported: boolean =
    !!performance && typeof performance.mark === 'function' &&
    typeof performance.clearMarks === 'function' &&
    typeof performance.now === 'function';
export { HighResolutionTimingSupported };

export interface IPerfMark {
    name: string;
    startTime: number;
}
export type PerfMark = IPerfMark | PerformanceMark;

export const MARKER_PREFIX = "EUPL.";

let _markCount: number = 0;
let _perfMarks: IPerfMark[] = window['_perfMarks'] = window['_perfMarks'] || []; // used for browsers do not support native performance.mark

export function mark(name: string, limit?: number): void {
    'use strict';
    const markName = name.lastIndexOf(MARKER_PREFIX, 0) === 0 ? name : MARKER_PREFIX + name;
    if (limit === null || limit === undefined || _markCount < limit) {
        if (HighResolutionTimingSupported) {
            performance.mark(markName);
        } else {  // this is for browser does not support native performance.mark
            _perfMarks.push({
                name: markName,
                startTime: Date.now()
            });
        }
        _markCount++;
    }
}

export function getMarkerTime(name: string): number {
    'use strict';
    const markName = name.lastIndexOf(MARKER_PREFIX, 0) === 0 ? name : MARKER_PREFIX + name;
    if (HighResolutionTimingSupported) {
        let mark: Array<PerformanceEntry> = performance.getEntriesByName(markName);
        return mark && mark.length > 0 ? Math.round(mark[0].startTime) : NaN;
    } else {
        const mark = _perfMarks.filter((mark: { name: string, startTime: number }) => mark.name === markName)[0];
        return mark && mark.startTime;
    }
}

export function clearMarks(): void {
    'use strict';
    if (HighResolutionTimingSupported) {
        performance.getEntriesByType("mark").filter(
            (mark: PerformanceMark) => {
                return mark.name.lastIndexOf(MARKER_PREFIX, 0) === 0;
            }).forEach((mark: PerformanceMark) => {
                performance.clearMarks(mark.name);
            });
    } else {
        _perfMarks = [];
    }
}

export function getAllMarks(): PerfMark[] {
    'use strict';
    if (HighResolutionTimingSupported) {
        return performance.getEntriesByType("mark").filter(
            (mark: PerformanceMark) => {
                return mark.name.lastIndexOf(MARKER_PREFIX, 0) === 0;
            });
    } else {
        return _perfMarks;
    }
}