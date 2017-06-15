import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as ReactTestUtils from 'react-addons-test-utils';
import * as sinon from 'sinon';

import { NumberColumnMoreOptions, INumberColumnMoreOptionsProps } from './index';
import { IMoreOptionsComponentSchemaValues } from './index';
import { MockColumnManagementPanelStrings, fillInColumnManagementPanelStrings } from '../../../../containers/columnManagementPanel/index';

const expect: Chai.ExpectStatic = chai.expect;

describe('NumberColumnMoreOptions', () => {
  let component;
  let renderedDOM;
  let showMoreOptions = sinon.spy();
  let clearValidateMoreOptions = sinon.spy();

  let strings = fillInColumnManagementPanelStrings(MockColumnManagementPanelStrings as {});
  let numberColumnMoreOptionsProps: INumberColumnMoreOptionsProps = {
    minimumValue: "2",
    maximumValue: "",
    showMoreOptions: showMoreOptions,
    strings: strings,
    clearValidateMoreOptions: clearValidateMoreOptions,
    validateMoreOptions: false
  };

  before(() => {
    component = ReactTestUtils.renderIntoDocument(
      <NumberColumnMoreOptions { ...numberColumnMoreOptionsProps } />
    );
    renderedDOM = ReactDOM.findDOMNode(component as React.ReactInstance);
  });

  it('should recognize and validate minimum and maximum value inputs', () => {
    const minimumValue = renderedDOM.getElementsByClassName('ms-ColumnManagementPanel-minimumValue')[0]
    const minimumValueInput: HTMLInputElement = minimumValue.getElementsByTagName('input')[0];
    const maximumValue = renderedDOM.getElementsByClassName('ms-ColumnManagementPanel-maximumValue')[0];
    const maximumValueInput: HTMLInputElement = maximumValue.getElementsByTagName('input')[0];
    const validValueEvent: EventTarget = { value: "25" } as HTMLInputElement;
    const invalidValueEvent: EventTarget = { value: "blue" } as HTMLInputElement;

    ReactTestUtils.Simulate.input(maximumValueInput, { target: validValueEvent });
    expect(minimumValueInput.value).to.equal("2");
    expect(maximumValueInput.value).to.equal("25");
    expect(component.state.minValueErrorMessage).to.equal("");
    expect(component.state.maxValueErrorMessage).to.equal("");
    let schemaValues: IMoreOptionsComponentSchemaValues = component.getSchemaValues();
    expect(schemaValues.Min).to.equal(2);
    expect(schemaValues.Max).to.equal(25);

    ReactTestUtils.Simulate.input(minimumValueInput, { target: invalidValueEvent });
    expect(minimumValueInput.value).to.equal("blue");
    expect(component.state.minValueErrorMessage).to.equal(strings.minimumValueNotValid);
    let errorSchemaValues: IMoreOptionsComponentSchemaValues | false = component.getSchemaValues();
    expect(errorSchemaValues).to.equal(false);
  });

  it('should identify minimum larger than maximum issue', () => {
    const minimumValue = renderedDOM.getElementsByClassName('ms-ColumnManagementPanel-minimumValue')[0]
    const minimumValueInput: HTMLInputElement = minimumValue.getElementsByTagName('input')[0];
    const largerValidValueEvent: EventTarget = { value: "30" } as HTMLInputElement;

    ReactTestUtils.Simulate.input(minimumValueInput, { target: largerValidValueEvent });
    expect(minimumValueInput.value).to.equal("30");
    let schemaValues: IMoreOptionsComponentSchemaValues | false = component.getSchemaValues();
    expect(schemaValues).to.equal(false);
    expect(showMoreOptions.calledTwice).to.be.true;

    numberColumnMoreOptionsProps.validateMoreOptions = true;
    component.componentWillReceiveProps(numberColumnMoreOptionsProps);
    expect(component.state.minValueErrorMessage).to.equal(strings.minimumLargerThanMaximum);
  });
});