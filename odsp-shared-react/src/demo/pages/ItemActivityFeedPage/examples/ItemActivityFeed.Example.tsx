import * as React from 'react';
import ItemActivityFeedStoreExample from './ItemActivityFeedStoreExample';
import ItemActivityFeed from '../../../../components/ItemActivityFeed/ItemActivityFeed';

export class ItemActivityFeedExample extends React.Component<any, {}> {
    public static childContextTypes = {
        itemActivityFeedStore: React.PropTypes.object.isRequired
    }

    public getChildContext() {
        return {
            itemActivityFeedStore: new ItemActivityFeedStoreExample()
        };
    }

    public render() {
        return (
            <div>
                <ItemActivityFeed
                    itemUrl={ 'test' }
                />
            </div>
        );
    }
}