// OneDrive:IgnoreCodeCoverage

import * as React from 'react';
import { Checkbox } from 'office-ui-fabric-react/lib/Checkbox';
import { autobind, css } from 'office-ui-fabric-react/lib/Utilities';
import './ComposedCheckbox.scss';

export interface IComposedCheckboxProps extends React.Props<ComposedCheckbox> {
    /**
     * Label to display next to the checkbox. It is also the key for corresponding option.
     */
    label: string;

    /**
     * Checked state. The value will be changed in handling onChange events and re-rendering.
     */
    checked: boolean;

    /**
     * A callback for receiving a notification when the checked value has changed.
     */
    onChanged: (label: string, isChecked: boolean) => void;

    /**
     * Additional class name to provide on the root element
     */
    className?: string;

    /**
     * Whether to show label next to the checkbox
     */
    showLabel?: boolean;
}

export interface IComposedCheckboxState {
    /** Is true when the control has focus. */
    isFocused?: boolean;
}

/**
 * Composed Checkbox control that is used to select/deselect an option.
 */
export class ComposedCheckbox extends React.Component<IComposedCheckboxProps, IComposedCheckboxState> {
    constructor(props: IComposedCheckboxProps) {
        super(props);

        this.state = {
            isFocused: false
        };
    }

    public render() {
        let { checked, label, children, className, showLabel } = this.props;
        const { isFocused } = this.state;

        if (checked === undefined || checked === null) {
            checked = false;
        }

        const inputProps = {
            onFocus: this._onFocus,
            onBlur: this._onBlur,
            'aria-label': label
        };

        if (showLabel && typeof label !== 'string') {
            // need to ensure we only try to render checkbox if label is a valid label.
            // otherwise checkbox will fail to render and it will cause filters pane fail to render.
            return null;
        }

        // TODO: need to modify checkbox and persona controls in fabric react to make sure they can be associated with each other.
        return (
            <div className={ css('ComposedCheckbox', className, { 'is-inFocus': isFocused }) }
                data-automationtype='ComposedCheckbox'
                data-is-checked={ checked }
                data-checked-value={ label }>
                <Checkbox className='ComposedCheckbox-checkBox'
                    label={ showLabel && label }
                    checked={ checked }
                    onChange={ this._onToggleChanged }
                    inputProps={ inputProps }/>
                { children &&
                    <div className='ComposedCheckbox-children-container' aria-hidden='true'>
                        { children }
                    </div>
                }
            </div>
        );
    }

    @autobind
    private _onFocus() {
        this.setState({ isFocused: true });
    }

    @autobind
    private _onBlur() {
        this.setState({ isFocused: false });
    }

    @autobind
    private _onToggleChanged(ev: React.FormEvent<HTMLInputElement>, isChecked: boolean) {
        let { label, onChanged } = this.props;
        if (onChanged) {
            onChanged(label, isChecked);
        }
    }
}
