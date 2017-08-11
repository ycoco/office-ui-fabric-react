// OneDrive:IgnoreCodeCoverage

import * as React from 'react';
import { ActivityItem } from 'office-ui-fabric-react/lib/components/ActivityItem/ActivityItem';
import IItemActivity from './IItemActivity';
import { Icon } from 'office-ui-fabric-react/lib/Icon';

export interface IItemActivityProps extends React.Props<any> {
    activity: IItemActivity;
}

export default class ItemActivity extends React.Component<IItemActivityProps, {}> {
    constructor(props: IItemActivityProps, context?: any) {
        super(props, context);

        this._onRenderActivityDescription = this._onRenderActivityDescription.bind(this);
        this._onRenderIcon = this._onRenderIcon.bind(this);
    }

    public render(): JSX.Element {
        const {
            activity
        } = this.props;

        const date = activity.getDate().toDateString();

        return (
            <ActivityItem
                onRenderActivityDescription={ this._onRenderActivityDescription }
                onRenderIcon={ this._onRenderIcon }
                timeStamp={ date.toString() }
            />
        );
    }

    private _onRenderIcon(): JSX.Element | null {
        const iconName = this.props.activity.getIconName();

        return (
            <Icon
                iconName={ iconName }
            />
        );
    }

    private _onRenderActivityDescription(): JSX.Element | null {
        return (
            <div>
                {
                    this.props.activity.getTitle()
                }
            </div>
        );
    }
}
