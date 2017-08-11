// OneDrive:IgnoreCodeCoverage

import * as React from 'react';
import IItemActivity from '../ItemActivity/IItemActivity';
import ItemActivity from '../ItemActivity/ItemActivity';

export interface IItemActivityListProps extends React.Props<ItemActivityList> {
    activities: IItemActivity[];
}

export default class ItemActivityList extends React.Component<IItemActivityListProps, {}> {
    public render(): JSX.Element {
        const {
            activities
        } = this.props;

        activities.map((activity: IItemActivity, index: number) => {
            console.log(activity.getKey());
        });

        return (
            <div>
                {
                    (activities.map((activity: IItemActivity, index: number) => (
                        <ItemActivity
                            key={ activity.getKey() }
                            activity={ activity }
                        />
                    )))
                }
            </div>
        );
    };
}
