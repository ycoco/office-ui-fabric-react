// OneDrive:IgnoreCodeCoverage

import IItemActivities from './IItemActivities';

export interface IGetItemActivitiesOptions {
    itemUrl: string;
}

interface IItemActivitiesService {
    getItemActivities(options: IGetItemActivitiesOptions): Promise<IItemActivities>;
}

export default IItemActivitiesService;