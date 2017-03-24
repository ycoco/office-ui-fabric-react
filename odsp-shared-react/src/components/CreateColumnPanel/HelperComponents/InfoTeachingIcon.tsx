// OneDrive:IgnoreCodeCoverage

import * as React from 'react';
import { TeachingBubble } from 'office-ui-fabric-react/lib/TeachingBubble';
import { DirectionalHint } from 'office-ui-fabric-react/lib/Callout';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import { autobind, BaseComponent } from 'office-ui-fabric-react/lib/Utilities';

export interface IInfoTeachingIconProps {
  /** If provided, additional class name to the root element. */
  className?: string;
  /** Text to go alongside the icon. */
  label?: string;
  /** Aria label for the info button. */
  infoButtonAriaLabel: string;
  /** Informative text for the teaching bubble. */
  teachingBubbleContent: string;
}

export interface IInfoTeachingIconState {
  /** Whether the teaching bubble callout is open. */
  isTeachingBubbleOpen: boolean;
}

/** Checkbox with label and info icon that opens teaching bubble. */
export class InfoTeachingIcon extends BaseComponent<IInfoTeachingIconProps, IInfoTeachingIconState> {
    private _infoButton: HTMLElement;

    constructor(props: IInfoTeachingIconProps) {
      super(props);
      this.state = {
        isTeachingBubbleOpen: false
      };
    }

    public render() {
      let calloutProps = {
            beakWidth: 16,
            gapSpace: 0,
            setInitialFocus: true,
            doNotLayer: false,
            directionalHint: DirectionalHint.topCenter,
            onDismiss: this._showHideTeachingBubble
        };

      return(
        <div className={ this.props.className ? `${this.props.className} ms-CreateColumnPanel-infoTeachingIcon` : 'ms-CreateColumnPanel-InfoTeachingIcon' }>
          { this.props.label ?
          <span className='ms-CreateColumnPanel-infoLabel'>{this.props.label}</span> : null }
          <span className='ms-CreateColumnPanel-infoIconContainer' ref={ this._resolveRef('_infoButton') }>
              <IconButton className='ms-CreateColumnPanel-infoIcon' icon='Info' ariaLabel={ this.props.infoButtonAriaLabel } onClick={ this._showHideTeachingBubble }/>
          </span>
          { this.state.isTeachingBubbleOpen ?
              <TeachingBubble targetElement={ this._infoButton } calloutProps={ calloutProps }>
                  { this.props.teachingBubbleContent }
              </TeachingBubble> : null }
        </div>
      );
    }

    @autobind
    private _showHideTeachingBubble() {
        this.setState((prevState: IInfoTeachingIconState) => ({
            isTeachingBubbleOpen: !prevState.isTeachingBubbleOpen
        }));
    }
}