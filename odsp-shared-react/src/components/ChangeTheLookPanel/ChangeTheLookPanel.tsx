import * as React from 'react';
import { IChangeTheLookPanelProps } from './ChangeTheLookPanel.Props';
import { Panel, PanelType } from 'office-ui-fabric-react/lib/Panel';
import { ThemeList } from '../Theme/ThemeList/ThemeList';
import { DefaultButton, PrimaryButton } from 'office-ui-fabric-react/lib/Button';
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
      onThemeClick,
      loading,
      errorText
    } = this.props
    const hasThemes = themes && themes.length > 0;
    return <Panel type={ PanelType.smallFixedFar }
      className='sp-ChangeTheLookPanel'
      headerText={ strings.title }
      onDismiss={ this._onDismiss }
      isOpen={ isOpen }
      onRenderFooterContent={ this._renderFooterContent }
      isBlocking={ false }
      forceFocusInsideTrap={ true }
      firstFocusableSelector={ 'sp-ThemeList-focusZone' }
    >
      { hasThemes ?
        <ThemeList
          themes={ themes }
          onThemeClick={ onThemeClick }
          themeSampleText={ strings.themeSampleText }
          className={ 'sp-ChangeTheLookPanel-themeList' }
          ariaLabel={ strings.themeListAriaNavigationInstructions } /> :
        !loading && !errorText && strings.noThemesFoundText && <div> { strings.noThemesFoundText } </div>
      }
      { loading &&
        <div className='sp-ChangeTheLookPanel-spinnerContainer'>
          <Spinner />
        </div>
      }
      {
        errorText &&
        <div>
          { errorText }
        </div>
      }

    </Panel>;
  }

  @autobind
  private _onDismiss() {
    this.props.onDismiss && this.props.onDismiss();
  }

  @autobind
  private _onSave(ev: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) {
    if (this.props.onSave) {
      this.props.onSave(ev);
    }
    this._onDismiss();
  }

  @autobind
  private _onCancel(ev: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) {
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
        <div className='sp-ChangeTheLookPanel-footerLinks'>
          <div>
            <Link className='sp-ChangeTheLookPanel-footerLink'
              href={ this.props.changeTheLookPageLink } >
              { this.props.strings.changeTheLookPageLinkText }
            </Link>
          </div>
        </div>
      </div >
    </div >;
  }

}

export default ChangeTheLookPanel;
