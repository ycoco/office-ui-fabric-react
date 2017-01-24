import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as ReactTestUtils from 'react-addons-test-utils';
import Promise from '@ms/odsp-utilities/lib/async/Promise';

import { ListCreationPanelContent, IListCreationPanelContentProps } from './index';

const expect: Chai.ExpectStatic = chai.expect;

describe('ListCreationPanelContent', () => {
  let component;
  let renderedDOM;
  let listCreationPanelContentProps: IListCreationPanelContentProps = {
    nameFieldLabel: 'Name',
    descriptionFieldLabel: 'Description',
    showInQuickLaunchString: 'Show in site navigation',
    spinnerString: 'Creating...',
    onCreate: {
      onCreateString: 'Create'
    },
    onCancel: {
      onCancelString: 'Cancel'
    }
  };

  function mockEvent(targetValue: string = ''): React.SyntheticEvent<HTMLElement> {
    const target: EventTarget = { value: targetValue } as HTMLInputElement;
    const event: React.SyntheticEvent<HTMLElement> = { target } as React.SyntheticEvent<HTMLElement>;
    return event;
  }

  function delay(millisecond: number): Promise<void> {
    return new Promise<void>((resolve) => setTimeout(resolve, millisecond));
  }

  before(() => {
    component = ReactTestUtils.renderIntoDocument(
      <ListCreationPanelContent {...listCreationPanelContentProps} />
    );
    renderedDOM = ReactDOM.findDOMNode(component as React.ReactInstance);
  });

  it('should render disabled Create Button', () => {
    const createButton: HTMLButtonElement = renderedDOM.getElementsByClassName('ms-ListCreationPanel-CreateButton')[0];

    expect(createButton.disabled).to.equal(component.state.createButtonDisabled);
    expect(createButton.disabled).to.equal(true);
  });

  it('should render clickable Create Button after input a name', () => {
    const inputName: string = 'Name field input';
    const createButton: HTMLButtonElement = renderedDOM.getElementsByClassName('ms-ListCreationPanel-CreateButton')[0];
    const nameField: HTMLElement = renderedDOM.getElementsByClassName('ms-ListCreationPanel-NameField')[0];
    const inputDOM: HTMLInputElement = nameField.getElementsByTagName('input')[0];

    ReactTestUtils.Simulate.change(inputDOM, mockEvent(inputName));
    expect(inputDOM.value).to.equal(inputName);
    // Delay 200 ms for the state change to reflect on UI.
    return delay(200).then(() => expect(createButton.disabled).to.equal(false));
  });

  it('should render disabled Create Button and loading spinner after Create Button clicked', () => {
    const createButton: HTMLButtonElement = renderedDOM.getElementsByClassName('ms-ListCreationPanel-CreateButton')[0];
    const nameField: HTMLElement = renderedDOM.getElementsByClassName('ms-ListCreationPanel-NameField')[0];
    const inputDOM: HTMLInputElement = nameField.getElementsByTagName('input')[0];

    function assertAfterClick(): void {
      const loadingSpinner: HTMLElement = renderedDOM.getElementsByClassName('ms-ListCreationPanel-Spinner')[0];

      expect(createButton.disabled).to.equal(true);
      expect(loadingSpinner.className).to.not.be.undefined;
    }

    function clickCreateButton() {
      ReactTestUtils.Simulate.click(createButton);
      return assertAfterClick();
    }

    // First check if the create button is disabled, if so input a value to name field.
    if (createButton.disabled) {
      ReactTestUtils.Simulate.change(inputDOM, mockEvent('Name field input'));
      // Delay 200 ms for the state change to reflect on UI.
      return delay(200).then(() => clickCreateButton());
    } else {
      return clickCreateButton();
    }
  });

  it('should check Show in site navigation by default', () => {
    const checkBoxDiv = renderedDOM.getElementsByClassName('ms-ListCreationPanel-Checkbox')[0];
    const checkBox: HTMLInputElement = checkBoxDiv.getElementsByTagName('input')[0];

    expect(checkBox.checked).to.equal(component.state.showInQuickLaunch);
    expect(checkBox.checked).to.equal(true);
    ReactTestUtils.Simulate.change(checkBox);
    // The check box should be unchecked after clicking.
    expect(checkBox.checked).to.equal(false);
  });
});