import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as ReactTestUtils from 'react-addons-test-utils';
import * as sinon from 'sinon';

import { BaseMoreOptions, IBaseMoreOptionsProps } from './index';
import { IBaseMoreOptionsComponentSchemaValues } from './index';
import { MockColumnManagementPanelStrings, fillInColumnManagementPanelStrings } from '../../../../containers/columnManagementPanel/index';
import { FieldType } from '@ms/odsp-datasources/lib/List';

const expect: Chai.ExpectStatic = chai.expect;

describe('BaseMoreOptions', () => {
  let component;
  let renderedDOM;
  let updateShowColumnValidationState = sinon.spy();
  let strings = fillInColumnManagementPanelStrings(MockColumnManagementPanelStrings as {});
  let baseMoreOptionsProps: IBaseMoreOptionsProps = {
    strings: strings,
    fieldType: FieldType.User,
    updateShowColumnValidationState: updateShowColumnValidationState,
    allowMultipleSelection: false,
    required: true,
    enforceUniqueValues: false,
    showAllowMultipleToggle: true,
    showEnforceUniqueToggle: true
  };

  before(() => {
    component = ReactTestUtils.renderIntoDocument(
      <BaseMoreOptions { ...baseMoreOptionsProps } />
    );
    renderedDOM = ReactDOM.findDOMNode(component as React.ReactInstance);
  });

  it('should recognize enforce unique and required checkbox changes', () => {
    const toggles: HTMLElement[] = renderedDOM.getElementsByClassName('ms-ColumnManagementPanel-toggle');
    expect(toggles).to.have.lengthOf(3);
    const enforceUniqueValues = renderedDOM.getElementsByClassName('enforceUniqueValues')[0]
    const enforceUniqueValuesButton: HTMLButtonElement = enforceUniqueValues.getElementsByTagName('button')[0];
    const enforceUniqueValuesState: HTMLLabelElement = enforceUniqueValues.getElementsByClassName('ms-Toggle-stateText')[0];
    const required = renderedDOM.getElementsByClassName('requiredToggle')[0];
    const requiredButton: HTMLButtonElement = required.getElementsByTagName('button')[0];
    const requiredState: HTMLLabelElement = required.getElementsByClassName('ms-Toggle-stateText')[0];

    expect(enforceUniqueValuesState.innerText).to.equal(strings.toggleOffText);
    ReactTestUtils.Simulate.click(enforceUniqueValuesButton);
    expect(enforceUniqueValuesState.innerText).to.equal(strings.toggleOnText);
    expect(requiredState.innerText).to.equal(strings.toggleOnText);
    ReactTestUtils.Simulate.click(requiredButton);
    expect(requiredState.innerText).to.equal(strings.toggleOffText);
  });

  it('should recognize allow multiple selection toggle change and disable enforce unique', () => {
    const allowMultipleSelection = renderedDOM.getElementsByClassName('allowMultipleSelection')[0];
    const allowMultipleSelectionButton = allowMultipleSelection.getElementsByTagName('button')[0];
    const allowMultipleSelectionState = allowMultipleSelection.getElementsByClassName('ms-Toggle-stateText')[0];
    const enforceUniqueValues = renderedDOM.getElementsByClassName('enforceUniqueValues')[0];
    const enforceUniqueValuesButton: HTMLButtonElement = enforceUniqueValues.getElementsByTagName('button')[0];
    const enforceUniqueValuesState: HTMLLabelElement = enforceUniqueValues.getElementsByClassName('ms-Toggle-stateText')[0];

    expect(enforceUniqueValuesState.innerText).to.equal(strings.toggleOnText);
    expect(allowMultipleSelectionState.innerText).to.equal(strings.toggleOffText);
    ReactTestUtils.Simulate.click(allowMultipleSelectionButton);

    expect(allowMultipleSelectionState.innerText).to.equal(strings.toggleOnText);
    expect(updateShowColumnValidationState.calledOnce).to.be.true;
    expect(updateShowColumnValidationState.calledWith(true)).to.be.true;
    expect(enforceUniqueValuesState.innerText).to.equal(strings.toggleOffText);
    expect(enforceUniqueValuesButton.disabled).to.be.true;
  });

  it('should create type specific schema values', () => {
    let schemaValues: IBaseMoreOptionsComponentSchemaValues = component.getSchemaValues();
    expect(schemaValues.EnforceUniqueValues).to.be.false;
    expect(schemaValues.Indexed).to.be.false;
    expect(schemaValues.Type).to.equal(FieldType.UserMulti);
    expect(schemaValues.Mult).to.be.true;
  });
});