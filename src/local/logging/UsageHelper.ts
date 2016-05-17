// OneDrive:IgnoreCodeCoverage

import { Usage } from "./events/Usage.event";
import { UsageType } from "./events/UsageType";

export interface IUsageHelperParams<T1, T2> {
    nameEnum: T1;
    name: number;
    locationEnum: T2;
    location: number;
    usageType: UsageType;
    currentPage: string;
    previousPage: string;
    scenario?: string;
}

export default class UsageHelper {
    public static log<T1, T2>(params: IUsageHelperParams<T1, T2>) {
        let {
            nameEnum,
            name,
            locationEnum,
            location,
            usageType,
            currentPage,
            previousPage,
            scenario
        } = params;
        let nameValue = nameEnum[name];
        let locationValue = locationEnum[location];

        if (!nameValue || !locationValue) {
            // name, location undefined can't log, return;
            if (window['DEBUG']) {
                throw new Error("Invalid nameEnum and / or locationEnum passed");
            }
        }

        Usage.logData({
            name: nameValue,
            scenario: scenario,
            location: locationValue,
            currentPage: currentPage,
            previousPage: previousPage,
            usageType: UsageType[usageType]
        });
    }
}