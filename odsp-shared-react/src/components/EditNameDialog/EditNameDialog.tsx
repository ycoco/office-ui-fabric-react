import * as React from 'react';
import { IEditNameDialogProps, IEditNameDialogStrings } from './EditNameDialog.Props';
import { Dialog, DialogFooter, DialogType } from 'office-ui-fabric-react/lib/Dialog';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { autobind } from 'office-ui-fabric-react/lib/Utilities';
import './EditNameDialog.scss';

export interface IEditNameDialogState {
    name: string,
    isDoneButtonDisabled: boolean;
    isOpen: boolean;
}

/**
 * This component provides a simple dialog with a text entry box and done/cancel buttons.
 * You can use this component when renaming items or naming a new folder, for example.
 */
export class EditNameDialog extends React.Component<IEditNameDialogProps, IEditNameDialogState> {
    constructor(props: IEditNameDialogProps) {
        super(props);
        this.state = {
            name: props.strings.initialValue,
            isDoneButtonDisabled: !props.strings.initialValue || props.strings.initialValue === '',
            isOpen: !props.hidden || true
        }
    }

    public componentWillReceiveProps(nextProps: IEditNameDialogProps): void {
        this.setState({
            isOpen: !nextProps.hidden || true
        });
    }

    public render(): React.ReactElement<IEditNameDialogProps> {
        const strings: IEditNameDialogStrings = this.props.strings;

        return (
            <Dialog
                isOpen={ this.state.isOpen }
                type={ DialogType.close }
                title={ strings.title }
                onDismiss={ this._onClose }
                isBlocking={ false }
                closeButtonAriaLabel={ strings.closeButtonAriaLabel }
                >
                <div className='ms-editNameDialog-content'>
                    <TextField
                        placeholder={ strings.placeholderText }
                        defaultValue={ strings.initialValue }
                        onChanged={ this._onNameChanged }
                    />
                    <span className='ms-editNameDialog-fileExtension'>{ strings.fileExtensionText }</span>
                </div>
                <DialogFooter>
                    <PrimaryButton onClick={ this._onDone } disabled={ this.state.isDoneButtonDisabled }>{ strings.doneButtonText }</PrimaryButton>
                    { this.props.showCancelButton && (
                        <DefaultButton onClick={ this._onClose }>{ strings.cancelButtonText }</DefaultButton>
                    )}
                </DialogFooter>
            </Dialog>
        );
    }

    @autobind
    private _onNameChanged(newName: string): void {
        let isNameProvided: boolean = newName && newName !== '';
        this.setState({
            name: newName,
            isDoneButtonDisabled: !isNameProvided
        })
    }

    @autobind
    private _onDone(): void {
        this.props.onDone(this.state.name);
        this.setState({ isOpen: false });
    }

    @autobind
    private _onClose(): void {
        if (this.props.onClose) {
            this.props.onClose();
        }
        this.setState({ isOpen: false });
    }
}
