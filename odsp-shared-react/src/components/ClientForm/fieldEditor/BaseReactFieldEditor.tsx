// external packages
import * as React from 'react';
import { IClientFormField } from '@ms/odsp-datasources/lib/models/clientForm/IClientForm';
import { ISPListItem } from '@ms/odsp-datasources/lib/SPListItemProcessor';
import {
  TextRenderer,
  ITextRendererProps
} from '@ms/odsp-list-utilities/lib/Renderers/FieldRenderers';

// local packages
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
    }

    public render() {
        return (
            <div>
                { this._renderLabel() }
                <div className="od-FieldEditor-controlContainer--display" role='button'>
                    { (this.state.mode === ReactFieldEditorMode.Edit)? this._renderEditor() : this._renderRenderer() }
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
            <label className="od-FieldEditor-fieldTitle ms-Label">
                { this.state.field.schema.Title }
            </label>                
        );
    }

    /**
     * Render the containers and the core renderer.  Child classes usually don't need to override this.
     */
    protected _renderRenderer(): JSX.Element {
        return (
            <div className="od-FieldEditor-display" onClick={ this._startEdit.bind(this) }>
                { this._getRenderer() }
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
        let rendererProps: ITextRendererProps = {
            text: this.state.field.data.toString()
        };
        return TextRenderer(rendererProps);
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
