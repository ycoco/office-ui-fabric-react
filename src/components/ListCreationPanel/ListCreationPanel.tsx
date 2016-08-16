import * as React from 'react';
import { IListCreationPanelProps } from './ListCreationPanel.Props';
import { Panel, PanelType } from 'office-ui-fabric-react/lib/Panel';
import { Button, ButtonType } from 'office-ui-fabric-react/lib/Button';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { Checkbox } from 'office-ui-fabric-react/lib/Checkbox';
import './ListCreationPanel.scss';

export interface IListCreationPanelState {
  listTitle?: string;
  listDescription?: string;
  showInQuickLaunch?: boolean;
  createButtonDisabled?: boolean;
}

export class ListCreationPanel extends React.Component<IListCreationPanelProps, IListCreationPanelState> {
  public static defaultProps = {
    panelProps: {
        type: PanelType.smallFixedFar
    },
    showInQuickLaunchDefault: true
  };

  public refs: {
    [key: string]: React.ReactInstance,
    listTitleInput: TextField,
    listDescriptionInput: TextField
  };

  constructor(props: IListCreationPanelProps) {
    super(props);
    this.state = {
      showInQuickLaunch: this.props.showInQuickLaunchDefault,
      createButtonDisabled: true
    };
    this._onCreateClick = this._onCreateClick.bind(this);
    this._onCancelClick = this._onCancelClick.bind(this);
    this._onListTitleChanged = this._onListTitleChanged.bind(this);
    this._onListDescriptionChanged = this._onListDescriptionChanged.bind(this);
    this._onShowInQuickLaunchChanged = this._onShowInQuickLaunchChanged.bind(this);
  }

  public render() {
    let { panelDescription,
          nameFieldLabel,
          nameFieldPlaceHolder,
          descriptionFieldLabel,
          descriptionFieldPlaceHolder,
          errorMessage
        } = this.props;

    let { showInQuickLaunch,
          listTitle,
          listDescription,
          createButtonDisabled } = this.state;

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
        placeholder={ nameFieldPlaceHolder }
        ref='listTitleInput'
        ariaLabel={ nameFieldPlaceHolder }
        onChanged={ this._onListTitleChanged }
       />
    );

    const listDescriptionTextField = (
      <TextField
        placeholder={ descriptionFieldPlaceHolder }
        ref='listDescriptionInput'
        ariaLabel={ descriptionFieldPlaceHolder }
        multiline={ true }
        resizable={ false }
        onChanged={ this._onListDescriptionChanged }
       />
    );

    return (
        <Panel
          className='ms-ListCreationPanel'
          { ...this.props.panelProps }
        >
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
          <Checkbox className='ms-ListCreationPanel-Checkbox'/>
          <div className='ms-ListCreationPanel-ErrorMessage'> { errorMessage ? errorMessage : null } </div>
          <div className='ms-ListCreationPanel-Buttons'>
            { create }
            { cancel }
          </div>
        </Panel>);
  }

  private _onCreateClick(listTitle: string, listDescription: string, showInQuickLaunch: boolean, ev: React.MouseEvent) {
    if (this.props.onCreate.onCreateAction) {
      this.props.onCreate.onCreateAction(listTitle, listDescription, showInQuickLaunch, ev);
      ev.stopPropagation();
      ev.preventDefault();
    }
  }

  private _onCancelClick(ev: React.MouseEvent) {
    if (this.props.onCancel.onCancelAction) {
      this.props.onCancel.onCancelAction(ev);
      ev.stopPropagation();
      ev.preventDefault();
    }
  }

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

  private _onListDescriptionChanged() {
    let listDescriptionText = this.refs.listDescriptionInput;
    let currentText = listDescriptionText.value;

    if (this.state.listDescription !== currentText) {
      this.setState({
        listDescription: currentText
      });
    }
  }

  private _onShowInQuickLaunchChanged() {
    this.setState({
      showInQuickLaunch: !this.state.showInQuickLaunch
    });
  }
}
