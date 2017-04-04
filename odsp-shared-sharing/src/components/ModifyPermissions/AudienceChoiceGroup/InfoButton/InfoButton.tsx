import './InfoButton.scss';
import { autobind } from 'office-ui-fabric-react/lib/Utilities';
import { Callout, DirectionalHint } from 'office-ui-fabric-react/lib/Callout';
import { IShareStrings } from '../../../../interfaces/SharingInterfaces';
import * as React from 'react';

export interface IInfoButtonProps {
    message: string;
}

export interface IInfoButtonState {
    isCalloutVisible: boolean;
}

export class InfoButton extends React.Component<IInfoButtonProps, IInfoButtonState> {
    private _infoButton: HTMLElement;
    private _strings: IShareStrings;

    static contextTypes = {
        strings: React.PropTypes.object.isRequired
    };

    constructor(props: IInfoButtonProps, context: any) {
        super(props);

        this.state = {
            isCalloutVisible: false
        };

        this._strings = context.strings;
    }

    public render() {
        const props = this.props;
        const state = this.state;

        return (
            <div>
                <div
                    className='od-InfoButton-button'
                    onClick={ this._onShowCallout }
                >
                    <i
                        className='od-InfoButton-infoIcon ms-Icon ms-Icon--Info'
                        onMouseOver={ this._onShowCallout }
                        onMouseLeave={ this._onDismissCallout }
                        ref={ this._onInfoButton }
                    ></i>
                </div>
                { state.isCalloutVisible && (
                    <Callout
                        directionalHint={ DirectionalHint.topCenter }
                        gapSpace={ 2 }
                        onDismiss={ this._onDismissCallout }
                        targetElement={ this._infoButton }
                        setInitialFocus={ true }
                    >
                        <div className='od-InfoButton-content'>
                            <span className='od-InfoButton-message'>{ props.message }</span>
                        </div>
                    </Callout>
                ) }
            </div>
        );
    }

    @autobind
    private _onShowCallout() {
        this.setState({
            ...this.state,
            isCalloutVisible: true
        });
    }

    @autobind
    private _onDismissCallout() {
        this.setState({
            ...this.state,
            isCalloutVisible: false
        });
    }

    @autobind
    private _onInfoButton(element: HTMLElement): any {
        this._infoButton = element;
    }
}