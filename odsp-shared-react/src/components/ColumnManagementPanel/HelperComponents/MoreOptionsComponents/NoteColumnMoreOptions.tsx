import * as React from 'react';
import { BaseComponent, autobind } from 'office-ui-fabric-react/lib/Utilities';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { IMoreOptionsComponent, IMoreOptionsComponentSchemaValues } from './IMoreOptionsComponent';
import { IColumnManagementPanelStrings } from '../../../../containers/columnManagementPanel/ColumnManagementPanelStringHelper';
export interface INoteColumnMoreOptionsProps {
  /** The number of lines shown for this field */
  numberOfLines: string;
  /** Callback to show the more options section if there is an error. */
  showMoreOptions: (callback?: () => void) => void;
  /** Collection of localized strings to show in the create column panel UI. */
  strings: IColumnManagementPanelStrings;
}

export interface INoteColumnMoreOptionsState {
    numLines: string;
    numLinesErrorMessage: string;
}

export class NoteColumnMoreOptions extends BaseComponent<INoteColumnMoreOptionsProps, INoteColumnMoreOptionsState> implements IMoreOptionsComponent {
    private _numLines: TextField;
    
    constructor(props) {
        super(props);
    }
    public render(){
        let strings = this.props.strings;
        return (
            <div className='ms-ColumnManagementPanel-textMoreOptions'>
                <TextField
                   label={ strings.numberOfLinesLabel}
                   ariaLabel={ strings.numberOfLinesAriaLabel}
                   value={ this.state.numLines}
                   onChanged={this._numLinesChanged}
                   errorMessage={ this.state.numLinesErrorMessage}
                   ref={ this._resolveRef('_numLines') } />
            </div>
        );
    }
    @autobind
    public getSchemaValues(): IMoreOptionsComponentSchemaValues | false {
        if (this.state.numLinesErrorMessage) {
            this.props.showMoreOptions(() => this._numLines.focus());
        } else {
            return {
                NumLines: this.state.numLines !== "" ? Number(this.state.numLines) : null
            };
        }
        return false;
    }
    @autobind
    private _numLinesChanged(newValue: string) {
        this.setState({
            numLines: newValue,
            numLinesErrorMessage:(isNaN(Number(newValue)) || Number(newValue) < 1) ? this.props.strings.numberOfLinesNotValid : ""
        })
    }
}