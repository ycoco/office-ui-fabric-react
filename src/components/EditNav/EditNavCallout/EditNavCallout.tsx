import * as React from 'react';
import './EditNavCallout.scss';
import { IEditNavCalloutProps } from './EditNavCallout.Props';
import { Callout, DirectionalHint } from 'office-ui-fabric-react/lib/components/Callout/index';
import { Button, ButtonType } from 'office-ui-fabric-react/lib/components/Button/index';
import { TextField } from 'office-ui-fabric-react/lib/components/TextField/index';
import { FocusZone, FocusZoneDirection } from 'office-ui-fabric-react/lib/FocusZone';
import 'office-ui-fabric-react/lib/components/Callout/Callout.scss';

export class EditNavCallout extends React.Component<any, any> {
  private _addressInput: TextField;
  private _displayInput: TextField;

  public constructor(props: IEditNavCalloutProps) {
    super(props);

    this.state = {
      address: this.props.addressValue || '',
      display: this.props.displayValue || '',
      isValidUrl: true
    };

    this._validateUrlInput = this._validateUrlInput.bind(this);
    this._onTextFieldBlur = this._onTextFieldBlur.bind(this);
    this._onOkClick = this._onOkClick.bind(this);
  }

  public render() {
    let isButtonDisabled = !this.state.address || !this.state.display || !this.state.isValidUrl;

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
            <div className='ms-Callout-header ms-Callout-title'>
               { this.props.title }
            </div>
            <div className='ms-Callout-inner ms-Callout-content'>
              <TextField label={ this.props.addressLabel }
                          placeholder={ this.props.addressPlaceholder }
                          ariaLabel={ this.props.addressLabel }
                          ref={(el) => { this._addressInput = el; }}
                          value={ this.state.address }
                          onChanged={ (address) => this.setState({ address }) }
                          onBlur={ this._onTextFieldBlur }
                          errorMessage={ this.state.isValidUrl ? '' : this.props.errorMessage }
                          />
              <TextField label={ this.props.displayLabel }
                          placeholder={ this.props.displayPlaceholder }
                          ariaLabel={ this.props.displayLabel }
                          ref={(el) => { this._displayInput = el; }}
                          value={ this.state.display }
                          onChanged={ (display) => this.setState({ display }) }
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

  private _onTextFieldBlur(ev: React.FocusEvent) {
    this._validateUrlInput();
  }

  private _validateUrlInput() {
    let urlVal = this._addressInput.value;

    let a = document.createElement('a');
    a.href = urlVal;
    this.setState({ isValidUrl: a.host !== '' });
  }

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
