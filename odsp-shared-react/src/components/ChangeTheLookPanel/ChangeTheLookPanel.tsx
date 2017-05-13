import * as React from 'react';
import { IChangeTheLookPanelProps } from './ChangeTheLookPanel.Props';
import { Panel, PanelType } from 'office-ui-fabric-react/lib/Panel';
import { ThemeList } from '../Theme/ThemeList/ThemeList';
import { DefaultButton, BaseButton, PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { autobind, BaseComponent } from 'office-ui-fabric-react/lib/Utilities';
import { Spinner } from 'office-ui-fabric-react/lib/Spinner';
import './ChangeTheLookPanel.scss';


export class ChangeTheLookPanel extends BaseComponent<IChangeTheLookPanelProps, {}> {
  public constructor() {
    super();
  }
  public render() {
    let {
      strings,
      isOpen,
      themes,
      onThemeClick
    } = this.props
    return <Panel type={ PanelType.smallFixedFar }
      headerText={ strings.title }
      onDismiss={ this._onDismiss }
      isOpen={ isOpen }
      onRenderFooterContent={ this._renderFooterContent }
      isBlocking={ false }
      forceFocusInsideTrap={ true }
      >
      { themes && themes.length > 0 ?
        <ThemeList
          themes={ themes }
          onThemeClick={ onThemeClick }
          themeSampleText={ strings.themeSampleText }
          className={ 'sp-ChangeTheLookPanel-themeList' } />
        : <div className='sp-ChangeTheLookPanel-spinnerContainer'>  <Spinner /> </div> }

    </Panel>;
  }

  @autobind
  private _onDismiss() {
    this.props.onDismiss && this.props.onDismiss();
  }

  @autobind
  private _onSave(ev: React.MouseEvent<BaseButton>) {
    if (this.props.onSave) {
      this.props.onSave(ev);
    }
    this._onDismiss();
  }

  @autobind
  private _onCancel(ev: React.MouseEvent<BaseButton>) {
    if (this.props.onCancel) {
      this.props.onCancel(ev);
      this._onDismiss();
    }
  }

  @autobind
  private _renderFooterContent() {
    return <div>
      <div>
        <PrimaryButton
          data-automationid='changethelookpanel-savebutton'
          onClick={ this._onSave }
          className={ 'sp-ChangeTheLookPanel-footerButton' }
          disabled={ !this.props.saveEnabled }>
          { this.props.strings.saveButton }
        </PrimaryButton>
        <DefaultButton
          data-automationid='changethelookpanel-cancelbutton'
          onClick={ this._onCancel }
          className={ 'sp-ChangeTheLookPanel-footerButton' }>
          { this.props.strings.cancelButton }
        </DefaultButton>
      </div>
      <div className={ 'sp-ChangeTheLookPanel-footerLinkContainer' }>
        <Link
          className={ 'sp-ChangeTheLookPanel-footerLink' }
          href={ this.props.changeTheLookPageLink } >
          { this.props.strings.changeTheLookPageLinkText }
        </Link>
      </div >
    </div >;
  }

}

export default ChangeTheLookPanel;
