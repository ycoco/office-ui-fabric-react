import DataStore from '@ms/odsp-utilities/lib/models/store/BaseDataStore';
import { ISPListItem } from '../../SPListItemProcessor';
import { ISPItemSet } from './ISPItemSet';

const ITEMSET_KEY_PREFIX: string = 'result=';
const ITEM_KEY_PREFIX: string = 'item=';

export class SPItemStore extends DataStore {
    private _itemSetsKeys: string[];

    constructor() {
        super('ItemsStore');
        this._itemSetsKeys = [];

        // TODO: remove eventually when the debug window allows exploring the contents of the store
        /* tslint:disable:no-string-literal */
        window['odstore'] = this;
        /* tslint:enable:no-string-literal */
    }

    public setItem(itemKey: string, item: ISPListItem): void {
        const itemStoreKey: string = ITEM_KEY_PREFIX + itemKey;
        this.setValue(itemStoreKey, item);
    }

    public getItem(itemKey: string): ISPListItem {
        return this.getValue<ISPListItem>(ITEM_KEY_PREFIX + itemKey);
    }

    public setItemSet(itemSetKey: string, itemSet: ISPItemSet): void {
        const itemSetStoreKey: string = ITEMSET_KEY_PREFIX + itemSetKey;
        this.setValue(itemSetStoreKey, itemSet);
        if (this._itemSetsKeys.indexOf(itemSetStoreKey) === -1) {
            this._itemSetsKeys.push(itemSetStoreKey);
        }
    }

    public getItemSet(itemSetKey: string): ISPItemSet {
        return this.getValue<ISPItemSet>(ITEMSET_KEY_PREFIX + itemSetKey);
    }
}

export default SPItemStore;