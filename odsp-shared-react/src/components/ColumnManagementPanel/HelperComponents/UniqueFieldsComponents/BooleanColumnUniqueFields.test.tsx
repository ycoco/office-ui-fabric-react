import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as Utilities from '../../../../utilities/index';
import * as ReactTestUtils from 'react-addons-test-utils';

import { BooleanColumnUniqueFields, IBooleanColumnUniqueFieldsProps } from './index';
import { MockColumnManagementPanelStrings, fillInColumnManagementPanelStrings } from '../../../../containers/columnManagementPanel/index';

const expect: Chai.ExpectStatic = chai.expect;

describe('BooleanColumnUniqueFields', () => {
  let component;
  let renderedDOM;
  let strings = fillInColumnManagementPanelStrings(MockColumnManagementPanelStrings as {});
  let booleanColumnUniqueFieldsProps: IBooleanColumnUniqueFieldsProps = {
    strings: strings,
    defaultValue: "0"
  };

  before(() => {
    component = ReactTestUtils.renderIntoDocument(
      <BooleanColumnUniqueFields { ...booleanColumnUniqueFieldsProps } />
    );
    renderedDOM = ReactDOM.findDOMNode(component as React.ReactInstance);
  });

  it('should recognize default value', () => {
    const dropdown: HTMLElement = renderedDOM.querySelector('.ms-ColumnManagementPanel-booleanDefaultValue');
    const titleElement: HTMLElement = dropdown.querySelector('.ms-Dropdown-title') as HTMLElement;

    expect(titleElement.innerText).to.equal(strings.toggleOffText);
    ReactTestUtils.Simulate.click(dropdown);

    return Utilities.WaitForElementToExist(document, '.ms-Layer').then(() => {
      const callout = document.getElementsByClassName('ms-Layer')[0];
      const dropdownElements = callout.getElementsByClassName('ms-Dropdown-item');
      expect(dropdownElements).to.have.lengthOf(2);
      const dropdownYes: HTMLSpanElement = dropdownElements[0].getElementsByTagName('span')[0];
      const dropdownNo: HTMLSpanElement = dropdownElements[1].getElementsByTagName('span')[0];
      expect(dropdownYes.innerText).to.equal(strings.toggleOnText);
      expect(dropdownNo.innerText).to.equal(strings.toggleOffText);
      ReactTestUtils.Simulate.click(dropdownYes);
      ReactTestUtils.Simulate.click(dropdown);
      expect((dropdown.querySelector('.ms-Dropdown-title') as HTMLElement).innerText).to.equal(strings.toggleOnText);
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
