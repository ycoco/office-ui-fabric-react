import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as ReactTestUtils from 'react-addons-test-utils';

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

  function mockEvent(targetValue: string = ''): ReactTestUtils.SyntheticEventData {
    const target: EventTarget = { value: targetValue } as HTMLInputElement;
    const event: ReactTestUtils.SyntheticEventData = { target };

    return event;
  }

  before(() => {
    component = ReactTestUtils.renderIntoDocument(
      <ListCreationPanelContent {...listCreationPanelContentProps} />
    );
    renderedDOM = ReactDOM.findDOMNode(component as React.ReactInstance);
  });

  it('should render disabled Create Button', () => {
    const createButton: HTMLButtonElement = renderedDOM.getElementsByClassName('ms-ListCreationPanel-CreateButton')[0];

    let isButtonDisalbed = createButton.className.indexOf('disabled') !== -1;

    expect(isButtonDisalbed).to.equal(component.state.createButtonDisabled);
    expect(isButtonDisalbed).to.equal(true);
  });

  it('should render clickable Create Button after input a name', () => {
    const inputName: string = 'Name field input';
    const createButton: HTMLButtonElement = renderedDOM.getElementsByClassName('ms-ListCreationPanel-CreateButton')[0];
    const nameField: HTMLElement = renderedDOM.getElementsByClassName('ms-ListCreationPanel-NameField')[0];
    const inputDOM: HTMLInputElement = nameField.getElementsByTagName('input')[0];

    ReactTestUtils.Simulate.input(inputDOM, mockEvent(inputName));
    expect(inputDOM.value).to.equal(inputName);
    expect(createButton.disabled).to.equal(false);
  });

  it('should render disabled Create Button and loading spinner after Create Button clicked', () => {
    const createButton: HTMLButtonElement = renderedDOM.getElementsByClassName('ms-ListCreationPanel-CreateButton')[0];
    const nameField: HTMLElement = renderedDOM.getElementsByClassName('ms-ListCreationPanel-NameField')[0];
    const inputDOM: HTMLInputElement = nameField.getElementsByTagName('input')[0];

    function assertAfterClick(): void {
      const loadingSpinner: HTMLElement = renderedDOM.getElementsByClassName('ms-ListCreationPanel-Spinner')[0];
      let isButtonDisalbed = createButton.className.indexOf('disabled') !== -1;

      expect(isButtonDisalbed).to.equal(true);
      expect(loadingSpinner.className).to.not.be.undefined;
    }

    function clickCreateButton() {
      ReactTestUtils.Simulate.click(createButton);
      return assertAfterClick();
    }

    // First check if the create button is disabled, if so input a value to name field.
    if (createButton.className.indexOf('disabled') !== -1) {
      ReactTestUtils.Simulate.input(inputDOM, mockEvent('Name field input'));
      return clickCreateButton();
    } else {
      return clickCreateButton();
    }
  });

  it('should check Show in site navigation by default', () => {
    const checkBox = renderedDOM.getElementsByClassName('ms-ListCreationPanel-Checkbox')[0];

    expect(checkBox.getAttribute('aria-checked')).to.equal(String(component.state.showInQuickLaunch));
    expect(checkBox.getAttribute('aria-checked')).to.equal('true');
    ReactTestUtils.Simulate.click(checkBox);
    // The check box should be unchecked after clicking.
    expect(checkBox.getAttribute('aria-checked')).to.equal('false');
  });
});
