import * as React from 'react';
import { BaseComponent, autobind } from 'office-ui-fabric-react/lib/Utilities';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { IMoreOptionsComponent, IMoreOptionsComponentSchemaValues } from './IMoreOptionsComponent';
import { IColumnManagementPanelStrings } from '../../../../containers/columnManagementPanel/ColumnManagementPanelStringHelper';

export interface INumberColumnMoreOptionsProps {
  /** The minimum value allowed for the field. */
  minimumValue: string;
  /** The maximum value allowed for the field. */
  maximumValue: string;
  /** Callback to show the more options section if there is an error. */
  showMoreOptions: (callback?: () => void) => void;
  /** Collection of localized strings to show in the create column panel UI. */
  strings: IColumnManagementPanelStrings;
  /** Callback to clear the validate more options boolean. */
  clearValidateMoreOptions: () => void;
  /** Whether to validate the more options section, confirming that the minimum value is smaller than the maximum value. */
  validateMoreOptions?: boolean;
}

export interface INumberColumnMoreOptionsState {
  minValue: string;
  maxValue: string;
  minValueErrorMessage: string;
  maxValueErrorMessage: string;
}

export class NumberColumnMoreOptions extends BaseComponent<INumberColumnMoreOptionsProps, INumberColumnMoreOptionsState> implements IMoreOptionsComponent {
  private _minValue: TextField;
  private _maxValue: TextField;

  constructor(props) {
    super(props);
    this.state = {
      minValue: this.props.minimumValue,
      maxValue: this.props.maximumValue,
      minValueErrorMessage: "",
      maxValueErrorMessage: ""
    };
  }

  public componentWillReceiveProps(nextProps) {
    if (nextProps.validateMoreOptions) {
      if (this.state.minValue && this.state.maxValue && (Number(this.state.minValue) > Number(this.state.maxValue))) {
        this.setState({ minValueErrorMessage: this.props.strings.minimumLargerThanMaximum });
      }
    }
  }

  public render() {
    let strings = this.props.strings;
    return (
      <div className='ms-ColumnManagementPanel-numberMoreOptions'>
        <TextField className='ms-ColumnManagementPanel-minimumValue'
          label={ strings.minimumValueLabel }
          ariaLabel={ strings.minimumValueAriaLabel }
          placeholder={ strings.enterNumberPlaceholder }
          value={ this.state.minValue }
          onChanged={ this._minValueChanged }
          errorMessage={ this.state.minValueErrorMessage }
          ref={ this._resolveRef('_minValue') } />
        <TextField className='ms-ColumnManagementPanel-maximumValue'
          label={ strings.maximumValueLabel }
          ariaLabel={ strings.maximumValueAriaLabel }
          placeholder={ strings.enterNumberPlaceholder }
          value={ this.state.maxValue }
          onChanged={ this._maxValueChanged }
          errorMessage={ this.state.maxValueErrorMessage }
          ref={ this._resolveRef('_maxValue') } />
      </div>
    );
  }

  @autobind
  public getSchemaValues(): IMoreOptionsComponentSchemaValues | false {
    if (this.state.minValueErrorMessage) {
      this.props.showMoreOptions(() => this._minValue.focus());
    } else if (this.state.maxValueErrorMessage) {
      this.props.showMoreOptions(() => this._maxValue.focus());
    } else if (this.state.minValue && this.state.maxValue && (Number(this.state.minValue) > Number(this.state.maxValue))) {
      this.props.showMoreOptions(() => this._minValue.focus());
    } else {
      return {
        Min: this.state.minValue !== "" ? Number(this.state.minValue) : null,
        Max: this.state.maxValue !== "" ? Number(this.state.maxValue) : null
      };
    }
    return false;
  }

  @autobind
  private _minValueChanged(newValue: string) {
    if (this.props.validateMoreOptions) {
      this.props.clearValidateMoreOptions && this.props.clearValidateMoreOptions();
    }
    this.setState({
      minValue: newValue,
      minValueErrorMessage: isNaN(Number(newValue)) ? this.props.strings.minimumValueNotValid : ""
    });
  }

  @autobind
  private _maxValueChanged(newValue: string) {
    if (this.props.validateMoreOptions) {
      this.props.clearValidateMoreOptions && this.props.clearValidateMoreOptions();
    }
    this.setState({
      maxValue: newValue,
      maxValueErrorMessage: isNaN(Number(newValue)) ? this.props.strings.maximumValueNotValid : ""
    });
  }
}