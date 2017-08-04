
import { IPagedResponse } from '../base/Base';
import { IItem } from '../item/Item';

export interface ISearchResponse extends IPagedResponse {
    value: IItem[];
    '@search.approximateCount': number;
}
