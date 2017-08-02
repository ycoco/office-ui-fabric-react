import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as ReactTestUtils from 'react-addons-test-utils';

import { DefaultValueEntryField, IDefaultValueEntryFieldProps } from './index';
import { IUniqueFieldsComponentSchemaValues } from '../UniqueFieldsComponents/index';
import { MockColumnManagementPanelStrings, fillInColumnManagementPanelStrings } from '../../../../containers/columnManagementPanel/index';

const expect: Chai.ExpectStatic = chai.expect;

describe('DefaultValueEntryField', () => {
  let component;
  let renderedDOM;
  let strings = fillInColumnManagementPanelStrings(MockColumnManagementPanelStrings as {});
  let defaultValueEntryFieldProps: IDefaultValueEntryFieldProps = {
    strings: strings,
    useCalculatedDefaultValue: false,
    defaultFormula: "",
    defaultValue: "25",
    defaultValuePlaceholder: strings.enterNumberPlaceholder,
    defaultValueAriaLabel: strings.defaultNumberAriaLabel,
    formulaLearnMoreLink: "testlink",
    checkIsNumber: true
  };

  describe('Number default value', () => {
    before(() => {
      component = ReactTestUtils.renderIntoDocument(
        <DefaultValueEntryField { ...defaultValueEntryFieldProps } />
      );
      renderedDOM = ReactDOM.findDOMNode(component as React.ReactInstance);
    });

    it('should register and validate default value', () => {
      const defaultValue = renderedDOM.getElementsByClassName('ms-ColumnManagementPanel-defaultValueEntryField')[0];
      const defaultValueInput: HTMLInputElement = defaultValue.getElementsByTagName('input')[0];
      const defaultEvent: EventTarget = { value: "hello" } as HTMLInputElement;
      expect(defaultValueInput.value).to.equal("25");
      expect(component.state.defaultValueErrorMessage).to.equal("");
      let schemaValues: IUniqueFieldsComponentSchemaValues = component.getSchemaValues();
      expect(schemaValues.DefaultValue).to.equal("25");
      expect(schemaValues.DefaultFormula).to.equal(null);

      ReactTestUtils.Simulate.input(defaultValueInput, { target: defaultEvent });
      expect(defaultValueInput.value).to.equal("hello");
      expect(component.state.defaultValueErrorMessage).to.equal(strings.defaultNumberNotValid);
      let newSchemaValues: IUniqueFieldsComponentSchemaValues | false = component.getSchemaValues();
      expect(newSchemaValues).to.equal(false);
    });
  });

  describe('String default value', () => {
    before(() => {
      defaultValueEntryFieldProps.checkIsNumber = false;
      component = ReactTestUtils.renderIntoDocument(
        <DefaultValueEntryField { ...defaultValueEntryFieldProps } />
      );
      renderedDOM = ReactDOM.findDOMNode(component as React.ReactInstance);
    });

    it('should register and not validate default value', () => {
      const defaultValue = renderedDOM.getElementsByClassName('ms-ColumnManagementPanel-defaultValueEntryField')[0];
      const defaultValueInput: HTMLInputElement = defaultValue.getElementsByTagName('input')[0];
      const defaultEvent: EventTarget = { value: "hello" } as HTMLInputElement;
      expect(defaultValueInput.value).to.equal("25");
      expect(component.state.defaultValueErrorMessage).to.equal("");
      let schemaValues: IUniqueFieldsComponentSchemaValues = component.getSchemaValues();
      expect(schemaValues.DefaultValue).to.equal("25");
      expect(schemaValues.DefaultFormula).to.equal(null);

      ReactTestUtils.Simulate.input(defaultValueInput, { target: defaultEvent });
      expect(defaultValueInput.value).to.equal("hello");
      expect(component.state.defaultValueErrorMessage).to.equal("");
      let newSchemaValues: IUniqueFieldsComponentSchemaValues = component.getSchemaValues();
      expect(newSchemaValues.DefaultValue).to.equal("hello");
      expect(newSchemaValues.DefaultFormula).to.equal(null);
    });
  });

  describe('Calculated default value', () => {
    before(() => {
      defaultValueEntryFieldProps.useCalculatedDefaultValue = true;
      defaultValueEntryFieldProps.defaultValue = "red";
      defaultValueEntryFieldProps.defaultFormula = "=Today";
      component = ReactTestUtils.renderIntoDocument(
        <DefaultValueEntryField { ...defaultValueEntryFieldProps } />
      );
      renderedDOM = ReactDOM.findDOMNode(component as React.ReactInstance);
    });

    it('should register calculated default value inputs', () => {
      const defaultFormula = renderedDOM.getElementsByClassName('ms-ColumnManagementPanel-defaultFormulaEntryField')[0];
      const defaultFormulaInput: HTMLInputElement = defaultFormula.getElementsByTagName('input')[0];
      const defaultFormulaEvent: EventTarget = { value: "=Me" } as HTMLInputElement;
      expect(defaultFormulaInput.value).to.equal("=Today");
      let schemaValues: IUniqueFieldsComponentSchemaValues = component.getSchemaValues();
      expect(schemaValues.DefaultValue).to.equal(null);
      expect(schemaValues.DefaultFormula).to.equal("=Today");

      ReactTestUtils.Simulate.input(defaultFormulaInput, { target: defaultFormulaEvent });
      expect(defaultFormulaInput.value).to.equal("=Me");
      let newSchemaValues: IUniqueFieldsComponentSchemaValues = component.getSchemaValues();
      expect(newSchemaValues.DefaultValue).to.equal(null);
      expect(newSchemaValues.DefaultFormula).to.equal("=Me");
    });

    it('schema values should change if the use calculated default checkbox is changed', () => {
      const calculatedDefault = renderedDOM.getElementsByClassName('ms-ColumnManagementPanel-useCalculatedValue')[0];
      const calculatedDefaultCheckbox = calculatedDefault.getElementsByTagName('button')[0];
      expect(calculatedDefaultCheckbox.getAttribute('aria-checked')).equals('true');
      ReactTestUtils.Simulate.click(calculatedDefaultCheckbox);
      expect(calculatedDefaultCheckbox.getAttribute('aria-checked')).equals('false');
      let noCalculatedSchemaValues: IUniqueFieldsComponentSchemaValues = component.getSchemaValues();
      expect(noCalculatedSchemaValues.DefaultValue).to.equal("red");
      expect(noCalculatedSchemaValues.DefaultFormula).to.equal(null);
    });
  });
});
