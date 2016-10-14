import * as React from 'react';
import { IListCreationPanelContentProps } from './ListCreationPanel.Props';
import { Button, ButtonType } from 'office-ui-fabric-react/lib/Button';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { Checkbox } from 'office-ui-fabric-react/lib/Checkbox';
import { Spinner } from 'office-ui-fabric-react/lib/Spinner';
import { autobind } from 'office-ui-fabric-react/lib/utilities/autobind';
import './ListCreationPanel.scss';

export interface IListCreationPanelContentState {
  listTitle?: string;
  listDescription?: string;
  showInQuickLaunch?: boolean;
  createButtonDisabled?: boolean;
  showLoadingSpinner?: boolean;
}

export class ListCreationPanelContent extends React.Component<IListCreationPanelContentProps, IListCreationPanelContentState> {
  public static defaultProps = {
    showInQuickLaunchDefault: true
  };

  public refs: {
    [key: string]: React.ReactInstance,
    listTitleInput: TextField,
    listDescriptionInput: TextField
  };

  constructor(props: IListCreationPanelContentProps) {
    super(props);
    this.state = {
      showInQuickLaunch: this.props.showInQuickLaunchDefault,
      createButtonDisabled: true,
      showLoadingSpinner: false
    };
  }

  public componentWillReceiveProps(nextProps: IListCreationPanelContentProps) {
    if (nextProps.errorMessage) {
      this.setState({
        showLoadingSpinner: false,
        createButtonDisabled: false
      });
    }
  }

  public render() {
    let { panelDescription,
          nameFieldLabel,
          nameFieldPlaceHolder,
          descriptionFieldLabel,
          descriptionFieldPlaceHolder,
          showInQuickLaunchString,
          errorMessage,
          spinnerString
        } = this.props;

    let { showInQuickLaunch,
          listTitle,
          listDescription,
          createButtonDisabled,
          showLoadingSpinner } = this.state;

    const create = (
      <Button
        className='ms-ListCreationPanel-CreateButton'
        buttonType={ ButtonType.primary }
        disabled={ createButtonDisabled }
        ariaLabel = { this.props.onCreate.onCreateString }
        onClick={ this._onCreateClick.bind(this, listTitle, listDescription, showInQuickLaunch) }>
        { this.props.onCreate.onCreateString }
      </Button>
    );

    const cancel = (
      <Button
        className='ms-ListCreationPanel-CancelButton'
        buttonType={ ButtonType.normal }
        ariaLabel = { this.props.onCancel.onCancelString }
        onClick={ this._onCancelClick }>
        { this.props.onCancel.onCancelString }
      </Button>
    );

    const listTitleTextField = (
      <TextField
        className='ms-ListCreationPanel-NameField'
        placeholder={ nameFieldPlaceHolder }
        ref='listTitleInput'
        ariaLabel={ nameFieldPlaceHolder }
        onChanged={ this._onListTitleChanged }
       />
    );

    const listDescriptionTextField = (
      <TextField
        className='ms-ListCreationPanel-DescriptionField'
        placeholder={ descriptionFieldPlaceHolder }
        ref='listDescriptionInput'
        ariaLabel={ descriptionFieldPlaceHolder }
        multiline={ true }
        resizable={ false }
        onChanged={ this._onListDescriptionChanged }
       />
    );

    const quickLaunchCheckbox = (
          <Checkbox
            className='ms-ListCreationPanel-Checkbox'
            label={ showInQuickLaunchString }
            onChange={ this._onShowInQuickLaunchChanged }
            checked={ showInQuickLaunch }/>
    );

    return (
        <div className='ms-ListCreationPanelContent'>
          { panelDescription ?
            <div className='ms-ListCreationPanel-PanelDescription'>{ panelDescription }</div> : null
          }
          { nameFieldLabel ?
            <div className='ms-ListCreationPanel-NameFieldLabel'>{ nameFieldLabel }</div> : null
          }
          { listTitleTextField }
          { descriptionFieldLabel ?
            <div className='ms-ListCreationPanel-DescriptionFieldLabel'>{ descriptionFieldLabel }</div> : null
          }
          { listDescriptionTextField }
          { errorMessage ?
            <div className='ms-ListCreationPanel-ErrorMessage'>{ errorMessage }</div> : null
          }
          { quickLaunchCheckbox }
          <div className='ms-ListCreationPanel-Buttons'>
            { create }
            { cancel }
          </div>
          { showLoadingSpinner ?
            <Spinner className='ms-ListCreationPanel-Spinner' label={ spinnerString }/> : null
          }
        </div>);
  }

  @autobind
  private _onCreateClick(listTitle: string, listDescription: string, showInQuickLaunch: boolean, ev: React.MouseEvent) {
    this.setState({
      showLoadingSpinner: true,
      createButtonDisabled: true
    });
    if (this.props.onCreate.onCreateAction) {
      this.props.onCreate.onCreateAction(listTitle, listDescription, showInQuickLaunch, ev);
      ev.stopPropagation();
      ev.preventDefault();
    }
  }

  @autobind
  private _onCancelClick(ev: React.MouseEvent) {
    if (this.props.onCancel.onCancelAction) {
      this.props.onCancel.onCancelAction(ev);
      ev.stopPropagation();
      ev.preventDefault();
    }
  }

  @autobind
  private _onListTitleChanged() {
    let listTitleText = this.refs.listTitleInput;
    let currentText = listTitleText.value;
    let trimedText = currentText.trim();

    if (trimedText && this.state.listTitle !== trimedText) {
      this.setState({
        createButtonDisabled: false,
        listTitle: trimedText
      });
    } else if (trimedText && this.state.listTitle === trimedText) {
      this.setState({
        createButtonDisabled: false
      });
    } else {
      this.setState({
        createButtonDisabled: true
      });
    }
  }

  @autobind
  private _onListDescriptionChanged() {
    let listDescriptionText = this.refs.listDescriptionInput;
    let currentText = listDescriptionText.value;

    if (this.state.listDescription !== currentText) {
      this.setState({
        listDescription: currentText
      });
    }
  }

  @autobind
  private _onShowInQuickLaunchChanged() {
    this.setState({
      showInQuickLaunch: !this.state.showInQuickLaunch
    });
  }
}
