import * as React from 'react';
import { IListCreationPanelContentProps } from './ListCreationPanel.Props';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { Checkbox } from 'office-ui-fabric-react/lib/Checkbox';
import { Spinner } from 'office-ui-fabric-react/lib/Spinner';
import { autobind, KeyCodes, BaseComponent } from 'office-ui-fabric-react/lib/Utilities';
import './ListCreationPanel.scss';

export interface IListCreationPanelContentState {
  listTitle?: string;
  listDescription?: string;
  showInQuickLaunch?: boolean;
  createButtonDisabled?: boolean;
  showLoadingSpinner?: boolean;
}

export class ListCreationPanelContent extends BaseComponent<IListCreationPanelContentProps, IListCreationPanelContentState> {
  public static defaultProps = {
    showInQuickLaunchDefault: true
  };

  private _listTitleInput: TextField;
  private _listDescriptionInput: TextField;

  constructor(props: IListCreationPanelContentProps) {
    super(props);
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
      <PrimaryButton
        className='ms-ListCreationPanel-CreateButton'
        disabled={ createButtonDisabled }
        ariaLabel = { this.props.onCreate.onCreateString }
        onClick={ this._onCreateClick.bind(this, listTitle, listDescription, showInQuickLaunch) }
        onKeyDown={ this._onKeyDown.bind(this) }>
        { this.props.onCreate.onCreateString }
      </PrimaryButton>
    );

    const cancel = (
      <DefaultButton
        className='ms-ListCreationPanel-CancelButton'
        ariaLabel = { this.props.onCancel.onCancelString }
        onClick={ this._onCancelClick.bind(this) }>
        { this.props.onCancel.onCancelString }
      </DefaultButton>
    );

    const listTitleTextField = (
      <TextField
        className='ms-ListCreationPanel-NameField'
        placeholder={ nameFieldPlaceHolder }
        ref={ this._resolveRef('_listTitleInput') }
        ariaLabel={ nameFieldPlaceHolder }
        onChanged={ this._onListTitleChanged }
       />
    );

    const listDescriptionTextField = (
      <TextField
        className='ms-ListCreationPanel-DescriptionField'
        placeholder={ descriptionFieldPlaceHolder }
        ref={ this._resolveRef('_listDescriptionInput') }
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
    let listTitleText = (this._listTitleInput && this._listTitleInput.value) ? this._listTitleInput.value.trim() : '';

    if (listTitleText && this.state.listTitle !== listTitleText) {
      this.setState({
        createButtonDisabled: false,
        listTitle: listTitleText
      });
    } else if (listTitleText && this.state.listTitle === listTitleText) {
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
    let listDescriptionText = (this._listDescriptionInput && this._listDescriptionInput.value) ? this._listDescriptionInput.value : '';

    if (this.state.listDescription !== listDescriptionText) {
      this.setState({
        listDescription: listDescriptionText
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
