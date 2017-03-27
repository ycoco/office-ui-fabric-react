import './InfoButton.scss';
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

        this._onClick = this._onClick.bind(this);
        this._onDismiss = this._onDismiss.bind(this);
        this._onInfoButton = this._onInfoButton.bind(this);
    }

    public render() {
        const props = this.props;
        const state = this.state;

        return (
            <div>
                <button
                    className='od-InfoButton-button'
                    onClick={this._onClick}
                >
                    <i
                        className='od-InfoButton-infoIcon ms-Icon ms-Icon--Info'
                        ref={this._onInfoButton}
                    ></i>
                </button>
                {state.isCalloutVisible && (
                    <Callout
                        directionalHint={DirectionalHint.topCenter}
                        gapSpace={2}
                        onDismiss={this._onDismiss}
                        targetElement={this._infoButton}
                        setInitialFocus={true}
                    >
                        <div className='od-InfoButton-content'>
                            <span className='od-InfoButton-message'>{props.message}</span>
                        </div>
                    </Callout>
                )}
            </div>
        );
    }

    private _onClick() {
        this.setState({
            ...this.state,
            isCalloutVisible: true
        });
    }

    private _onDismiss() {
        this.setState({
            ...this.state,
            isCalloutVisible: false
        });
    }

    private _onInfoButton(element: HTMLElement): any {
        this._infoButton = element;
    }
}