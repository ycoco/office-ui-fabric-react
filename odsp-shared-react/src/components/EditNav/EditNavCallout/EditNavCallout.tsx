import * as React from 'react';
import './EditNavCallout.scss';
import { IEditNavCalloutProps } from './EditNavCallout.Props';
import { Callout, DirectionalHint } from 'office-ui-fabric-react/lib/components/Callout/index';
import { Button, ButtonType } from 'office-ui-fabric-react/lib/components/Button/index';
import { TextField } from 'office-ui-fabric-react/lib/components/TextField/index';
import { FocusZone, FocusZoneDirection } from 'office-ui-fabric-react/lib/FocusZone';
import { autobind } from 'office-ui-fabric-react/lib/utilities/autobind';
import 'office-ui-fabric-react/lib/components/Callout/Callout.scss';

export class EditNavCallout extends React.Component<any, any> {
  private _addressInput: TextField;
  private _displayInput: TextField;

  public constructor(props: IEditNavCalloutProps) {
    super(props);

    this.state = {
      address: this.props.addressValue || this.props.addressPlaceholder,
      display: this.props.displayValue || ''
    };
  }

  public render() {
    let isButtonDisabled = !this.state.address || !this.state.display;

    return (
        <FocusZone direction={ FocusZoneDirection.vertical }>
          <Callout
            targetElement={ this.props.targetElement }
            className='ms-EditNavCallout'
            isBeakVisible={ true }
            beakWidth={ 15 }
            gapSpace={ 0 }
            directionalHint={ DirectionalHint.rightCenter }
            >
            <div className='ms-Callout-header ms-Callout-title editNav-Callout-header editNav-Callout-title'>
               { this.props.title }
            </div>
            <div className='ms-Callout-inner ms-Callout-content editNav-Callout-inner'>
              <TextField label={ this.props.addressLabel }
                          initialValue={ this.props.addressPlaceholder }
                          ariaLabel={ this.props.addressLabel }
                          ref={(el) => { this._addressInput = el; } }
                          onChanged={ (address) => this.setState({ address }) }
                          value={ this.state.address }
                          required
                          />
              <TextField label={ this.props.displayLabel }
                          placeholder={ this.props.displayPlaceholder }
                          ariaLabel={ this.props.displayLabel }
                          ref={(el) => { this._displayInput = el; }}
                          value={ this.state.display }
                          onChanged={ (display) => this.setState({ display }) }
                          required
                          />
              <div className='ms-EditNavCallout-buttonArea'>
                <Button disabled={ isButtonDisabled }
                        buttonType={ ButtonType.primary }
                        onClick={ this._onOkClick }
                        >
                  { this.props.okLabel }
                </Button>
                <Button onClick={ this.props.onCancelClicked }>
                  { this.props.cancelLabel }
                </Button>
              </div>
            </div>
          </Callout>
        </FocusZone>
    );
  }

  @autobind
  private _onOkClick(ev: React.MouseEvent) {
    if (!this._addressInput || !this._displayInput) {
      return;
    }

    let address: string = this._addressInput.value;
    let display: string = this._displayInput.value;

    this.props.onOKClicked(address, display);
    ev.stopPropagation();
    ev.preventDefault();
  }
}
