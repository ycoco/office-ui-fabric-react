import './ActivityIndicator.scss';
import * as React from 'react';
import { Spinner, SpinnerType } from 'office-ui-fabric-react/lib/Spinner';

export interface IActivityIndicatorProps {
    message: string;
}

export class ActivityIndicator extends React.Component<IActivityIndicatorProps, null> {
    public render(): React.ReactElement<{}> {
        return (
            <div className='od-ActivityIndicator' aria-live='assertive'>
                <div>
                    <Spinner type={ SpinnerType.large } />
                </div>
                <span role='alert'>{ this.props.message }</span>
            </div>
        );
    }
}