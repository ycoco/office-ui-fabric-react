// external packages
import * as React from 'react';
import {
    IClientForm,
    IClientFormField
} from '@ms/odsp-datasources/lib/models/clientForm/IClientForm';
import { ISPListItem } from '@ms/odsp-datasources/lib/SPListItemProcessor';
import {
    DefaultButton,
    PrimaryButton
} from 'office-ui-fabric-react/lib/Button';
import { autobind } from 'office-ui-fabric-react/lib/Utilities';
import * as ObjectUtil from '@ms/odsp-utilities/lib/object/ObjectUtil';

// local packages
import { ReactFieldEditorFactory } from './fieldEditor/ReactFieldEditorFactory';
import './ReactClientForm.scss';

export interface IReactClientFormProps {
    clientForm: IClientForm;
    interactiveSave: boolean;
    isInfoPane?: boolean;
    onSave: (clientForm: IClientForm) => Promise<boolean>;
    onCancel: () => string;
}

export interface IReactClientFormState {
    clientForm: IClientForm;
    serverErrorDetails: string;
}

// This is the reusable pure React based client form that is not attached to odsp-next
export class ReactClientForm extends React.Component<IReactClientFormProps, IReactClientFormState> {
    protected _item: ISPListItem;
    protected _hasError: boolean = false;

    constructor(props: IReactClientFormProps) {
        super(props);

        this.state = {
            clientForm: ObjectUtil.deepCopy(props.clientForm),
            serverErrorDetails: ''
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

    public componentWillReceiveProps(nextProps) {
        this.setState({
            clientForm: ObjectUtil.deepCopy(nextProps.clientForm)
        });
    }

    private _renderErrorMessages(): JSX.Element {
        if (this.state.serverErrorDetails) {
            return (
                <div className="od-ClientForm-error ms-bgColor-neutralLight" role="alert">
                    <span className="ms-font-m ms-fontColor-error">Error:</span>
                    <span className="ms-font-m ms-fontColor-neutralSecondary">{ this.state.serverErrorDetails }</span>
                </div>
            );
        } else {
            return null;
        }
    }

    private _renderEditButtons(): JSX.Element {
        if (this.props.interactiveSave) {
            return null;
        } else {
            return (
                <div className="od-ClientForm-editButtonsContainer">
                    <span className='od-ClientForm-buttonContainer'>
                        <PrimaryButton
                            text='Save'
                            onClick={ this._onSaveButtonClicked } />
                    </span>
                    <span className='od-ClientForm-buttonContainer-far'>
                        <DefaultButton
                            text='Cancel'
                            onClick={ this._onCancelButtonClicked } />
                    </span>
                </div>
            );
        }
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
        let foundFirstFieldWithError = false;
        let fieldEditors = [];
        var length = this.state.clientForm.fields.length;
        for (let index = 0; index < length; index++) {
            // Create a file editor that matches the current field and add it to the children.
            let currentField = this.state.clientForm.fields[index];
            let shouldGetFocus = !foundFirstFieldWithError && currentField.hasException;
            if (shouldGetFocus) {
                foundFirstFieldWithError = true;
            }
            let fieldEditor = ReactFieldEditorFactory.getFieldEditor(
                this._item,
                currentField,
                this.props.interactiveSave,
                shouldGetFocus,
                this._onSave);
            if (fieldEditor) {
                fieldEditors.push(fieldEditor);
            }
        }
        return fieldEditors;
    }

    @autobind
    private _onSaveButtonClicked() {
        this._saveClientForm(this.state.clientForm);
    }

    @autobind
    private _onCancelButtonClicked() {
        if (this.props.onCancel) {
            this.props.onCancel();
        }
    }

    @autobind
    private _onSave(field: IClientFormField): void {
        let updatedClientForm = ObjectUtil.deepCopy(this.state.clientForm);
        for (let updatedField of updatedClientForm.fields) {
            if (updatedField && updatedField.schema && updatedField.schema.Id && updatedField.schema.Id === field.schema.Id) {
                updatedField.data = field.data;
                updatedField.clientSideErrorMessage = field.clientSideErrorMessage;
            }
        }
        this.setState({
            clientForm: updatedClientForm
        });
        if (this.props.interactiveSave) {
            this._saveClientForm(updatedClientForm);
        }
    }

    private _saveClientForm(updatedClientForm: IClientForm): void {
        for (let updatedField of updatedClientForm.fields) {
            if (updatedField.clientSideErrorMessage) {
                // there is client side validation error, display error message instead of save
                return;
            }
        }
        if (this.props.onSave) {
            this.props.onSave(updatedClientForm).then((isSuccessful: boolean) => {
                this._handleSaveSuccess(isSuccessful);
            }, (errors: any) => {
                this._handleSaveFailure(errors);
            });
        }
    }

    private _handleSaveSuccess(isSuccessful: boolean): void {
        let errorMessage = isSuccessful ? '' : "Server error during save" // TODO: localization
        this.setState({
            serverErrorDetails: errorMessage
        });
    }

    private _handleSaveFailure(errors: any): void {
        errors = errors instanceof Array ? errors : [errors];
        let errorMessage: string = errors.reduce((msg: string, error: any) => {
            //if there are multi error msgs, show them in different lines
            return msg + msg ? "\r\n" : "" +
                error && error.message ? (!!error.message.value ? error.message.value : error.message) : "";
        }, "");
        this.setState({
            serverErrorDetails: errorMessage || "Server error" // TODO: localize with ClientFormResx.strings.ServerErrorDefaultValue
        });
    }
}