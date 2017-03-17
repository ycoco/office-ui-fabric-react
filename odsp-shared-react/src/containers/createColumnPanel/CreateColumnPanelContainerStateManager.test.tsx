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
  let onSave = sinon.spy();
  let onDismiss = sinon.spy();
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
      onSave: onSave,
      onDismiss: onDismiss,
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
      const { createColumnPanelContentProps } = component.stateManager.getRenderProps();
      expect(createColumnPanelContentProps.duplicateColumnName).to.be.false;
      expect(createColumnPanelContentProps.listColumnsUnknown).to.be.false;
    });

    it('should have passed in callbacks', () => {
      const { createColumnPanelContentProps } = component.stateManager.getRenderProps();
      expect(createColumnPanelContentProps.onSave).to.not.be.undefined;
      expect(createColumnPanelContentProps.onDismiss).to.not.be.undefined;
      expect(createColumnPanelContentProps.onClearError).to.not.be.undefined;
    });

    it('should detect duplicate column names', () => {
      const { createColumnPanelContentProps } = component.stateManager.getRenderProps();
      createColumnPanelContentProps.onSave({
        displayName: "Test Column",
        type: FieldType.Choice
      });
      expect(component.state.duplicateColumnName).to.be.true;
      expect(onSave.callCount).to.equal(0);
      createColumnPanelContentProps.onClearError();
      expect(component.state.duplicateColumnName).to.be.false;
    });

    it('should save column and call onSave callback', () => {
      const { createColumnPanelContentProps } = component.stateManager.getRenderProps();
      let columnName = "Unique Test Column";
      createColumnPanelContentProps.onSave({
        displayName: columnName,
        type: FieldType.Choice
      });
      expect(component.state.isPanelOpen).to.be.false;
      expect(onSave.calledOnce).to.be.true;
      expect(onSave.calledWith(columnName, Promise.wrap(columnName))).to.be.true;
      expect(onDismiss.callCount).to.equal(0);
    });

    it('should call passed in onDismiss function', () => {
      let params = assign({}, defaultParams);
      component = ReactTestUtils.renderIntoDocument(<TestUtils.MockContainer params={ params } />) as TestUtils.MockContainer;
      const { createColumnPanelContentProps } = component.stateManager.getRenderProps();
      createColumnPanelContentProps.onDismiss();
      expect(component.state.isPanelOpen).to.be.false;
      expect(onDismiss.callCount).to.be.greaterThan(0);
    });

    after(() => {
      // hack dismiss ms-Layer so other test that has panel will work
      let panel = document.getElementsByClassName('ms-Layer')[0];
      let panel2 = document.getElementsByClassName('ms-Layer')[1];
      panel.parentNode.removeChild(panel);
      panel2.parentNode.removeChild(panel2);
    });
  });
});
