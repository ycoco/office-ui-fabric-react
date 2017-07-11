// external packages
import * as React from 'react';
import { IClientFormField } from '@ms/odsp-datasources/lib/models/clientForm/IClientForm';
import { ISPListItem } from '@ms/odsp-datasources/lib/SPListItemProcessor';
import {
    TextRenderer,
    ITextRendererProps
} from '@ms/odsp-list-utilities/lib/Renderers/FieldRenderers';
import { Label } from 'office-ui-fabric-react/lib/Label';
import { autobind } from 'office-ui-fabric-react/lib/Utilities';
import * as ObjectUtil from '@ms/odsp-utilities/lib/object/ObjectUtil';

// local packages
import './BaseReactFieldEditor.scss';
import {
    IReactFieldEditor,
    ReactFieldEditorMode
} from './IReactFieldEditor';

const PROPERTY_MAX_LENGTH = 255; // max length of property SharePoint allows

export interface IBaseReactFieldEditorProps {
    item: ISPListItem;
    field: IClientFormField;
    interactiveSave: boolean;
    shouldGetFocus: boolean;
    onSave: (field: IClientFormField) => void;
}

export interface IBaseReactFieldEditorState {
    mode: ReactFieldEditorMode;
    field: IClientFormField;
}

export class BaseReactFieldEditor extends React.Component<IBaseReactFieldEditorProps, IBaseReactFieldEditorState> implements IReactFieldEditor {
    protected _updatedField;
    protected _inputElementMaxLength;
    protected _renderWidth = 190;
    protected _renderer: JSX.Element;
    protected _focusElement: HTMLElement;

    public constructor(props: IBaseReactFieldEditorProps) {
        super(props);

        this._inputElementMaxLength = this.props.field.schema.MaxLength;
        if (this._inputElementMaxLength === undefined) {
            this._inputElementMaxLength = PROPERTY_MAX_LENGTH;
        }

        this.state = this._getStateFromProps(this.props);
        this._startEdit = this._startEdit.bind(this);
    }

    public render() {
        return (
            <div className='od-ClientFormFields-field'>
                { this._renderLabel() }
                { this.state.mode === ReactFieldEditorMode.View ? this._renderRenderer() : this._renderEditor() }
                { this._renderState() }
            </div>
        );
    }

    public setMode(newMode: ReactFieldEditorMode): void {
        this.setState({
            mode: newMode
        });
    }

    public componentDidMount() {
        if (this._focusElement) {
            this._focusElement.focus();
        }
    }

    public componentWillReceiveProps(nextProps) {
        this.setState(this._getStateFromProps(nextProps));
    }

    protected _validate(): string {
        if (this.props.field.schema.Required && !this._updatedField.data) {
            this._updatedField.clientSideErrorMessage = "You can't leave this blank."; // TODO: loc strings.RequiredField
        } else {
            this._updatedField.clientSideErrorMessage = '';
        }
        return this._updatedField.clientSideErrorMessage;
    }
    /**
     * Render the containers and the field label.  Child classes usually don't need to override this.
     */
    protected _renderLabel(): JSX.Element {
        return (
            <Label className='od-FieldEditor-fieldTitle' required={ this.props.field.schema.Required }>
                { this.state.field.schema.Title }
            </Label>
        );
    }

    /**
     * Render the containers and the core renderer.  Child classes usually don't need to override this.
     */
    protected _renderRenderer(): JSX.Element {
        return (
            <div
                className="od-FieldEditor-controlContainer--display"
                onClick={ this._startEdit }
                onKeyPress={ this._keyPress }
                role='button'
                ref={ (elmt) => { this._focusElement = elmt; } }
                tabIndex={ 0 }>
                { (this.state.field.data === "") ? this._renderPlaceHolder() : this._getRenderer() }
            </div>
        );
    }

    /**
     * Render the containers and the core editor.  Child classes usually don't need to override this.
     */
    protected _renderEditor(): JSX.Element {
        return (
            <span className="od-FieldEditor-controlContainer">
                { this._getEditor() }
            </span>
        );
    }

    protected _renderState(): JSX.Element {
        return (
            <div className="od-FieldEditor-state">
                { this._renderErrorMsg() }
            </div>
        );
    }

    protected _renderErrorMsg(): JSX.Element {
        let aggregatedErrorMsg = this.state.field.clientSideErrorMessage ?
            this.state.field.clientSideErrorMessage :
            this.state.field.errorMessage;
        if (aggregatedErrorMsg) {
            return (
                <div className="od-FieldEditor-required">
                    { aggregatedErrorMsg }
                </div>
            );
        } else {
            return null;
        }
    }

    /**
     * Get the core renderer.  Child classes usually override this.
     */
    protected _getRenderer(): JSX.Element {
        // TODO: Update user friendly strings for boolean field editor.  It displays 0 or 1 currently.
        let rendererProps: ITextRendererProps = {
            text: this._getRendererText()
        };
        return TextRenderer(rendererProps);
    }

    /**
     * Render place holders for editors when there is no data to show. Child classes usually don't need to override this.
     */
    protected _renderPlaceHolder(): JSX.Element {
        return (
            <div className="od-FieldEditor-placeHolder">
                { this._getPlaceHolderString() }
            </div>
        );
    }

    /**
     * Generate place holder strings. Child classes usually override this.
     */
    protected _getPlaceHolderString(): string {
        // TODO: localization strings
        return 'Enter text here';
    }

    /**
     * Get string to display when it's in viewing mode.  Child classes usually override this.
     */
    protected _getRendererText(): string {
        return this.state.field.data && this.state.field.data.toString() || '';
    }

    /**
     * Get the core editor.  Child classes usually override this.
     */
    protected _getEditor(): JSX.Element {
        // Base class won't provide editor.  Always display only.
        return this._getRenderer();
    }

    protected _startEdit(ev: React.MouseEvent<HTMLDivElement>): void {
        // Base class won't provide editor.  Always display only.
        this.setMode(ReactFieldEditorMode.Edit);
    }

    protected _onSave(newData: any): void {
        this._updatedField = ObjectUtil.deepCopy(this.state.field);
        this._updatedField.data = newData;
        this._validate();
        this.setState({
            mode: this._getModeAfterEdit(),
            field: this._updatedField
        });
        this.props.onSave(this._updatedField);
    }

    @autobind
    protected _keyPress(evt: React.KeyboardEvent<HTMLElement>): void {
        if (evt.which === 13 /* Enter */ || evt.which === 32 /* Space */) {
            this.setMode(ReactFieldEditorMode.Edit);
        }
    }

    protected _getModeAfterEdit(): ReactFieldEditorMode {
        return (this._updatedField.clientSideErrorMessage || this.state.field.hasException || !this.props.interactiveSave) ?
            ReactFieldEditorMode.Edit : ReactFieldEditorMode.View;
    }

    private _getStateFromProps(props: IBaseReactFieldEditorProps): IBaseReactFieldEditorState {
        let hasError = props.field.hasException || props.field.clientSideErrorMessage;
        return {
            mode: (props.interactiveSave && !hasError) ? ReactFieldEditorMode.View : ReactFieldEditorMode.Edit,
            field: props.field
        }
    }
}

export default BaseReactFieldEditor;
