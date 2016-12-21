import * as React from 'react';
import { IListCreationPanelContentProps } from './ListCreationPanel.Props';
import { Button, ButtonType } from 'office-ui-fabric-react/lib/Button';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { Checkbox } from 'office-ui-fabric-react/lib/Checkbox';
import { Spinner } from 'office-ui-fabric-react/lib/Spinner';
import { autobind } from 'office-ui-fabric-react/lib/utilities/autobind';
import { KeyCodes } from 'office-ui-fabric-react/lib/utilities/KeyCodes';
import { EventGroup } from 'office-ui-fabric-react/lib/utilities/eventGroup/EventGroup';
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

  private _events: EventGroup;

  constructor(props: IListCreationPanelContentProps) {
    super(props);
    this._events = new EventGroup(this);
    this.state = {
      showInQuickLaunch: this.props.showInQuickLaunchDefault,
      createButtonDisabled: true,
      showLoadingSpinner: false
    };
  }

  public componentDidMount() {

    this._events.on(window, 'keydown', this._onKeyDown.bind(this));
  }

  public componentWillReceiveProps(nextProps: IListCreationPanelContentProps) {
    if (nextProps.errorMessage) {
      this.setState({
        showLoadingSpinner: false,
        createButtonDisabled: false
      });
    }
  }

  public componentWillUnmount() {
    this._events.dispose();
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
        onClick={ this._onCreateClick.bind(this, listTitle, listDescription, showInQuickLaunch) }
        onKeyDown={ this._onKeyDown.bind(this) }>
        { this.props.onCreate.onCreateString }
      </Button>
    );

    const cancel = (
      <Button
        className='ms-ListCreationPanel-CancelButton'
        buttonType={ ButtonType.normal }
        ariaLabel = { this.props.onCancel.onCancelString }
        onClick={ this._onCancelClick.bind(this) }>
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
  private _onCreateClick(listTitle: string, listDescription: string, showInQuickLaunch: boolean, ev: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>) {
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
  private _onCancelClick(ev: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>) {
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

  @autobind
  private _onKeyDown(ev: React.KeyboardEvent<HTMLElement>) {
      if (this.state.createButtonDisabled !== true && ev.which === KeyCodes.enter) {
        let { showInQuickLaunch, listTitle, listDescription } = this.state;
        this._onCreateClick(listTitle, listDescription, showInQuickLaunch, ev);
      } else if (ev.which === KeyCodes.escape) {
        this._onCancelClick(ev);
      }

      ev.stopPropagation();
  }
}
