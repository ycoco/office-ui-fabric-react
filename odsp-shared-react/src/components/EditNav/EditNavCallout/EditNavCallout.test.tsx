
import * as React from 'react';
import * as ReactTestUtils from 'react-addons-test-utils';

import { expect } from 'chai';

import { EditNavCallout } from './EditNavCallout';

describe('EditNavCallout', () => {
  function mockEvent(targetValue: string = ''): React.SyntheticEvent<HTMLElement> {
    const target: EventTarget = { value: targetValue } as HTMLInputElement;
    const event: React.SyntheticEvent<HTMLElement> = { target } as React.SyntheticEvent<HTMLElement>;
    return event;
  }

  it('Verify EditNavCallout has 2 text input fields and ok button is active after both fields are not empty', () => {
    ReactTestUtils.renderIntoDocument(
      <EditNavCallout
        title={'Add a link'}
        okLabel={'OK'}
        cancelLabel={'cancel'}
        addressLabel={'Address'}
        displayLabel={'Text to display'}
      />
    );

    expect(document.getElementsByClassName('ms-Callout-main').length).to.equal(1);
    const inputAddress: string = 'http://bing.com';
    const inputDisplay: string = 'TestLink';

    const address: HTMLTextAreaElement = document.getElementsByTagName('textarea')[0] as HTMLTextAreaElement;
    ReactTestUtils.Simulate.input(address, mockEvent(inputAddress));
    expect(address.value).to.equal(inputAddress);

    const display: HTMLInputElement = document.getElementsByTagName('input')[0] as HTMLInputElement;
    ReactTestUtils.Simulate.input(display, mockEvent(inputDisplay));
    expect(display.value).to.equal(inputDisplay);

    const buttonArea: HTMLElement = document.getElementsByClassName('ms-EditNavCallout-buttonArea')[0] as HTMLElement;
    expect(buttonArea.getElementsByTagName('button').length).to.equal(2);
    const cancel: HTMLButtonElement = buttonArea.getElementsByTagName('button')[1] as HTMLButtonElement;
    cancel.click();

    // hack dismiss ms-Layer so other test that has popup would workd
    let callout = document.getElementsByClassName('ms-Layer')[0];
    callout.parentNode.removeChild(callout);
  });
})
