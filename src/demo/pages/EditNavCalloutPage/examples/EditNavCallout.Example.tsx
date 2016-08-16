import * as React from 'react';
import { EditNavCallout } from '../../../../components/index';
import './EditNavCallout.Example.scss';

export interface IEditNavCalloutExampleState {
  isCalloutVisible: boolean;
}

export class EditNavCalloutExample extends React.Component<any, any> {
  private myLink: HTMLElement;

  public constructor() {
    super();

    this._onShowMenuClicked = this._onShowMenuClicked.bind(this);
    this.state = {
      isCalloutVisible: false
    };
  }

  public render() {
    return (
      <div className='ms-EditNavCalloutExample' >
        <div className='ms-EditNavCalloutExample-linkArea' onClick={ this._onShowMenuClicked } ref={(ref) => this.myLink = ref} >
          <span className='ms-EditNavCalloutExample-linkText' >{ this.state.isCalloutVisible ? 'Hide Callout' : 'Show Callout'}</span>
        </div>
            { this.state.isCalloutVisible ? (
                <EditNavCallout
                  targetElement={ this.myLink }
                  title={ 'Add a link' }
                  okLabel={ 'OK' }
                  cancelLabel={ 'cancel' }
                  addressLabel={ 'Address' }
                  displayLabel={ 'Text to display' }
                />
                ) : (null) }
              </div>
      );
  }

  private _onShowMenuClicked() {
    this.setState({
      isCalloutVisible: !this.state.isCalloutVisible
    });
  }
}
