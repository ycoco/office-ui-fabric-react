// OneDrive:IgnoreCodeCoverage
import IItemActivityModel from '@ms/odsp-graph/lib/services/itemActivities/IItemActivity';
import IItemActivity from './IItemActivity';
import * as React from 'react';

export default class EditItemActivity implements IItemActivity {
    private readonly _activity: IItemActivityModel;

    public constructor(activity: IItemActivityModel) {
        this._activity = activity;
    }

    public getKey(): string {
        return this._activity.id;
    }

    public getTitle(): React.ReactNode[] | JSX.Element | string {
        // The following is just for testing purposes
        return [
            <span className={ 'ms-activityItem-nameText' }>{ this._activity.user.email }</span>,
            ' edited ',
            <a className={ 'ms-activityItem-linkText' } onClick={ () => alert('The edited document was clicked') }>{ this._activity.fileName }</a>
        ];
    }

    public getDescription(): React.ReactNode[] | JSX.Element | string {
        return [];
    }

    public getIconName(): string {
        return 'Edit';
    }

    public getDate(): Date {
        return this._activity.time;
    }
}
