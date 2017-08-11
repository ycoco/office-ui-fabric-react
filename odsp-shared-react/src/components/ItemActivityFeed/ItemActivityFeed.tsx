// OneDrive:IgnoreCodeCoverage

import * as React from 'react';
import { ResourceScope } from '@ms/odsp-utilities/lib/resources/Resources';
import IItemActivities from '@ms/odsp-graph/lib/services/itemActivities/IItemActivities';
import IItemActivityFeedStore, { IListener } from './IItemActivityFeedStore';
import ItemActivityList from './ItemActivityList/ItemActivityList';
import EditItemActivity from './ItemActivity/EditItemActivity';

export interface IItemActivityFeedProps {
    itemUrl: string;
    resources?: ResourceScope;
}

export interface IItemActivityFeedState {
    activities: IItemActivities;
}

export interface IItemActivityFeedContext {
    itemActivityFeedStore: IItemActivityFeedStore;
}

export default class ItemActivityFeed extends React.Component<IItemActivityFeedProps, IItemActivityFeedState> {
    private readonly _resources: ResourceScope;
    private readonly _store: IItemActivityFeedStore;
    private _storeListener: IListener;

    public static contextTypes = {
        itemActivityFeedStore: React.PropTypes.object.isRequired,
    };

    constructor(props: IItemActivityFeedProps, context: IItemActivityFeedContext) {
        super(props, context);

        this._resources = props.resources;
        this._store = context.itemActivityFeedStore;

        this.state = {
            activities: this._store.getItemActivities({ itemUrl: this.props.itemUrl })
        };
    }

    public componentWillReceiveProps(nextProps: IItemActivityFeedProps) {
        if (nextProps.itemUrl !== this.props.itemUrl) {
            this.setState({
                activities: this._store.getItemActivities({ itemUrl: nextProps.itemUrl })
            });
        }
    }

    public componentDidMount() {
        this._storeListener = this._store.addListener(() => {
            this.setState({
                activities: this._store.getItemActivities({ itemUrl: this.props.itemUrl })
            });
        }, { itemUrl: this.props.itemUrl });

        if (!this.state.activities) {
            this._store.fetchItemActivities({ itemUrl: this.props.itemUrl });
        }
    }

    public componentDidUpdate() {
        if (!this.state.activities) {
            this._store.fetchItemActivities({ itemUrl: this.props.itemUrl });
        }
    }

    public componentWillUnmount() {
        this._store.removeListener(this._storeListener);
    }

    public render(): React.ReactElement<{}> {
        const {
            activities
        } = this.state;

        const viewableActivities = this._getViewableItemActivities(activities);

        return (
            <ItemActivityList
                activities={ viewableActivities }
            />
        );
    }

    /**
     * Converts the item activity models to viewable activities.
     */
    private _getViewableItemActivities(activities: IItemActivities) {
        const viewableActivities = [];

        if (activities) {
            for (let activity of activities.activities) {
                viewableActivities.push(new EditItemActivity(activity));
            }
        }

        return viewableActivities;
    }
}
