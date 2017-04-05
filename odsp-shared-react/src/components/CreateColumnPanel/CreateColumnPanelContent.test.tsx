import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as ReactTestUtils from 'react-addons-test-utils';
import * as TestUtils from '../../containers/createColumnPanel/test/index';
import * as Utilities from '../../utilities/index';
import * as sinon from 'sinon';

import { CreateColumnPanelContent, ICreateColumnPanelContentProps } from './index';

const expect: Chai.ExpectStatic = chai.expect;

describe('CreateColumnPanelContent', () => {
  let component;
  let renderedDOM;
  let updateSaveDisabled = sinon.spy();
  let onClearError = sinon.spy();
  let createColumnPanelContentProps: ICreateColumnPanelContentProps = {
    strings: TestUtils.stringFactory(TestUtils.strings),
    onClearError: onClearError,
    updateSaveDisabled: updateSaveDisabled,
    duplicateColumnName: false,
    currentLanguage: 1033
  };

  before(() => {
    component = ReactTestUtils.renderIntoDocument(
      <CreateColumnPanelContent {...createColumnPanelContentProps} />
    );
    renderedDOM = ReactDOM.findDOMNode(component as React.ReactInstance);
  });

  it('should register name and choice inputs', () => {
    const name: string = 'Test';
    const choice: string = 'Red';
    const nameEvent: EventTarget = { value: name } as HTMLInputElement;
    const choiceEvent: EventTarget = { value: choice } as HTMLInputElement;
    const nameField: HTMLElement = renderedDOM.getElementsByClassName('ms-CreateColumnPanel-nameTextField')[0];
    const choicesField: HTMLElement = renderedDOM.getElementsByClassName('ms-CreateColumnPanel-choicesTextField')[0];
    const nameInput: HTMLInputElement = nameField.getElementsByTagName('input')[0];
    const choicesInput: HTMLTextAreaElement = choicesField.getElementsByTagName('textarea')[0];

    ReactTestUtils.Simulate.input(nameInput, { target: nameEvent });
    ReactTestUtils.Simulate.input(choicesInput, { target: choiceEvent });
    expect(nameInput.value).to.equal(name);
    expect(choicesInput.value).to.equal(choice);
    expect(component.state.choicesText).to.deep.equal(choice);
    expect(component.state.defaultValueDropdownOptions[1].text).to.deep.equal(choice);
  });

  it('should update dropdown with content of choices entry field', () => {
    const choice: string = 'Red';
    const choiceEvent: EventTarget = { value: choice } as HTMLInputElement;
    const choicesField: HTMLElement = renderedDOM.getElementsByClassName('ms-CreateColumnPanel-choicesTextField')[0];
    const choicesInput: HTMLTextAreaElement = choicesField.getElementsByTagName('textarea')[0];
    const dropdown: HTMLElement = renderedDOM.getElementsByClassName('ms-CreateColumnPanel-defaultValueDropdown')[0];

    ReactTestUtils.Simulate.input(choicesInput, { target: choiceEvent });
    ReactTestUtils.Simulate.click(dropdown);

    return Utilities.WaitForElementToExist(document, '.ms-Layer').then(() => {
      const callout = document.getElementsByClassName('ms-Layer')[0];
      const dropdownElements = callout.getElementsByClassName('ms-Dropdown-item');
      expect(dropdownElements).to.have.lengthOf(2);
      const dropdownDefault: HTMLSpanElement = dropdownElements[0].getElementsByTagName('span')[0];
      const dropdownNewVal: HTMLSpanElement = dropdownElements[1].getElementsByTagName('span')[0];
      expect(dropdownDefault.innerText).to.equal(TestUtils.stringFactory(TestUtils.strings).choiceDefaultValue);
      expect(dropdownNewVal.innerText).to.equal(choice);
      callout.parentNode.removeChild(callout);
    });
  });

  it('should render sections when more options button or column validation button is clicked', () => {
    const moreOptionsButton: HTMLElement = renderedDOM.getElementsByClassName('ms-CreateColumnPanel-moreOptionsButton')[0];
    const moreOptionsButtonDOM: HTMLButtonElement = moreOptionsButton.getElementsByTagName('button')[0];

    ReactTestUtils.Simulate.click(moreOptionsButtonDOM);

    const moreOptions: HTMLElement = renderedDOM.getElementsByClassName('ms-CreateColumnPanel-moreOptions')[0];
    const toggles: HTMLElement[] = renderedDOM.getElementsByClassName('ms-CreateColumnPanel-toggle');
    const columnValidationButton: HTMLElement = renderedDOM.getElementsByClassName('ms-CreateColumnPanel-columnValidationButton')[0];
    expect(moreOptions).to.not.be.undefined;
    expect(toggles).to.have.lengthOf(3);
    expect(columnValidationButton).to.not.be.undefined;

    const columnValidationButtonDOM: HTMLButtonElement = columnValidationButton.getElementsByTagName('button')[0];
    ReactTestUtils.Simulate.click(columnValidationButtonDOM);

    const columnValidation: HTMLElement = renderedDOM.getElementsByClassName('ms-CreateColumnPanel-columnValidation')[0];
    expect(columnValidation).to.not.be.undefined;
  });
});
