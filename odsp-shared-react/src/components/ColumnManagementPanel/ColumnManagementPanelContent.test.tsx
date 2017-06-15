import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as ReactTestUtils from 'react-addons-test-utils';
import * as sinon from 'sinon';

import { ColumnManagementPanelContent, IColumnManagementPanelContentProps } from './index';
import { MockColumnManagementPanelStrings, fillInColumnManagementPanelStrings } from '../../containers/columnManagementPanel/index';
import { FieldType } from '@ms/odsp-datasources/lib/List';

const expect: Chai.ExpectStatic = chai.expect;

describe('ColumnManagementPanelContent', () => {
  let component;
  let renderedDOM;
  let updateSaveDisabled = sinon.spy();
  let onClearError = sinon.spy();
  let strings = fillInColumnManagementPanelStrings(MockColumnManagementPanelStrings as {});
  let columnManagementPanelContentProps: IColumnManagementPanelContentProps = {
    strings: strings,
    onClearError: onClearError,
    updateSaveDisabled: updateSaveDisabled,
    duplicateColumnName: false,
    fieldType: FieldType.Choice,
    currentLanguage: 1033
  };

  before(() => {
    component = ReactTestUtils.renderIntoDocument(
      <ColumnManagementPanelContent {...columnManagementPanelContentProps} />
    );
    renderedDOM = ReactDOM.findDOMNode(component as React.ReactInstance);
  });

  it('should register name input', () => {
    const name: string = 'Test';
    const nameEvent: EventTarget = { value: name } as HTMLInputElement;
    const nameField: HTMLElement = renderedDOM.getElementsByClassName('ms-ColumnManagementPanel-nameTextField')[0];
    const nameInput: HTMLInputElement = nameField.getElementsByTagName('input')[0];

    ReactTestUtils.Simulate.input(nameInput, { target: nameEvent });
    expect(nameInput.value).to.equal(name);
  });

  it('should render sections when more options button or column validation button is clicked', () => {
    const moreOptionsButton: HTMLElement = renderedDOM.getElementsByClassName('ms-ColumnManagementPanel-moreOptionsButton')[0];
    const moreOptionsButtonDOM: HTMLButtonElement = moreOptionsButton.getElementsByTagName('button')[0];
    let moreOptionsHidden: HTMLElement = renderedDOM.getElementsByClassName('ms-ColumnManagementPanel-moreOptions hidden')[0];
    let columnValidationHidden: HTMLElement = renderedDOM.getElementsByClassName('ms-ColumnManagementPanel-columnValidation hidden')[0];

    expect(moreOptionsHidden).to.exist;
    expect(columnValidationHidden).to.exist;

    ReactTestUtils.Simulate.click(moreOptionsButtonDOM);

    const columnValidationButton: HTMLElement = renderedDOM.getElementsByClassName('ms-ColumnManagementPanel-columnValidationButton')[0];
    const columnValidationButtonDOM: HTMLButtonElement = columnValidationButton.getElementsByTagName('button')[0];
    const moreOptionsVisible: HTMLElement = renderedDOM.getElementsByClassName('ms-ColumnManagementPanel-moreOptions')[0];
    moreOptionsHidden = renderedDOM.getElementsByClassName('ms-ColumnManagementPanel-moreOptions hidden')[0];
    expect(moreOptionsVisible).to.exist;
    expect(moreOptionsHidden).to.not.exist;
    expect(columnValidationButton).to.exist;

    ReactTestUtils.Simulate.click(columnValidationButtonDOM);

    const columnValidationVisible: HTMLElement = renderedDOM.getElementsByClassName('ms-ColumnManagementPanel-columnValidation')[0];
    columnValidationHidden = renderedDOM.getElementsByClassName('ms-ColumnManagmentPanel-column hidden')[0];
    expect(columnValidationVisible).to.exist;
    expect(columnValidationHidden).to.not.exist;
  });
});
