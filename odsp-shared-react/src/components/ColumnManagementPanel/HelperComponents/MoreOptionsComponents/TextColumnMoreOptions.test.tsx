import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as ReactTestUtils from 'react-addons-test-utils';
import * as sinon from 'sinon';

import { TextColumnMoreOptions, ITextColumnMoreOptionsProps } from './index';
import { IMoreOptionsComponentSchemaValues } from './index';
import { MockColumnManagementPanelStrings, fillInColumnManagementPanelStrings } from '../../../../containers/columnManagementPanel/index';

const expect: Chai.ExpectStatic = chai.expect;

describe('TextColumnMoreOptions', () => {
  let component;
  let renderedDOM;
  let showMoreOptions = sinon.spy();

  let strings = fillInColumnManagementPanelStrings(MockColumnManagementPanelStrings as {});
  let textColumnMoreOptionsProps: ITextColumnMoreOptionsProps = {
    maxLength: "255",
    showMoreOptions: showMoreOptions,
    strings: strings
  };

  before(() => {
    component = ReactTestUtils.renderIntoDocument(
      <TextColumnMoreOptions { ...textColumnMoreOptionsProps } />
    );
    renderedDOM = ReactDOM.findDOMNode(component as React.ReactInstance);
  });

  it('should recognize and validate maximum length inputs for non numbers and invalid numbers', () => {
    const maxLength = renderedDOM.getElementsByClassName('ms-ColumnManagementPanel-maxLength')[0]
    const maxLengthInput: HTMLInputElement = maxLength.getElementsByTagName('input')[0];
    const validValueEvent: EventTarget = { value: "25" } as HTMLInputElement;
    const invalidLengthEvent: EventTarget = { value: "blue" } as HTMLInputElement;  //non-number value input
    const invalidLengthEvent2: EventTarget = { value: "256"} as HTMLInputElement; //number value too large input

    ReactTestUtils.Simulate.input(maxLengthInput, { target: validValueEvent });
    expect(maxLengthInput.value).to.equal("25");
    expect(component.state.maxLengthErrorMessage).to.equal("");
    let schemaValues: IMoreOptionsComponentSchemaValues = component.getSchemaValues();
    expect(schemaValues.MaxLength).to.equal(25);

    ReactTestUtils.Simulate.input(maxLengthInput, { target: invalidLengthEvent });
    expect(maxLengthInput.value).to.equal("blue");
    expect(component.state.maxLengthErrorMessage).to.equal(strings.maximumLengthNotValid);
    let errorSchemaValues: IMoreOptionsComponentSchemaValues | false = component.getSchemaValues();
    expect(errorSchemaValues).to.equal(false);

    ReactTestUtils.Simulate.input(maxLengthInput, { target: invalidLengthEvent2 });
    expect(maxLengthInput.value).to.equal("256");
    expect(component.state.maxLengthErrorMessage).to.equal(strings.maximumLengthNotValid);
    let errorSchemaValues2: IMoreOptionsComponentSchemaValues | false = component.getSchemaValues();
    expect(errorSchemaValues2).to.equal(false);

  });
});