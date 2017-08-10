import * as React from 'react';
import { BaseComponent, IBaseProps, autobind } from 'office-ui-fabric-react/lib/Utilities';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { Toggle } from 'office-ui-fabric-react/lib/Toggle';
import { IMoreOptionsComponent, IMoreOptionsComponentSchemaValues } from './IMoreOptionsComponent';
import { IColumnManagementPanelStrings } from '../../../../containers/columnManagementPanel/ColumnManagementPanelStringHelper';
export interface INoteColumnMoreOptionsProps extends IBaseProps {
    /** The number of lines shown for this field */
    numberOfLines: string;
    /** Default checked state of use enhanced rich text toggle. Default is false. */
    richText: boolean;
    /** Default checked state of append only toggle. Default is false. */
    appendOnly: boolean;
    /**Whether or not the panel is for a document library */
    isDocumentLibrary?: boolean;
    /** Callback to show the more options section if there is an error. */
    showMoreOptions: (callback?: () => void) => void;
    /** Collection of localized strings to show in the create column panel UI. */
    strings: IColumnManagementPanelStrings;
    /**Whether or not the versioning is enabled */
    enableVersions?: boolean;
}

export interface INoteColumnMoreOptionsState {
    numLines: string;
    numLinesErrorMessage: string;
    richText?: boolean;
    appendOnly?: boolean;
    appendOnlyErrorMessage: string;
}

export class NoteColumnMoreOptions extends BaseComponent<INoteColumnMoreOptionsProps, INoteColumnMoreOptionsState> implements IMoreOptionsComponent {
    private _numLines: TextField;
    private _appendOnly: Toggle;

    constructor(props) {
        super(props);
        this.state = {
            numLines: this.props.numberOfLines,
            numLinesErrorMessage: "",
            richText: this.props.richText,
            appendOnly: this.props.appendOnly,
            appendOnlyErrorMessage: "",
        }
    }

    public render() {
        let strings = this.props.strings;
        let richTextToggle = (
            <Toggle className='ms-ColumnManagementPanel-toggle richText'
                checked={ this.state.richText }
                label={ strings.richTextToggle }
                onText={ strings.toggleOnText }
                offText={ strings.toggleOffText }
                onChanged={ this._richTextChanged } />
        );
        let appendOnlyToggle = (
            <Toggle className='ms-ColumnManagementPanel-toggle appendOnly'
                checked={ this.state.appendOnly }
                label={ strings.appendOnlyToggle }
                onText={ strings.toggleOnText }
                offText={ strings.toggleOffText }
                onChanged={ this._appendOnlyChanged }
                ref={ '_appendOnly' } />
        );
        return (
            <div className='ms-ColumnManagementPanel-textMoreOptions'>
                <TextField className='ms-ColumnManagementPanel-numberOfLines'
                    label={ strings.numberOfLinesLabel }
                    ariaLabel={ strings.numberOfLinesAriaLabel }
                    value={ this.state.numLines }
                    onChanged={ this._numLinesChanged }
                    errorMessage={ this.state.numLinesErrorMessage }
                    ref={ this._resolveRef('_numLines') } />
                { !this.props.isDocumentLibrary && richTextToggle }
                { !this.props.isDocumentLibrary && appendOnlyToggle }
                <div role='region' aria-live='polite' className={ (this.state.appendOnlyErrorMessage ? 'ms-ColumnManagementPanel-error' : '') }>
                    <span>{ this.state.appendOnlyErrorMessage }</span>
                </div>
            </div>
        );
    }

    @autobind
    public getSchemaValues(): IMoreOptionsComponentSchemaValues | false {
        if (this.state.appendOnlyErrorMessage || this.state.numLinesErrorMessage) {
            if (this.state.numLinesErrorMessage) {
                this.props.showMoreOptions(() => this._numLines.focus());
            }
            if (this.state.appendOnlyErrorMessage) {
                this.props.showMoreOptions(() => this._appendOnly.focus());
            }
        } else {
            return {
                NumLines: this.state.numLines !== "" ? Number(this.state.numLines) : null,
                RichText: this.state.richText,
                AppendOnly: this.state.appendOnly,
                RichTextMode: this.state.richText ? "FullHtml" : "Compatible",
                IsolateStyles: this.state.richText
            };
        }
        return false;
    }

    @autobind
    private _numLinesChanged(newValue: string) {
        var isNumberInvalid = function (newValue) {
            if (isNaN(Number(newValue)) || (Number(newValue) < 1 && newValue != "") || Number(newValue) > 1000) {
                return true;
            }
            return false;
        };
        this.setState({
            numLines: newValue,
            numLinesErrorMessage: isNumberInvalid(newValue) ? this.props.strings.numberOfLinesNotValid : ""
        })
    }

    @autobind
    private _richTextChanged(checked: boolean) {
        this.setState({
            richText: checked
        });
    }

    @autobind
    private _appendOnlyChanged(checked: boolean) {
        this.setState({
            appendOnly: checked,
            appendOnlyErrorMessage: (!this.props.enableVersions && checked == true) ? this.props.strings.appendOnlyNotValid : ""
        });
    }
}