// OneDrive:IgnoreCodeCoverage

import { IPerson } from '../../dataSources/peoplePicker/IPerson';
import DataStore from '@ms/odsp-utilities/lib/models/store/BaseDataStore';
import DataStoreCachingType from '@ms/odsp-utilities/lib/models/store/DataStoreCachingType';
import { EntityType }from '../../dataSources/peoplePicker/IPerson';

interface IBuffer {
    dataArray: Array<IPerson>;
    index: number;
    version: number;
}

export class PeopleStore extends DataStore {

    private static _Key: string = 'ClientPeoplePicker';
    private static _StorageKey: string = 'MRU';  // Together with 'dataStoreKey' (in 'super' call) will come to 'ClientPeoplePickerMRU'
    private static _DataStoreCachingType: DataStoreCachingType = DataStoreCachingType.local;
    private _MaxItems: number;
    private _Version: number;
    private _buffer: IBuffer;
    private _data: any;

    public static clear() {
        let datastore: DataStore = new DataStore(PeopleStore._Key, PeopleStore._DataStoreCachingType);
        datastore.remove(PeopleStore._StorageKey);
    }

    constructor() {
        super(PeopleStore._Key, PeopleStore._DataStoreCachingType);

        // Initiliaze constants
        this._MaxItems = 200;
        this._Version = 5;

        // Initiliaze buffer object from DOM local storage if it exists
        this._buffer = <IBuffer>this.getValue(PeopleStore._StorageKey);

        // If there's no buffer object in DOM local storage or if the buffer is from a previous schema version, initialize an empty buffer object
        if (!this._buffer || (this._buffer.version !== this._Version)) {
            this.initializeBuffer();
        }

        // Initialize data object for fast and easy lookups
        this._data = {};
        for (let i: number = 0; i < this._buffer.dataArray.length; i++) {
            this._data[this._buffer.dataArray[i].email] = this._buffer.dataArray[i];
        }
    }

    public setItem(item: IPerson): void {
        // Check to see if the data object already has a matching entry for this person
        if (this._data[item.email]) {
            // There is a bug here, that we're punting on for now. There should be some sort of 'ranking' associate with each item. That way if you pick
            // an item that already exists in the cache, it moves up in the ranking in terms of most recently used items. Otherwise, when you are in the
            // situation where we need to trim the results returned because there are too many results, we might not return this item since it was
            // originally *added* to the array previously before other items, but it was *last used* more reently than other items.
            return;
        }

        // Check to see if the buffer array is full with the maximum number of items
        if (this._buffer.dataArray.length === this._MaxItems) {
            // Increment the buffer index and wrap it to the front of the array if it extended beyond MaxItems
            this._buffer.index++;
            if (this._buffer.index >= this._MaxItems) {
                this._buffer.index = 0;
            }

            // Remove oldest person stored in the data object
            let oldestPerson: IPerson = this._buffer.dataArray[this._buffer.index];
            delete this._data[oldestPerson.email];

            // Remove the oldest person stored in the buffer array
            this._buffer.dataArray[this._buffer.index] = item;
        } else {
            // Push person on the buffer array (will take care of wrapping the index the next time an item is added)
            this._buffer.dataArray.push(item);
            this._buffer.index++;
        }

        // Update the data object in both cases with the person's email
        this._data[item.email] = item;

        // Serialize the buffer array and update local storage
        this.setValue(PeopleStore._StorageKey, this._buffer);
    }

    public getItems(query: string, filterExternalUsers?: boolean): Array<IPerson> {
        let results: Array<IPerson> = [];

        for (let i: number = 0; i < this._buffer.dataArray.length; i++) {
            // Start with the newest item in the buffer. Then work our way back so that we are returning the newest items in the cache.
            // Since items are stored from left to right in terms of oldest to newest, we will work our way from right to left.
            // For the case when _bufferindex - i is >= 0, we are just counting down towards zero. For the case where _bufferIndex - i < 0,
            // we are starting at the end of the buffer and counting down towards the location of _bufferIndex.
            let newestIndex: number = (this._buffer.index - i + this._MaxItems) % this._MaxItems;

            // TODO: Better algorithm here. It should match how the suggestions box algorithm in ODC PeoplePicker works today
            if (((this._buffer.dataArray[newestIndex].email && this._buffer.dataArray[newestIndex].email.toLowerCase().indexOf(query.toLowerCase()) >= 0)
                || (this._buffer.dataArray[newestIndex].name && this._buffer.dataArray[newestIndex].name.toLowerCase().indexOf(query.toLowerCase()) >= 0))
                && !(filterExternalUsers && this._buffer.dataArray[newestIndex].entityType === EntityType.externalUser)) {
                results.push(this._buffer.dataArray[newestIndex]);
            }
        }

        return results;
    }

    public containsItem(item: IPerson): boolean {
        return Boolean(this._data[item.email]);
    }

    private initializeBuffer(): void {
        this._buffer = <IBuffer>{};
        this._buffer.dataArray = [];
        this._buffer.index = -1;
        this._buffer.version = this._Version;
    }
}