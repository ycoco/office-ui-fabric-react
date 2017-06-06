// external packages
import * as React from 'react';
import { IClientFormField } from '@ms/odsp-datasources/lib/models/clientForm/IClientForm';
import { ISPListItem } from '@ms/odsp-datasources/lib/SPListItemProcessor';
import {
  TextRenderer,
  ITextRendererProps
} from '@ms/odsp-list-utilities/lib/Renderers/FieldRenderers';
import { Label } from 'office-ui-fabric-react/lib/Label';

// local packages
import './BaseReactFieldEditor.scss';
import {
    IReactFieldEditor,
    ReactFieldEditorMode
} from './IReactFieldEditor';

export interface IBaseReactFieldEditorProps {
    item: ISPListItem;
    field: IClientFormField;
    onSave: (field: IClientFormField) => string;
}

export interface IBaseReactFieldEditorState {
    mode: ReactFieldEditorMode;
    field: IClientFormField;
}

export class BaseReactFieldEditor extends React.Component<IBaseReactFieldEditorProps, IBaseReactFieldEditorState> implements IReactFieldEditor {
    protected _renderWidth = 190;
    protected _renderer: JSX.Element;

    public constructor(props: IBaseReactFieldEditorProps) {
        super(props);

        this.state = {
            mode: ReactFieldEditorMode.View,
            field: props.field
        }

        this._startEdit = this._startEdit.bind(this);
    }

    public render() {
        return (
            <div className="od-ClientFormFields-field">
                { this._renderLabel() }
                <div className="od-FieldEditor-controlContainer--display" onClick={ this._startEdit } role='button'>
                    { (this.state.mode === ReactFieldEditorMode.Edit) ? this._renderEditor() : this._renderRenderer() }
                </div>
            </div>
        );
    }

    public setMode(newMode: ReactFieldEditorMode): void {
        this.setState({
            mode: newMode
        });
    }

    /**
     * Render the containers and the field label.  Child classes usually don't need to override this.
     */
    protected _renderLabel(): JSX.Element {
        return (
            <Label className="od-FieldEditor-fieldTitle">
                { this.state.field.schema.Title }
            </Label>
        );
    }

    /**
     * Render the containers and the core renderer.  Child classes usually don't need to override this.
     */
    protected _renderRenderer(): JSX.Element {
        return (
            <div className="od-FieldEditor-display">
                { (this.state.field.data === "") ? this._renderPlaceHolder() : this._getRenderer() }
            </div>
        );
    }

    /**
     * Render the containers and the core editor.  Child classes usually don't need to override this.
     */
    protected _renderEditor(): JSX.Element {
        return (
            <span className="od-FieldEditor-placeHolder">
                { this._getEditor() }
            </span>
        );
    }

    /**
     * Get the core renderer.  Child classes usually override this.
     */
    protected _getRenderer(): JSX.Element {
        // TODO: Update user friendly strings for boolean field editor.  It displays 0 or 1 currently.
        let rendererProps: ITextRendererProps = {
            text: this.state.field.data.toString()
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
}

export default BaseReactFieldEditor;
