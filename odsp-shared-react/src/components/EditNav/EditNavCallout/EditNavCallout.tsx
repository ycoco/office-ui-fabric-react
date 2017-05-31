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
import { Engagement } from '@ms/odsp-utilities/lib/logging/events/Engagement.event';

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
  /** selectedOptionIndex of in optional dropdown list for engagement use. */
  selectedOptionIndex?: number;
  /** Address field disable state. */
  addressDisabled?: boolean;
}

export class EditNavCallout extends React.Component<IEditNavCalloutProps, IEditNavCalloutState> {
  private _openInNewTab: boolean;
  private _isTestPass: boolean;
  private _showDropdown: boolean;

  public constructor(props: IEditNavCalloutProps) {
    super(props);

    this.state = {
      address: this.props.addressValue || '',
      display: this.props.displayValue || '',
      selectedKey: undefined,
      selectedOptionIndex: undefined,
      addressDisabled: this.props.linkToLinks && this.props.linkToLinks.length > 0
    };
    this._openInNewTab = false;
    this._showDropdown = this.props.linkToLinks && this.props.linkToLinks.length > 0;
    this._isTestPass = (location.search.indexOf('TabTest=1') !== -1);
  }

  public render() {
    let isButtonDisabled = this._isOKDisabled() && !this._isTestPass;
   
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
            { (this._showDropdown ?
            <Dropdown
              options={ this._getOptionFromNavLink(this.props.linkToLinks) }
              selectedKey={ this.state.selectedKey }
              onChanged={ this._onOptionChanged }
              placeHolder={ this.props.linkToLabel }
            /> : null) }
            <TextField label={ this.props.addressLabel }
              placeholder={ this.props.addressPlaceholder }
              ariaLabel={ this.props.addressLabel }
              onChanged={ (address) => this.setState({ address: address }) }
              value={ this.state.address }
              disabled={ Boolean(this.state.addressDisabled) }
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

  private _isOKDisabled(): boolean {
    if (!this.state.address ||
      this.state.address === this.props.addressPlaceholder ||
      !this.state.address.trim() ||
      !this.state.display ||
      !this.state.display.trim()) {
      return true;
    }
    return false;
  }

  private _getOptionFromNavLink(links: INavLink[]): IDropdownOption[] {
    let options: IDropdownOption[] = [];
    let idx: number = 0;
    if (links) {
      options = links.filter((link: INavLink) => (link.name))
        .map((link: INavLink) => ({
            key: link.url,
            text: link.name,
            index: idx++
      }));
    }
    return options;
  }

  private _getEngagementName(idx: number): string {
    if (this._showDropdown) {
      return this.props.linkToLinks[idx].engagementName;
    }
    return '';
  }

  private _setEngagementLogData() {
    if (this.props.insertMode === 1) {
      Engagement.logData({ name: 'EditNav.AddLink' });
    } else {
      Engagement.logData({ name: 'EditNav.EditLink' });
    }

    // check if or what o365 resource is used
    if (this._showDropdown) {
      Engagement.logData({ name: 'EditNav.AddLink.Option.' + this._getEngagementName(this.state.selectedOptionIndex) });
    }
  }

  @autobind
  private _onOkClick(ev: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) {
    if (this._isTestPass) {
      this.props.onOKClicked('http://bing.com', 'TestLink', this._openInNewTab);
    } else {
      this._setEngagementLogData();
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
                    display: (option.key === this.props.addressPlaceholder) ? '' : option.text,
                    selectedKey: option.key as string,
                    selectedOptionIndex: option.index as number,
                    addressDisabled: option.text !== 'URL'
                });
  }
}
