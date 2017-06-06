// external packages
import * as React from 'react';
import {
    IClientForm,
    IClientFormField
} from '@ms/odsp-datasources/lib/models/clientForm/IClientForm';
import { ISPListItem } from '@ms/odsp-datasources/lib/SPListItemProcessor';
import * as HashtagUtilities from '@ms/odsp-utilities/lib/list/HashtagUtilities';
import {
    DefaultButton,
    PrimaryButton
} from 'office-ui-fabric-react/lib/Button';

// local packages
import { ReactFieldEditorFactory } from './fieldEditor/ReactFieldEditorFactory';
import './ReactClientForm.scss';

export interface IReactClientFormProps {
    clientForm: IClientForm;
    interactiveSave: boolean;
    isInfoPane?: boolean;
    onSave: (clientForm: IClientForm) => string;
}

export interface IReactClientFormState {
    clientForm: IClientForm;
}

// This is the reusable pure React based client form that is not attached to odsp-next
export class ReactClientForm extends React.Component<IReactClientFormProps, IReactClientFormState> {
    protected _item: ISPListItem;
    protected _hasError: boolean = false;

    constructor(props: IReactClientFormProps) {
        super(props);

        this.state = {
            clientForm: props.clientForm
        };
        this._item = props.clientForm.item;
    }

    public render() {
        return (
            <div className='od-ClientForm'>
                { this._renderErrorMessages() }
                { this._renderFieldEditors() }
                { this._renderEditButtons() }
            </div>
        );
    }

    private _renderErrorMessages(): JSX.Element {
        if (this._hasError) {
            return (
                <div className="od-ClientForm-error ms-bgColor-neutralLight" role="alert">
                    <span className="ms-font-m ms-fontColor-error">ServerErrorTitle</span>
                    <span className="ms-font-m ms-fontColor-neutralSecondary">serverErrorDetails</span>
                </div>
            );
        } else {
            return null;
        }
    }

    private _renderEditButtons(): JSX.Element {
        return (
            <div className="od-ClientForm-editButtonsContainer">
                <span className='od-ClientForm-buttonContainer'>
                    <PrimaryButton text='Save' />
                </span>
                <span className='od-ClientForm-buttonContainer-far'>
                    <DefaultButton text='Cancel' />
                </span>
            </div>
        );
    }

    private _renderFieldEditors(): JSX.Element {
        let editors = this._renderFieldEditorsInternal();
        return (
            <div className="od-ClientFormFields">
                <div className="od-ClientFormFields-fieldsContainer">
                    { editors }
                </div>
            </div>
        );
    }

    private _renderFieldEditorsInternal(): JSX.Element[] {
        let fieldEditors = [];
        var length = this.state.clientForm.fields.length;
        for (let index = 0; index < length; index++) {
            // Create a file editor that matches the current field and add it to the children.
            let currentField = this.state.clientForm.fields[index];
            if (HashtagUtilities.isClientFormHashtagField(currentField)) {
                // don't render hash tag field in new form
                continue;
            }
            let fieldEditor = ReactFieldEditorFactory.getFieldEditor(this._item, currentField, this._onSave.bind(this));
            if (fieldEditor) {
                fieldEditors.push(fieldEditor);
            }
        }
        return fieldEditors;
    }

    private _onSave(field: IClientFormField): void {
        this.props.onSave(this.state.clientForm);
    }
}