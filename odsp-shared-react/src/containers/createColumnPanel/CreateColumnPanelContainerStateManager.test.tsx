import * as React from 'react';

import chai = require('chai');
import * as sinon from 'sinon';
import * as TestUtils from './test/index';
import * as ReactTestUtils from 'react-addons-test-utils';

import { assign } from 'office-ui-fabric-react/lib/Utilities';

import Promise from '@ms/odsp-utilities/lib/async/Promise';
import { ICreateColumnPanelContainerStateManagerParams } from './index';
import { ISpPageContext } from '@ms/odsp-datasources/lib/interfaces/ISpPageContext';
import { FieldType, IField } from '@ms/odsp-datasources/lib/List';

const expect = chai.expect;

describe('CreateColumnPanelContainerStateManager', () => {
  let onSaveSpy = sinon.spy();
  let onDismissSpy = sinon.spy();
  let pageContext: ISpPageContext;
  let defaultParams: ICreateColumnPanelContainerStateManagerParams;
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

    pageContext = assign(new TestUtils.MockSpPageContext());

    defaultParams = {
      createColumnPanelContainer: undefined, // mock container will define it.
      pageContext: pageContext,
      listFieldsPromise: Promise.wrap(mockListField),
      getListDataSource: () => new TestUtils.MockListDataSource(pageContext),
      onSave: onSaveSpy,
      onDismiss: onDismissSpy,
      strings: TestUtils.stringFactory(TestUtils.strings)
    };
  });

  describe('CreateColumnPanelContainer', () => {
    let component: TestUtils.MockContainer;

    before(() => {
      let params = assign({}, defaultParams);
      component = ReactTestUtils.renderIntoDocument(<TestUtils.MockContainer params={ params } />) as TestUtils.MockContainer;
    });

    it('has expected strings', () => {
      const { panelProps, createColumnPanelContentProps } = component.stateManager.getRenderProps();
      let strings = TestUtils.stringFactory(TestUtils.strings);
      expect(panelProps.headerText).to.equals(strings.title, 'Panel header text should use passed in string');
      expect(createColumnPanelContentProps.strings).to.deep.equals(strings, 'Create column panel should use passed in strings');
    });

    it('error flags should be false by default', () => {
      const { createColumnPanelContentProps, listColumnsUnknown } = component.stateManager.getRenderProps();
      expect(createColumnPanelContentProps.duplicateColumnName).to.be.false;
      expect(listColumnsUnknown).to.be.false;
    });

    it('should have passed in callbacks', () => {
      const { createColumnPanelContentProps, onDismiss, onSave } = component.stateManager.getRenderProps();
      expect(onSave).to.not.be.undefined;
      expect(onDismiss).to.not.be.undefined;
      expect(createColumnPanelContentProps.updateSaveDisabled).to.not.be.undefined;
      expect(createColumnPanelContentProps.onClearError).to.not.be.undefined;
    });

    it('should detect duplicate column names', () => {
      const { createColumnPanelContentProps, onSave } = component.stateManager.getRenderProps();
      onSave({
        displayName: "Test Column",
        type: FieldType.Choice
      });
      expect(component.state.duplicateColumnName).to.be.true;
      expect(onSaveSpy.callCount).to.equal(0);
      createColumnPanelContentProps.onClearError();
      expect(component.state.duplicateColumnName).to.be.false;
    });

    it('should save column and call onSave callback', () => {
      const { onSave } = component.stateManager.getRenderProps();
      let columnName = "Unique Test Column";
      onSave({
        displayName: columnName,
        type: FieldType.Choice
      });
      expect(component.state.isPanelOpen).to.be.false;
      expect(onSaveSpy.calledOnce).to.be.true;
      expect(onSaveSpy.calledWith(columnName, Promise.wrap(columnName))).to.be.true;
      expect(onDismissSpy.callCount).to.equal(0);
    });

    it('should update save button disabled state', () => {
      const name: string = 'Test'
      const nameEvent: EventTarget = { value: name } as HTMLInputElement;
      const nameField = document.querySelector('.ms-CreateColumnPanel-nameTextField') as HTMLElement;
      const saveButton = document.querySelector('.ms-CreateColumnPanel-saveButton') as HTMLButtonElement;
      const nameInput = nameField.querySelector('input') as HTMLInputElement;

      expect(saveButton.disabled).to.be.true;
      ReactTestUtils.Simulate.input(nameInput, { target: nameEvent });
      expect(nameInput.value).to.equal(name);
      expect(saveButton.disabled).to.be.false;
      ReactTestUtils.Simulate.click(saveButton);
      expect(onSaveSpy.calledTwice).to.be.true;
      expect(onSaveSpy.calledWith(name, Promise.wrap(name))).to.be.true;
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
