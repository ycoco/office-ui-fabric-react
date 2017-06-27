import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as Utilities from '../../../../utilities/index';
import * as ReactTestUtils from 'react-addons-test-utils';
import * as sinon from 'sinon';

import { ChoiceColumnUniqueFields, IChoiceColumnUniqueFieldsProps } from './index';
import { MockColumnManagementPanelStrings, fillInColumnManagementPanelStrings } from '../../../../containers/columnManagementPanel/index';

const expect: Chai.ExpectStatic = chai.expect;

describe('ChoiceColumnUniqueFields', () => {
  let component;
  let renderedDOM;
  let updateSaveDisabled = sinon.spy();
  let strings = fillInColumnManagementPanelStrings(MockColumnManagementPanelStrings as {});
  let choiceColumnUniqueFieldsProps: IChoiceColumnUniqueFieldsProps = {
    strings: strings,
    choicesText: "Red\nBlue\nGreen",
    defaultFormula: "",
    defaultValue: { key: 1, text: "Blue" },
    useCalculatedDefaultValue: false,
    fillInChoice: true,
    formulaLearnMoreLink: "mocklink",
    updateSaveDisabled: updateSaveDisabled
  };

  describe('Select default from dropdown', () => {

    before(() => {
      component = ReactTestUtils.renderIntoDocument(
        <ChoiceColumnUniqueFields { ...choiceColumnUniqueFieldsProps } />
      );
      renderedDOM = ReactDOM.findDOMNode(component as React.ReactInstance);
    });

    it('should update dropdown with content of choices entry field', () => {
      const dropdown: HTMLElement = renderedDOM.getElementsByClassName('ms-ColumnManagementPanel-defaultValueDropdown')[0];
      expect((dropdown.querySelector('.ms-Dropdown-title') as HTMLElement).textContent).to.equal("Blue");
      ReactTestUtils.Simulate.click(dropdown);

      return Utilities.WaitForElementToExist(document, '.ms-Layer').then(() => {
        const callout = document.getElementsByClassName('ms-Layer')[0];
        const dropdownElements = callout.getElementsByClassName('ms-Dropdown-item');
        expect(dropdownElements).to.have.lengthOf(4);
        const dropdownDefault: HTMLSpanElement = dropdownElements[0].getElementsByTagName('span')[0];
        const dropdownRed: HTMLSpanElement = dropdownElements[1].getElementsByTagName('span')[0];
        const dropdownBlue: HTMLSpanElement = dropdownElements[2].getElementsByTagName('span')[0];
        const dropdownGreen: HTMLSpanElement = dropdownElements[3].getElementsByTagName('span')[0];
        expect(dropdownDefault.innerText).to.equal(strings.choiceDefaultValue);
        expect(dropdownRed.innerText).to.equal("Red");
        expect(dropdownBlue.innerText).to.equal("Blue");
        expect(dropdownGreen.innerText).to.equal("Green");
        ReactTestUtils.Simulate.click(dropdown);
      });
    });

    it('should register choice input', () => {
      const choice: string = 'Giraffe';
      const choiceEvent: EventTarget = { value: choice } as HTMLInputElement;
      const choicesField: HTMLElement = renderedDOM.getElementsByClassName('ms-ColumnManagementPanel-choicesTextField')[0];
      const choicesInput: HTMLTextAreaElement = choicesField.getElementsByTagName('textarea')[0];

      ReactTestUtils.Simulate.input(choicesInput, { target: choiceEvent });
      expect(choicesInput.value).to.equal(choice);

      const dropdown: HTMLElement = renderedDOM.getElementsByClassName('ms-ColumnManagementPanel-defaultValueDropdown')[0];
      expect((dropdown.querySelector('.ms-Dropdown-title') as HTMLElement).textContent).to.equal(strings.choiceDefaultValue);
      ReactTestUtils.Simulate.click(dropdown);

      return Utilities.WaitForElementToExist(document, '.ms-Layer').then(() => {
        const callout = document.getElementsByClassName('ms-Layer')[0];
        const dropdownElements = callout.getElementsByClassName('ms-Dropdown-item');
        expect(dropdownElements).to.have.lengthOf(2);
        ReactTestUtils.Simulate.click(dropdown);
      });
    });

    it('should respond to use calculated default value being checked', () => {
      const useCalculatedDefaultValue: HTMLElement = renderedDOM.getElementsByClassName('ms-ColumnManagementPanel-useCalculatedValue')[0];
      const checkBox: HTMLInputElement = useCalculatedDefaultValue.getElementsByClassName('ms-Checkbox')[0].getElementsByTagName('input')[0];
      const defaultValueDropdown: HTMLElement = renderedDOM.getElementsByClassName('ms-ColumnManagementPanel-defaultValueDropdown')[0];
      const defaultValueEntryField: HTMLElement = renderedDOM.getElementsByClassName('ms-ColumnManagementPanel-defaultValueEntryField')[0];

      expect(checkBox.checked).to.be.false;
      expect(defaultValueDropdown).to.exist;
      expect(defaultValueEntryField).to.not.exist;
      ReactTestUtils.Simulate.change(checkBox);
      expect(checkBox.checked).to.be.true;
    });
  });

  describe('Enter default as formula', () => {
    before(() => {
      choiceColumnUniqueFieldsProps.useCalculatedDefaultValue = true;
      choiceColumnUniqueFieldsProps.defaultFormula = "=Today";
      component = ReactTestUtils.renderIntoDocument(
        <ChoiceColumnUniqueFields { ...choiceColumnUniqueFieldsProps } />
      );
      renderedDOM = ReactDOM.findDOMNode(component as React.ReactInstance);
    });

    it('should register default formula input', () => {
      const useCalculatedDefaultValue: HTMLElement = renderedDOM.getElementsByClassName('ms-ColumnManagementPanel-useCalculatedValue')[0];
      const checkBox: HTMLInputElement = useCalculatedDefaultValue.getElementsByClassName('ms-Checkbox')[0].getElementsByTagName('input')[0];
      const defaultValueDropdown: HTMLElement = renderedDOM.getElementsByClassName('ms-ColumnManagementPanel-defaultValueDropdown')[0];
      const defaultValueEntryField: HTMLElement = renderedDOM.getElementsByClassName('ms-ColumnManagementPanel-defaultValueEntryField')[0];
      const defaultValueInput: HTMLInputElement = defaultValueEntryField.getElementsByTagName('input')[0];
      const defaultValueEvent: EventTarget = { value: "Hello" } as HTMLInputElement;

      expect(checkBox.checked).to.be.true;
      expect(defaultValueDropdown).to.not.exist;
      expect(defaultValueEntryField).to.exist;
      expect(defaultValueInput.value).to.equal("=Today");
      ReactTestUtils.Simulate.input(defaultValueInput, { target: defaultValueEvent });
      expect(defaultValueInput.value).to.equal("Hello");
    });

    after(() => {
      // hack dismiss ms-Layer so other test that has callout will work
      let callout = document.getElementsByClassName('ms-Layer')[0];
      if (callout && callout.parentNode) {
        callout.parentNode.removeChild(callout);
      }
    });
  });
});
