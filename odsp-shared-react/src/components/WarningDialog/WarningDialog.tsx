import * as React from 'react';
import { IWarningDialogProps, IWarningDialogStrings } from './WarningDialog.Props';
import { Dialog, DialogFooter, DialogType } from 'office-ui-fabric-react/lib/Dialog';
import { PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import { autobind } from 'office-ui-fabric-react/lib/Utilities';

export interface IWarningDialogState {
    isOpen: boolean;
}

/**
 * This component provides a simple dialog with a title, subtext, and close button.
 */
export class WarningDialog extends React.Component<IWarningDialogProps, IWarningDialogState> {
    constructor(props: IWarningDialogProps) {
        super(props);
        this.state = {
            isOpen: !props.hidden || true
        }
    }

    public componentWillReceiveProps(nextProps: IWarningDialogProps): void {
        this.setState({
            isOpen: !nextProps.hidden || true
        });
    }

    public render(): React.ReactElement<IWarningDialogProps> {
        const strings: IWarningDialogStrings = this.props.strings;

        return (
            <Dialog
                isOpen={ this.state.isOpen }
                type={ DialogType.close }
                title={ strings.title }
                subText={ strings.subtext }
                onDismiss={ this._onClose }
                isBlocking={ false }
                closeButtonAriaLabel={ strings.closeButtonAriaLabel }
                >
                <DialogFooter>
                    <PrimaryButton onClick={ this._onClose }>{ strings.closeButtonText }</PrimaryButton>
                </DialogFooter>
            </Dialog>
        );
    }

    @autobind
    private _onClose(): void {
        if (this.props.onClose) {
            this.props.onClose();
        }
        this.setState({ isOpen: false });
    }
}