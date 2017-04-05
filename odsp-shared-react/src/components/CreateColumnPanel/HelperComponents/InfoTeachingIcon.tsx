// OneDrive:IgnoreCodeCoverage

import * as React from 'react';
import { DirectionalHint, Callout } from 'office-ui-fabric-react/lib/Callout';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import { autobind, BaseComponent } from 'office-ui-fabric-react/lib/Utilities';

export interface IInfoTeachingIconProps {
  /** If provided, additional class name to the root element. */
  className?: string;
  /** Text to go alongside the icon. */
  label?: string;
  /** Aria label for the info button. */
  infoButtonAriaLabel: string;
  /** Informative text for the callout. */
  calloutContent: string;
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
          targetElement: this._infoButton
      };

      return(
        <div className={ this.props.className ? `${this.props.className} ms-CreateColumnPanel-infoTeachingIcon` : 'ms-CreateColumnPanel-InfoTeachingIcon' }>
          { this.props.label &&
          <span className='ms-CreateColumnPanel-infoLabel'>{this.props.label}</span> }
          <span className='ms-CreateColumnPanel-infoIconContainer' ref={ this._resolveRef('_infoButton') }>
              <IconButton className='ms-CreateColumnPanel-infoIcon' icon='Info' ariaLabel={ this.props.infoButtonAriaLabel } onClick={ this._showHideCallout }/>
          </span>
          { this.state.isCalloutOpen &&
              <Callout className='ms-CreateColumnPanel-callout' { ...calloutProps }>
                <div className='ms-CreateColumnPanel-calloutInner' tabIndex={1}>
                  <p className='ms-CreateColumnPanel-calloutSubText' tabIndex={0}>
                    { this.props.calloutContent }
                  </p>
                  { this.props.helpLink &&
                  <Link className='ms-CreateColumnPanel-calloutLink' href={this.props.helpLink.href} target="_blank" tabIndex={1}>{this.props.helpLink.displayText}</Link> }
                </div>
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