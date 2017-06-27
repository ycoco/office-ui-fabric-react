import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as Utilities from '../../../../utilities/index';
import * as ReactTestUtils from 'react-addons-test-utils';

import { NumberColumnUniqueFields, INumberColumnUniqueFieldsProps } from './index';
import { MockColumnManagementPanelStrings, fillInColumnManagementPanelStrings } from '../../../../containers/columnManagementPanel/index';

const expect: Chai.ExpectStatic = chai.expect;

describe('NumberColumnUniqueFields', () => {
  let component;
  let renderedDOM;
  let strings = fillInColumnManagementPanelStrings(MockColumnManagementPanelStrings as {});
  let numberColumnUniqueFieldsProps: INumberColumnUniqueFieldsProps = {
    strings: strings,
    useCalculatedDefaultValue: false,
    defaultFormula: "",
    defaultValue: "",
    showAsPercentage: true,
    displayFormat: 3,
    formulaLearnMoreLink: "testlink"
  };

  before(() => {
    component = ReactTestUtils.renderIntoDocument(
      <NumberColumnUniqueFields { ...numberColumnUniqueFieldsProps } />
    );
    renderedDOM = ReactDOM.findDOMNode(component as React.ReactInstance);
  });

  it('should parse display format', () => {
    const showAsPercentage: HTMLElement = renderedDOM.getElementsByClassName('ms-ColumnManagementPanel-showAsPercentageCheckbox')[0];
    const showAsPercentageCheckbox: HTMLInputElement = showAsPercentage.getElementsByTagName('input')[0];
    const dropdown: HTMLElement = renderedDOM.getElementsByClassName('ms-ColumnManagementPanel-decimalsDropdown')[0];
    expect(showAsPercentageCheckbox.checked).to.be.true;
    expect((dropdown.querySelector('.ms-Dropdown-title') as HTMLElement).textContent).to.equal("3");
    ReactTestUtils.Simulate.click(dropdown);

    return Utilities.WaitForElementToExist(document, '.ms-Layer').then(() => {
      const callout = document.getElementsByClassName('ms-Layer')[0];
      const dropdownElements = callout.getElementsByClassName('ms-Dropdown-item');
      expect(dropdownElements).to.have.lengthOf(7);
      const dropdownAutomatic: HTMLSpanElement = dropdownElements[0].getElementsByTagName('span')[0];
      expect(dropdownAutomatic.innerText).to.equal(strings.decimalPlacesAutomatic);
      ReactTestUtils.Simulate.click(dropdownAutomatic);
      ReactTestUtils.Simulate.click(dropdown);
      expect((dropdown.querySelector('.ms-Dropdown-title') as HTMLElement).textContent).to.equal(strings.decimalPlacesAutomatic);
    });
  });

  after(() => {
    // hack dismiss ms-Layer so other test that has callout will work
    let callout = document.getElementsByClassName('ms-Layer')[0];
    if (callout && callout.parentNode) {
      callout.parentNode.removeChild(callout);
    }
  });
});
