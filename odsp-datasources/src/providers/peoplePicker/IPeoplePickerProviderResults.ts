import { IPerson } from '../../dataSources/peoplePicker/IPerson';
import Promise from '@ms/odsp-utilities/lib/async/Promise';

export interface IPeoplePickerProviderResults {
    cached: IPerson[];
    promise: Promise<IPerson[]>;
}