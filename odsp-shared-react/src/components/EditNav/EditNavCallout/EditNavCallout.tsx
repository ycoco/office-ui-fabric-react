import * as React from 'react';
import './EditNavCallout.scss';
import { IEditNavCalloutProps } from './EditNavCallout.Props';
import { Callout, DirectionalHint } from 'office-ui-fabric-react/lib/components/Callout/index';
import { Button, ButtonType } from 'office-ui-fabric-react/lib/components/Button/index';
import { TextField } from 'office-ui-fabric-react/lib/components/TextField/index';
import { FocusTrapZone } from 'office-ui-fabric-react/lib/FocusTrapZone';
import { autobind } from 'office-ui-fabric-react/lib/Utilities';
import 'office-ui-fabric-react/lib/components/Callout/Callout.scss';
import { Checkbox } from 'office-ui-fabric-react/lib/Checkbox';
import { IDropdownOption, Dropdown } from 'office-ui-fabric-react/lib/Dropdown';
import { INavLink } from 'office-ui-fabric-react/lib/Nav';

/**
 * SP EditNav Control supports editable LeftNav Nav links
 */
export interface IEditNavCalloutState {
  /** TextField of input link address. */
  address?: string,
  /** TextField of input link display name. */
  display?: string,
  /** selectedKey of in optional dropdown list. */
  selectedKey?: string;
}

export class EditNavCallout extends React.Component<IEditNavCalloutProps, IEditNavCalloutState> {
  private _openInNewTab: boolean;
  private _isTestPass: boolean;

  public constructor(props: IEditNavCalloutProps) {
    super(props);

    this.state = {
      address: this.props.addressValue || '',
      display: this.props.displayValue || '',
      selectedKey: undefined
    };
    this._openInNewTab = false;
    this._isTestPass = (location.search.indexOf('TabTest=1') !== -1);
  }

  public render() {
    let isButtonDisabled = (!this.state.address.trim() || !this.state.display.trim()) && !this._isTestPass;
    let showDropdown = this.props.linkToLinks && this.props.linkToLinks.length > 0;

    return (
      <Callout
        targetElement={ this.props.targetElement }
        className='ms-EditNavCallout'
        isBeakVisible={ true }
        beakWidth={ 15 }
        gapSpace={ 0 }
        directionalHint={ DirectionalHint.rightCenter }
        onDismiss={ this._onCancelClick }
        setInitialFocus={ true }
        >
        <FocusTrapZone>
          <div className='ms-Callout-header ms-Callout-title editNav-Callout-header editNav-Callout-title'>
            { this.props.title }
          </div>
          <div className='ms-Callout-inner ms-Callout-content editNav-Callout-inner'>
            { (showDropdown ?
            <Dropdown
              label= { this.props.linkToLabel }
              options={ this._getOptionFromNavLink(this.props.linkToLinks) }
              selectedKey={ this.state.selectedKey }
              onChanged={ this._onOptionChanged }
              defaultSelectedKey={ this.props.defaultSelectedKey }
            /> : null) }
            <TextField label={ this.props.addressLabel }
              placeholder={ this.props.addressPlaceholder }
              ariaLabel={ this.props.addressLabel }
              onChanged={ (address) => this.setState({ address: address }) }
              value={ this.state.address }
              multiline
              required
              />
            <TextField label={ this.props.displayLabel }
              placeholder={ this.props.displayPlaceholder }
              ariaLabel={ this.props.displayLabel }
              value={ this.state.display }
              onChanged={ (display) => this.setState({ display: display }) }
              required
              />
            <Checkbox
              className='editNav-Callout-Checkbox'
              label={ this.props.openInNewTabText }
              onChange={ this._onOpenInNewTabChanged }
              checked={ this._openInNewTab } />
            <div className='ms-EditNavCallout-buttonArea'>
              <span className='ms-EditButton-container'>
                <Button disabled={ isButtonDisabled }
                  buttonType={ ButtonType.primary }
                  onClick={ this._onOkClick }
                  >
                  { this.props.okLabel }
                </Button>
              </span>
              <span className='ms-EditButton-container'>
                <Button onClick={ this._onCancelClick }>
                  { this.props.cancelLabel }
                </Button>
              </span>
            </div>
          </div>
        </FocusTrapZone>
      </Callout>
    );
  }

  private _getOptionFromNavLink(links: INavLink[]): IDropdownOption[] {
    let options: IDropdownOption[] = [];
    if (links) {
      options = links.filter((link: INavLink) => (link.name))
        .map((link: INavLink) => ({
            key: link.url,
            text: link.name
      }));
    }
    return options;
  }

  @autobind
  private _onOkClick(ev: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) {
    if (this._isTestPass) {
      this.props.onOKClicked('http://bing.com', 'TestLink', this._openInNewTab);
    } else {
      this.props.onOKClicked(this.state.address.trim(), this.state.display.trim(), this._openInNewTab);
    }

    ev.stopPropagation();
    ev.preventDefault();
  }

  @autobind
  private _onCancelClick(ev: React.MouseEvent<HTMLButtonElement>) {
    if (this.props.onCancelClicked) {
      this.props.onCancelClicked();
    }
  }

  @autobind
  private _onOpenInNewTabChanged() {
    this._openInNewTab = !this._openInNewTab;
  }

  @autobind
  private _onOptionChanged(option: IDropdownOption) {
    this.setState({ address: option.key as string,
                    display: option.text,
                    selectedKey: option.key as string });
  }
}
