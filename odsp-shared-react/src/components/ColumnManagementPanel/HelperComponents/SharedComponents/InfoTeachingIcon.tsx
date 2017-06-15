// OneDrive:IgnoreCodeCoverage

import * as React from 'react';
import { DirectionalHint, Callout } from 'office-ui-fabric-react/lib/Callout';
import { FocusTrapZone } from 'office-ui-fabric-react/lib/FocusTrapZone';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import { autobind, BaseComponent } from 'office-ui-fabric-react/lib/Utilities';

export interface IInfoTeachingIconProps {
  /** Aria label for the info button. */
  infoButtonAriaLabel: string;
  /** Informative text for the callout. */
  calloutContent: string;
  /** If provided, additional class name to the root element. */
  className?: string;
  /** Text to go alongside the icon. */
  label?: string;
  /** Help link for the callout. */
  helpLink?: {
    displayText: string,
    href: string
  }
}

export interface IInfoTeachingIconState {
  /** Whether the teaching bubble callout is open. */
  isCalloutOpen: boolean;
}

/** Checkbox with label and info icon that opens teaching bubble. */
export class InfoTeachingIcon extends BaseComponent<IInfoTeachingIconProps, IInfoTeachingIconState> {
  private _infoButton: HTMLElement;

  constructor(props: IInfoTeachingIconProps) {
    super(props);
    this.state = {
      isCalloutOpen: false
    };
  }

  public render() {
    let calloutProps = {
      beakWidth: 16,
      gapSpace: 0,
      setInitialFocus: true,
      doNotLayer: false,
      directionalHint: DirectionalHint.topCenter,
      onDismiss: this._showHideCallout,
      target: this._infoButton,
      role: 'alertdialog',
      ariaDescribedBy: 'callout-description'
    };

    return (
      <div className={ this.props.className ? `${this.props.className} ms-ColumnManagementPanel-infoTeachingIcon` : 'ms-ColumnManagementPanel-InfoTeachingIcon' }>
        { this.props.label &&
          <span className='ms-ColumnManagementPanel-infoLabel'>{ this.props.label }</span> }
        <span className='ms-ColumnManagementPanel-infoIconContainer' ref={ this._resolveRef('_infoButton') }>
          <IconButton className='ms-ColumnManagementPanel-infoIcon'
            icon='Info'
            ariaLabel={ this.props.infoButtonAriaLabel }
            onClick={ this._showHideCallout } />
        </span>
        { this.state.isCalloutOpen &&
          <Callout className='ms-ColumnManagementPanel-callout' { ...calloutProps }>
            <FocusTrapZone>
              <div className='ms-ColumnManagementPanel-calloutInner' tabIndex={ 1 }>
                <div className='ms-ColumnManagementPanel-calloutContent'>
                  <p className='ms-ColumnManagementPanel-calloutSubText' id={ 'callout-description' }>
                    { this.props.calloutContent }
                  </p>
                </div>
                { this.props.helpLink &&
                <div className='ms-ColumnManagementPanel-calloutActions'>
                    <Link className='ms-ColumnManagementPanel-calloutLink' href={ this.props.helpLink.href } target="_blank" tabIndex={ 1 }>{ this.props.helpLink.displayText }</Link>
                </div> }
              </div>
            </FocusTrapZone>
          </Callout> }
      </div>
    );
  }

  @autobind
  private _showHideCallout() {
    this.setState((prevState: IInfoTeachingIconState) => ({
      isCalloutOpen: !prevState.isCalloutOpen
    }));
  }
}