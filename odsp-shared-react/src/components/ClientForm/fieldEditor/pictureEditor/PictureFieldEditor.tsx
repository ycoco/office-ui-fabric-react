// external packages
import * as React from 'react';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import {
    UrlRenderer,
    IUrlRendererProps
} from '@ms/odsp-list-utilities/lib/Renderers/FieldRenderers';
import { Async, autobind } from 'office-ui-fabric-react/lib/Utilities'

// local packages
import {
    IReactFieldEditor,
    ReactFieldEditorMode
} from '../IReactFieldEditor';
import {
    BaseReactFieldEditor,
    IBaseReactFieldEditorProps
} from '../BaseReactFieldEditor';

export class PictureFieldEditor extends BaseReactFieldEditor implements IReactFieldEditor {
    private _errMsg: string;
    private _url: string; // databound to the url textbox
    private _altText: string; // databound to the description text box
    private _timeOut;
    private _async: Async;

    public constructor(props: IBaseReactFieldEditorProps) {
        super(props);
        this._parseServerData(this.props.field.data);
        this._async = new Async(this);
    }

    /**
     * Core editor control for this field
     *
     * @override
     */
    protected _getEditor(): JSX.Element {
        return (
            <div>
                <TextField
                    placeholder={ 'Enter a URL' }
                    defaultValue={ this._url ? this._url : '' }
                    underlined={ true }
                    onBlur={ this._txtFieldOnBlur }
                    onFocus={ this._txtFieldOnFocus }
                    onGetErrorMessage={ this._validateInput }
                    errorMessage={ this._errMsg }
                />
                <TextField
                    placeholder={ 'Enter display text' }
                    underlined={ true }
                    defaultValue={ this._altText ? this._altText : '' }
                    onChanged={ inString => this._altText = inString }
                    onBlur={ this._txtFieldOnBlur }
                    onFocus={ this._txtFieldOnFocus }
                />

            </div>
        );
    }

    @autobind
    protected _endEdit(): void {
        if (this._errMsg !== '' && this._errMsg !== undefined) {
            // When error message is set, do not save the input
            return;
        }

        let updatedField = { ...this.state.field };
        updatedField.data = this._formatDataForSaving();
        this.setState({
            mode: ReactFieldEditorMode.View,
            field: updatedField
        });
        this.props.onSave(updatedField);
    }

    @autobind
    private _txtFieldOnBlur(ev: any): void {
        this._timeOut = this._async.setTimeout(this._endEdit, 0);
    }

    @autobind
    private _txtFieldOnFocus(ev: any): void {
        if (this._timeOut) {
            this._async.clearTimeout(this._timeOut);
        }
    }

    /**
     * Renderer for this field
     * @override
     */
    protected _getRenderer(): JSX.Element {
        // TODO: Image renderer needed
        let rendererProps: IUrlRendererProps = {
            url: this._url,
            urlDisplay: this._altText
        };
        return UrlRenderer(rendererProps);
    }

    /**
     * Generate place holder strings.
     */
    protected _getPlaceHolderString(): string {
        // TODO: localization strings
        return 'Enter value here';
    }

    @autobind
    private _validateInput(value: string): string {
        // url cannot contains more than 255 characters
        // since user usually use copy and paste to input URL, using maxlength attribute in inputElement directly is not obvious for user.
        // use this specific client side check will ensure we show the message to the user.
        if (value.length > this._inputElementMaxLength) {
            this._errMsg = 'URL may not contain more than 255 characters';
        } else {
            this._url = value;
            this._errMsg = undefined;
        }
        return this._errMsg;
    }

    private _formatDataForSaving(): string {
        if (!Boolean(this._url) && !Boolean(this._altText)) {
            //both field is empty
            return '';
        }
        // concatinate the url and the description with a comma
        let finalValue = !Boolean(this._url) ? ' ' : this._url.replace(/\,/g, ',,'); // replace , with ,,
        finalValue += ', ';
        //if there is a description, add it to the finalValue
        finalValue += Boolean(this._altText) ? this._altText : ' ';
        return finalValue;
    }

    // This is copied from odsp-next.  Please merge them or remove the other cop when we remove KO based form
    /**
     * Parse server data to the correct url and altText.
     * @param server data looks like 'http://bing,,.com2, http://bing,.com1'
     * ', ' is used to seperate url and altText. The ',,' in url means ','.
     */
    private _parseServerData(data: string): void {
        let delimiter = data && data.search ? data.search(/[^,],[^,]/) : -1;
        let url = data;
        let altText = '';

        if (delimiter >= 0) {
            url = data.substr(0, delimiter + 1).trim();
            altText = data.substr(delimiter + 2).trim();
        }

        url = url ? url.replace(/\,\,/g, ',') : ''; //replace ',,' with ','

        this._url = url;
        this._altText = altText;
    }
}

export default PictureFieldEditor;