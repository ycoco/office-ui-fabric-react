// external packages
import * as React from 'react';
import { TextField, ITextField } from 'office-ui-fabric-react/lib/TextField';
import { PanelType } from 'office-ui-fabric-react/lib/Panel';
import { autobind } from 'office-ui-fabric-react/lib/Utilities';
import HtmlEncoding from '@ms/odsp-utilities/lib/encoding/HtmlEncoding';
import {
    TextRenderer,
    ITextRendererProps
} from '@ms/odsp-list-utilities/lib/Renderers/FieldRenderers';

// local packages
import './NoteFieldEditor.scss';
import { IReactFieldEditor } from '../IReactFieldEditor';
import {
    BaseReactFieldEditor,
    IBaseReactFieldEditorProps,
    IBaseReactFieldEditorState
} from '../baseEditor/BaseReactFieldEditor';
import {
    IframeLoaderPanel,
    IframeLoaderPanelProps
} from '../../../IframeLoaderPanel/IframeLoaderPanel';

const MAXLENGTH = 255;
const EDITORMINHEIGHT = 350;
const HEIGHTOFFSET = 255;

export interface INoteFieldEditorProps extends IBaseReactFieldEditorProps {
    alternativeEditorUrl: string;
}

export class NoteFieldEditor extends BaseReactFieldEditor<INoteFieldEditorProps, IBaseReactFieldEditorState> implements IReactFieldEditor {
    private _textField: ITextField;
    private _iframeHeight: number;

    public constructor(props: INoteFieldEditorProps) {
        super(props);

        this._iframeHeight = 0;
    }

    /**
     * Override to use the NoteRenderer
     */
    protected _getRenderer(): JSX.Element {
        let text = this._getRendererText();
        let isTruncated = false;
        if (text && !this.props.field.schema.AppendOnly && !this.props.field.schema.RichText) {
            text = HtmlEncoding.encodeText(text);
            text = text.replace(/\n/g, '<br>');
        }
        // show fade effect for truncated Note content.
        if (text && (text.length > MAXLENGTH || text.split(/\r|\r\n|\n|<br>/).length > 4)) {
            isTruncated = true;
        }

        let rendererProps: ITextRendererProps = {
            text: text,
            isSafeToInnerHTML: true,
            isTruncated: isTruncated
        };
        return TextRenderer(rendererProps);
    }

    protected _focusOnEditorIfNeeded(): void {
        if (!this.props.field.schema.RichText && this._textField) {
            this._textField.focus();
        }
    }

    /**
     * Core editor control for this field
     *
     * @override
     */
    protected _getEditor(): JSX.Element {
        return (this.props.field.schema.RichText) ?
            this._getRichEditor() : this._getPlainEditor();
    }

    protected _editButtonOnClick(): void {
        super._editButtonOnClick();

        if (!this.props.field.schema.RichText) {
            return;
        }

        this.setState({
            isEditingPanelOpen: true
        });
    }

    @autobind
    protected _endEdit(ev: any): void {
        let newData = this._textField.value;
        this._onSave(newData);
    }

    private _getRichEditor(): JSX.Element {
        let shouldLoadRTE: boolean = this.state.isEditingPanelOpen && (this.props.alternativeEditorUrl !== '');
        let iframeLoaderPanelProps: IframeLoaderPanelProps = {
            url: this.props.alternativeEditorUrl,
            onLoad: this._onIframeLoaded,
            panelProps: {
                type: PanelType.largeFixed,
            }
        };
        let rteEditor: JSX.Element = shouldLoadRTE ? (
            <div className="od-NoteEditor-input od-TextField-field" role="textbox">
                <IframeLoaderPanel { ...iframeLoaderPanelProps } />
            </div>
        ) : null;
        let renderer: JSX.Element = this._getRenderer();
        return (
            <div>
                { renderer }
                { rteEditor }
            </div>
        );
    }

    private _getPlainEditor(): JSX.Element {
        const { field } = this.state;
        return (
            <div className="od-NoteEditor-input od-TextField-field">
                <TextField
                    multiline
                    placeholder={ this._getPlaceHolderString() }
                    underlined={ true }
                    defaultValue={ (field && field.data) ? field.data.toString() : '' }
                    rows={ 2 }
                    onBlur={ this._endEdit }
                    componentRef={ component => this._textField = component } />
            </div>
        );
    }

    @autobind
    private _onIframeLoaded(iframe: HTMLIFrameElement): void {
        if (!iframe || !iframe.contentWindow || !iframe.contentWindow.document) {
            return;
        }

        this._iframeHeight = iframe.clientHeight;
        let iframeDocument = iframe.contentWindow.document;
        let richTextEditorExist = this._updateRichTextEditorSize(iframe);

        if (richTextEditorExist) {
            // set editor min-height
            let heightPixel = this._iframeHeight - HEIGHTOFFSET;
            if (heightPixel < (EDITORMINHEIGHT - HEIGHTOFFSET)) {
                heightPixel = EDITORMINHEIGHT - HEIGHTOFFSET;
            }
            let editorHeight = heightPixel + "px";
            this._overrideStyleInIframe(iframeDocument, ".ms-rtestate-field", "min-height: " + editorHeight);
            // stretch the editor
            this._overrideStyleInIframe(iframeDocument, "#onetIDListForm", "width: 100%");
            this._overrideStyleInIframe(iframeDocument, "#onetIDListForm table", "width: 100%");
            this._overrideStyleInIframe(iframeDocument, ".ms-formbody", "width: 100%");
            // hide bottom save/cancel buttoms and all field labels
            this._overrideStyleInIframe(iframeDocument, ".ms-formtoolbar", "display: none");
            this._overrideStyleInIframe(iframeDocument, ".ms-formlabel", "display: none");

            // this will ensure cancel button inside the Iframe exit the OneUpIframe
            // Note: "cancelPopUp" is a function from classic SharePoint javascript that gets called when Cancel is clicked.
            // We are hijacking that function by overwriting it with our own so that we can close the panel instead
            iframe['cancelPopUp'] = () => {
                this.setState({
                    isEditingPanelOpen: false
                });
            };

            // set focus to the editor
            let richTextEditorId = this.state.field.schema.Name + '_' + this.state.field.schema.Id + '_$TextField_inplacerte';
            let richTextEditor = iframeDocument.getElementById(richTextEditorId);
            if (richTextEditor) {
                richTextEditor.focus();
            }

            // TODO (stanleyy): see if this is still needed!
            //
            // This is a hack to work around the s4-workspace sizing bug in the underlying aspx page. The work area is calculated
            // based on page heights, the ribbon, etc, but there's a race condition calculating the heights, and when we compute the
            // available workspace height. Triggering a resize causes a 1 time recalculation.
            // if (this._platform.isIE || this._platform.isEdge) {
            //     let evt = document.createEvent('UIEvents');
            //     evt.initUIEvent('resize', true, false, window, 0);
            //     window.dispatchEvent(evt);
            // }

            /**
             * This is a workaround for a really difficult problem where odsp-next wants to iframe classic rich text edit field
             * but would like to run a custom save function when the save button is pressed.
             *
             * We've changed the server to listens to special query params "OnlyIncludeOneField" and "ClientFormOverwriteSave" to
             * determine if we're in this particular situation. If we are, the save button will call a function that doesn't exist in
             * classic, "ClientFormOverwriteSave". The definition of this function will be injected into classic here so
             * the caller can decide what actions to take on button click. Please note that "ClientFormOverwriteSave" is
             * defined on the frameElement in effort to not pollute classic's global namespace or be accidentally overwritten.
             * Also, "ClientFormOverwriteSave" should return false to prevent the old save behavior;
             *
             * We should delete this when odsp-next implements its own rich text editor.
             */
            if (richTextEditor) {
                // Fill the initial contents of the RTE with current data from the field.
                richTextEditor.innerHTML = this.props.field.data;

                iframe['ClientFormOverwriteSave'] = () => {
                    let newData = richTextEditor.innerHTML;
                    this.setState({
                        isEditingPanelOpen: false
                    });
                    this._onSave(newData);
                    return false; // prevent old default behavior
                };
            }
        }
    }

    private _overrideStyleInIframe(iframeDocument: HTMLDocument, query: string, cssText: string) {
        // find all elements base on query
        let elements = iframeDocument.querySelectorAll(query);

        // update all elements found with cssText
        for (let i = 0; i < elements.length; i++) {
            let element: HTMLElement = elements[i] as HTMLElement;
            element.style.cssText = cssText;
        }
    }

    private _updateRichTextEditorSize(iframe: HTMLIFrameElement): boolean {
        let richTextEditorExist = false;

        if (iframe) {
            let iframeDocument = iframe.contentWindow.document;
            let richTextEditorElements = iframeDocument.getElementsByClassName("ms-rtestate-write");

            if (richTextEditorElements.length > 0) {
                richTextEditorExist = true;

                // set height for s4-workspace so it scrolls when the edit field overflows
                let ribbon = iframeDocument.getElementById("s4-ribbonrow");
                let workspace = iframeDocument.getElementById("s4-workspace");
                if (workspace && workspace.style) {
                    let workspaceHeight = this._iframeHeight - ribbon.clientHeight;
                    if (workspaceHeight < EDITORMINHEIGHT) {
                        workspaceHeight = EDITORMINHEIGHT;
                    }
                    workspace.style.height = workspaceHeight + "px";
                }
            }
        }

        return richTextEditorExist;
    }

}

export default NoteFieldEditor;