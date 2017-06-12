import * as React from 'react';

import chai = require('chai');
import * as sinon from 'sinon';
import * as TestUtils from './test/index';
import * as ReactTestUtils from 'react-addons-test-utils';

import { IColumnManagementPanelContainerStateManagerParams } from './index';
import { ISpPageContext } from '@ms/odsp-datasources/lib/interfaces/ISpPageContext';
import { MockColumnManagementPanelStrings, MockColumnManagementPanelErrorStrings } from './ColumnManagementPanelStringHelper';
import { FieldType } from '@ms/odsp-datasources/lib/List';

const expect = chai.expect;

describe('ColumnManagementPanelContainerStateManager', () => {
  let onSuccessSpy = sinon.spy();
  let onErrorSpy = sinon.spy();
  let onDismissSpy = sinon.spy();
  let pageContext: ISpPageContext;
  let defaultParams: IColumnManagementPanelContainerStateManagerParams;

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
      getListDataSource: () => new TestUtils.MockListDataSource(pageContext),
      onSuccess: onSuccessSpy,
      onError: onErrorSpy,
      onDismiss: onDismissSpy,
      strings: MockColumnManagementPanelStrings as {},
      errorStrings: MockColumnManagementPanelErrorStrings as {}
    };
  });

  describe('CreateColumnPanelContainer', () => {
    let createPanel: TestUtils.MockContainer;

    before(() => {
      let createParams = { ...defaultParams,
        createField: {
          fieldType: FieldType.Choice
        }
      };
      createPanel = ReactTestUtils.renderIntoDocument(<TestUtils.MockContainer params={ createParams } />) as TestUtils.MockContainer;
    });

    it('has expected strings', () => {
      const { panelProps, columnManagementPanelContentProps } = createPanel.stateManager.getRenderProps();
      let strings = columnManagementPanelContentProps.strings;
      expect(panelProps.headerText).to.equals(strings.title);
      expect(strings).to.have.all.keys(Object.keys(MockColumnManagementPanelStrings));
      expect(strings).to.not.deep.equal(MockColumnManagementPanelStrings); // should fill in missing string values
    });

    it('has expected create panel defaults', () => {
      const { columnManagementPanelContentProps, isEditPanel } = createPanel.stateManager.getRenderProps();
      expect(columnManagementPanelContentProps.currentValuesPromise).to.not.exist;
      expect(isEditPanel).to.be.false;
    });

    it('error flags should be false by default', () => {
      const { columnManagementPanelContentProps, errorMessage } = createPanel.stateManager.getRenderProps();
      expect(columnManagementPanelContentProps.duplicateColumnName).to.be.false;
      expect(errorMessage).to.not.exist;
    });

    it('should have passed in callbacks', () => {
      const { columnManagementPanelContentProps, onDismiss, onSave } = createPanel.stateManager.getRenderProps();
      expect(onSave).to.not.be.undefined;
      expect(onDismiss).to.not.be.undefined;
      expect(columnManagementPanelContentProps.updateSaveDisabled).to.not.be.undefined;
      expect(columnManagementPanelContentProps.updateParentStateWithCurrentValues).to.not.be.undefined;
      expect(columnManagementPanelContentProps.onClearError).to.not.be.undefined;
    });

    it('should detect duplicate column names', () => {
      const { columnManagementPanelContentProps, onSave } = createPanel.stateManager.getRenderProps();
      onSave({
        DisplayName: "Test Column",
        Title: "Test Column",
        Type: FieldType.Choice
      });
      expect(createPanel.state.duplicateColumnName).to.be.true;
      expect(createPanel.state.saveDisabled).to.be.true;
      expect(onSuccessSpy.callCount).to.equal(0);
      columnManagementPanelContentProps.onClearError();
      expect(createPanel.state.duplicateColumnName).to.be.false;
    });

    it('should save column and call onSuccess function', () => {
      const { onSave } = createPanel.stateManager.getRenderProps();
      let columnName = "Unique Test Column";
      onSave({
        DisplayName: columnName,
        Title: columnName,
        Type: FieldType.Choice
      });
      expect(createPanel.state.isPanelOpen).to.be.false;
      expect(onSuccessSpy.calledOnce).to.be.true;
      expect(onSuccessSpy.calledWith(columnName, columnName, 'Create')).to.be.true;
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
      expect(onSuccessSpy.calledWith(name, name, 'Create')).to.be.true;
    })

    it('should call passed in onDismiss function', () => {
      createPanel.setState({ isPanelOpen: true, savingColumn: false });
      const { onDismiss } = createPanel.stateManager.getRenderProps();
      onDismiss();
      expect(createPanel.state.isPanelOpen).to.be.false;
      expect(onDismissSpy.calledOnce).to.be.true;
    });

    after(() => {
      // hack dismiss ms-Layer so other test that has panel will work
      let panel = document.getElementsByClassName('ms-Layer')[0];
      panel.parentNode.removeChild(panel);
    });
  });

  describe('EditColumnPanelContainer', () => {
    let editPanel: TestUtils.MockContainer;

    before(() => {
      let editParams = { ...defaultParams,
        editField: {
          fieldName: "Test_Field"
        }
      };
      editPanel = ReactTestUtils.renderIntoDocument(<TestUtils.MockContainer params={ editParams } />) as TestUtils.MockContainer;
    });

    it('has expected strings', () => {
      const { panelProps, columnManagementPanelContentProps } = editPanel.stateManager.getRenderProps();
      expect(panelProps.headerText).to.equal(columnManagementPanelContentProps.strings.editPanelTitle);
    });

    it('has expected edit panel defaults', () => {
      const { columnManagementPanelContentProps, isEditPanel, confirmDeleteDialogIsOpen } = editPanel.stateManager.getRenderProps();
      expect(columnManagementPanelContentProps.currentValuesPromise).to.exist;
      expect(isEditPanel).to.be.true;
      expect(confirmDeleteDialogIsOpen).to.be.false;
    });

    it('should have passed in callbacks', () => {
      const { columnManagementPanelContentProps, showHideConfirmDeleteDialog, onDelete } = editPanel.stateManager.getRenderProps();
      expect(columnManagementPanelContentProps.updateSaveDisabled).to.not.be.undefined;
      expect(columnManagementPanelContentProps.updateParentStateWithCurrentValues).to.not.be.undefined;
      expect(columnManagementPanelContentProps.onClearError).to.not.be.undefined;
      expect(onDelete).to.not.be.undefined;
      expect(showHideConfirmDeleteDialog).to.not.be.undefined;
    });

    it('should update save button disabled state with current values', () => {
      expect(editPanel.state.saveDisabled).to.be.false;
      expect(editPanel.state.isContentLoading).to.be.false;
    });

    it('should update confirm delete dialog open state', () => {
      const { showHideConfirmDeleteDialog } = editPanel.stateManager.getRenderProps();
      expect(editPanel.state.confirmDeleteDialogIsOpen).to.be.false;
      showHideConfirmDeleteDialog();
      expect(editPanel.state.confirmDeleteDialogIsOpen).to.be.true;
      showHideConfirmDeleteDialog();
    });

    it('should save column and call onSuccess function', () => {
      const { onSave } = editPanel.stateManager.getRenderProps();
      let columnName = "Unique Test Column";
      onSave({
        DisplayName: columnName,
        Title: columnName,
        Type: FieldType.Choice
      });
      expect(editPanel.state.isPanelOpen).to.be.false;
      expect(onSuccessSpy.calledThrice).to.be.true;
      expect(onSuccessSpy.calledWith(columnName, "Test_Field", 'Edit')).to.be.true;
      expect(onDismissSpy.calledOnce).to.be.true;
    });

    after(() => {
      // hack dismiss ms-Layer so other test that has panel will work
      let panel = document.getElementsByClassName('ms-Layer')[0];
      panel.parentNode.removeChild(panel);
    });
  });
});
