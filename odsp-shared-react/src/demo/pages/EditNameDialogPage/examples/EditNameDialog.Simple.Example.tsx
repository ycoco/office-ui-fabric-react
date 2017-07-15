import * as React from 'react';
import { EditNameDialog, IEditNameDialogStrings } from '../../../../components/EditNameDialog/index';
import { DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { autobind } from 'office-ui-fabric-react/lib/Utilities';

export interface IEditNameDialogExampleState {
    hidden: boolean; // Whether the dialog is hidden or visible
}

export class EditNameDialogExample extends React.Component<React.Props<EditNameDialogExample>, IEditNameDialogExampleState> {
    constructor() {
        super();
        this.state = {
            hidden: true
        };
    }

    public render() {
        let sampleStrings: IEditNameDialogStrings = {
            title: 'Edit item name',
            placeholderText: 'Enter a name',
            initialValue: 'Defaultname',
            fileExtensionText: '.txt',
            doneButtonText: 'Done',
            cancelButtonText: 'Cancel',
            closeButtonAriaLabel: 'Close'
        }

        return (
            <div>
                <DefaultButton onClick={this._onClick} text='Launch Edit Name Dialog'></DefaultButton>
                <EditNameDialog
                    hidden={ this.state.hidden }
                    onDone={ this._onDone }
                    onClose={ this._onDismiss }
                    strings={ sampleStrings }
                    >
                </EditNameDialog>
            </div>
        );
    }

    @autobind
    private _onClick(): void {
        this.setState({
            hidden: false
        })
    }

    @autobind
    private _onDone(name: string): void {
        alert('You entered ' + name);
    }

    @autobind
    private _onDismiss(): void {
        this.setState({
            hidden: true
        });
    }
}