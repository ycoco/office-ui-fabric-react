import * as React from 'react';

import chai = require('chai');
import * as sinon from 'sinon';
import * as TestUtils from './test/index';
import * as ReactTestUtils from 'react-addons-test-utils';

import Promise from '@ms/odsp-utilities/lib/async/Promise';
import { IColumnManagementPanelContainerStateManagerParams } from './index';
import { ISpPageContext } from '@ms/odsp-datasources/lib/interfaces/ISpPageContext';
import { MockColumnManagementPanelStrings, MockColumnManagementPanelErrorStrings } from './index';
import { FieldType, IField } from '@ms/odsp-datasources/lib/List';

const expect = chai.expect;

describe('ColumnManagementPanelContainerStateManager', () => {
  let onSuccessSpy = sinon.spy();
  let onErrorSpy = sinon.spy();
  let onDismissSpy = sinon.spy();
  let pageContext: ISpPageContext;
  let defaultParams: IColumnManagementPanelContainerStateManagerParams;
  let mockListField: IField[] = [{
    id: "id",
    internalName: "internal name",
    isHidden: false,
    title: "Test Column"
  }];

  before(() => {
    /* tslint:disable */
    // emulate sharepoint environment
    window['_spPageContextInfo'] = pageContext;
    /* tslint:enable */

    let mockPageContext = new TestUtils.MockSpPageContext();
    pageContext = { ...mockPageContext };

    defaultParams = {
      columnManagementPanelContainer: undefined, // mock container will define it.
      pageContext: pageContext,
      listFieldsPromise: Promise.wrap(mockListField),
      getListDataSource: () => new TestUtils.MockListDataSource(pageContext),
      onSuccess: onSuccessSpy,
      onError: onErrorSpy,
      onDismiss: onDismissSpy,
      strings: MockColumnManagementPanelStrings as {},
      errorStrings: MockColumnManagementPanelErrorStrings as {}
    };
  });

  describe('ColumnManagementPanelContainer', () => {
    let component: TestUtils.MockContainer;

    before(() => {
      let params = { ...defaultParams };
      component = ReactTestUtils.renderIntoDocument(<TestUtils.MockContainer params={ params } />) as TestUtils.MockContainer;
    });

    it('has expected strings', () => {
      const { panelProps, columnManagementPanelContentProps } = component.stateManager.getRenderProps();
      let strings = columnManagementPanelContentProps.strings;
      expect(panelProps.headerText).to.equals(strings.title);
      expect(strings).to.have.all.keys(Object.keys(MockColumnManagementPanelStrings));
      expect(strings).to.not.deep.equal(MockColumnManagementPanelStrings); // should fill in missing string values
    });

    it('error flags should be false by default', () => {
      const { columnManagementPanelContentProps, errorMessage } = component.stateManager.getRenderProps();
      expect(columnManagementPanelContentProps.duplicateColumnName).to.be.false;
      expect(errorMessage).to.not.exist;
    });

    it('should have passed in callbacks', () => {
      const { columnManagementPanelContentProps, onDismiss, onSave } = component.stateManager.getRenderProps();
      expect(onSave).to.not.be.undefined;
      expect(onDismiss).to.not.be.undefined;
      expect(columnManagementPanelContentProps.updateSaveDisabled).to.not.be.undefined;
      expect(columnManagementPanelContentProps.onClearError).to.not.be.undefined;
    });

    it('should detect duplicate column names', () => {
      const { columnManagementPanelContentProps, onSave } = component.stateManager.getRenderProps();
      onSave({
        DisplayName: "Test Column",
        Title: "Test Column",
        Type: FieldType.Choice
      });
      expect(component.state.duplicateColumnName).to.be.true;
      expect(onSuccessSpy.callCount).to.equal(0);
      columnManagementPanelContentProps.onClearError();
      expect(component.state.duplicateColumnName).to.be.false;
    });

    it('should save column and call onSave callback', () => {
      const { onSave } = component.stateManager.getRenderProps();
      let columnName = "Unique Test Column";
      onSave({
        DisplayName: columnName,
        Title: columnName,
        Type: FieldType.Choice
      });
      expect(component.state.isPanelOpen).to.be.false;
      expect(onSuccessSpy.calledOnce).to.be.true;
      expect(onSuccessSpy.calledWith(columnName, columnName)).to.be.true;
      expect(onDismissSpy.callCount).to.equal(0);
    });

    it('should update save button disabled state', () => {
      const name: string = 'Test'
      const nameEvent: EventTarget = { value: name } as HTMLInputElement;
      const nameField = document.querySelector('.ms-ColumnManagementPanel-nameTextField') as HTMLElement;
      const saveButton = document.querySelector('.ms-ColumnManagementPanel-saveButton') as HTMLButtonElement;
      const nameInput = nameField.querySelector('input') as HTMLInputElement;

      expect(saveButton.disabled).to.be.true;
      ReactTestUtils.Simulate.input(nameInput, { target: nameEvent });
      expect(nameInput.value).to.equal(name);
      expect(saveButton.disabled).to.be.false;
      ReactTestUtils.Simulate.click(saveButton);
      expect(onSuccessSpy.calledTwice).to.be.true;
      expect(onSuccessSpy.calledWith(name, name)).to.be.true;
    })

    it('should call passed in onDismiss function', () => {
      component.setState({ isPanelOpen: true, savingColumn: false });
      const { onDismiss } = component.stateManager.getRenderProps();
      onDismiss();
      expect(component.state.isPanelOpen).to.be.false;
      expect(onDismissSpy.calledOnce).to.be.true;
    });

    after(() => {
      // hack dismiss ms-Layer so other test that has panel will work
      let panel = document.getElementsByClassName('ms-Layer')[0];
      panel.parentNode.removeChild(panel);
    });
  });
});
