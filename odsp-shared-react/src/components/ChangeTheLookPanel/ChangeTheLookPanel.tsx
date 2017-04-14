import * as React from 'react';
import { IChangeTheLookPanelProps } from './ChangeTheLookPanel.Props';
import { Panel, PanelType } from 'office-ui-fabric-react/lib/Panel';
import { ThemeList } from '../Theme/ThemeList/ThemeList';
import { Button, ButtonType, BaseButton, CommandButton } from 'office-ui-fabric-react/lib/Button';
import { autobind, BaseComponent } from 'office-ui-fabric-react/lib/Utilities';
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
    >
      <ThemeList themes={ themes } onThemeClick={ onThemeClick } themeSampleText={ strings.themeSampleText } />
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
        <Button
          buttonType={ ButtonType.default }
          onClick={ this._onSave }
          className={ 'changeTheLookPanel-footerButton' }
          disabled={ !this.props.saveEnabled }>
          { this.props.strings.saveButton }
        </Button>
        <Button
          buttonType={ ButtonType.default }
          onClick={ this._onCancel }
          className={ 'changeTheLookPanel-footerButton' }>
          { this.props.strings.cancelButton }
        </Button>
      </div>
      <CommandButton href={ this.props.changeTheLookPageLink }> { this.props.strings.changeTheLookPageLinkText } </CommandButton>
    </div>;
  }

}

export default ChangeTheLookPanel;
