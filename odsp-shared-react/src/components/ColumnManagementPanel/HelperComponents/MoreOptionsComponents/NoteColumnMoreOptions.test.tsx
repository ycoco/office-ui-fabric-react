import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as ReactTestUtils from 'react-addons-test-utils';
import * as sinon from 'sinon';

import { NoteColumnMoreOptions, INoteColumnMoreOptionsProps } from './index';
import { IMoreOptionsComponentSchemaValues } from './index';
import { MockColumnManagementPanelStrings, fillInColumnManagementPanelStrings } from '../../../../containers/columnManagementPanel/index';

const expect: Chai.ExpectStatic = chai.expect;

describe('NoteColumnMoreOptions', () => {
  let component;
  let renderedDOM;
  let showMoreOptions = sinon.spy();

  let strings = fillInColumnManagementPanelStrings(MockColumnManagementPanelStrings as {});
  let noteColumnMoreOptionsProps: INoteColumnMoreOptionsProps = {
    numberOfLines: "6",
    richText: false,
    appendOnly: false,
    isDocumentLibrary: false,
    showMoreOptions: showMoreOptions,
    strings: strings,
    enableVersions: false
  };

  beforeEach(() => {
    component = ReactTestUtils.renderIntoDocument(
      <NoteColumnMoreOptions { ...noteColumnMoreOptionsProps } />
    );
    renderedDOM = ReactDOM.findDOMNode(component as React.ReactInstance);
  });


  it('recognizes and validates the number of line inputs for non numbers and invalid numbers', () => {
    const numberOfLines = renderedDOM.getElementsByClassName('ms-ColumnManagementPanel-numberOfLines')[0]
    const numberOfLinesInput: HTMLInputElement = numberOfLines.getElementsByTagName('input')[0];
    const validNumberEvent: EventTarget = { value: "25" } as HTMLInputElement;
    const notANumberEvent: EventTarget = { value: "blue" } as HTMLInputElement;  //non-number value input
    const numberTooBigEvent: EventTarget = { value: "1001"} as HTMLInputElement; //number value too large input

    ReactTestUtils.Simulate.input(numberOfLinesInput, { target: validNumberEvent });
    expect(numberOfLinesInput.value).to.equal("25");
    expect(component.state.numLinesErrorMessage).to.equal("");
    let schemaValues: IMoreOptionsComponentSchemaValues = component.getSchemaValues();
    expect(schemaValues.NumLines).to.equal(25);

    ReactTestUtils.Simulate.input(numberOfLinesInput, { target: notANumberEvent });
    expect(numberOfLinesInput.value).to.equal("blue");
    expect(component.state.numLinesErrorMessage).to.equal(strings.numberOfLinesNotValid);
    let errorSchemaValues: IMoreOptionsComponentSchemaValues | false = component.getSchemaValues();
    expect(errorSchemaValues).to.equal(false);

    ReactTestUtils.Simulate.input(numberOfLinesInput, { target: numberTooBigEvent });
    expect(numberOfLinesInput.value).to.equal("1001");
    expect(component.state.numLinesErrorMessage).to.equal(strings.numberOfLinesNotValid);
    let errorSchemaValues2: IMoreOptionsComponentSchemaValues | false = component.getSchemaValues();
    expect(errorSchemaValues2).to.equal(false);
  });


   it('isDocumentLibrary set to false and versioning off, recognize and validate apppend only toggle changes', () => {
    const appendOnly = renderedDOM.getElementsByClassName('appendOnly')[0];
    const appendOnlyState: HTMLLabelElement = appendOnly.getElementsByClassName('ms-Toggle-stateText')[0];
    const appendOnlyButton: HTMLButtonElement = appendOnly.getElementsByTagName('button')[0];

    //checks if checkbox is working
    expect(appendOnlyState.innerText).to.equal(strings.toggleOffText);
    ReactTestUtils.Simulate.click(appendOnlyButton);
    expect(appendOnlyState.innerText).to.equal(strings.toggleOnText);

    //Append only not allowed
    expect(component.state.appendOnly).to.equal(true);
    expect(component.state.appendOnlyErrorMessage).to.equal(strings.appendOnlyNotValid);
    let errorSchemaValues: IMoreOptionsComponentSchemaValues | false = component.getSchemaValues();
    expect(errorSchemaValues).to.equal(false);
    ReactTestUtils.Simulate.click(appendOnlyButton);
    expect(component.state.appendOnly).to.equal(false);
    expect(component.state.appendOnlyErrorMessage).to.equal("");
   });

    describe('Allow append only', () => {
        before(() => {
        noteColumnMoreOptionsProps.enableVersions = true;
        component = ReactTestUtils.renderIntoDocument(
            <NoteColumnMoreOptions { ...noteColumnMoreOptionsProps } />
        );
        renderedDOM = ReactDOM.findDOMNode(component as React.ReactInstance);
        });

        it('isDocumentLibrary set to false and versioning is on, append only should be allowed', () => {
            const appendOnly = renderedDOM.getElementsByClassName('appendOnly')[0];
            const appendOnlyButton: HTMLButtonElement = appendOnly.getElementsByTagName('button')[0];

            ReactTestUtils.Simulate.click(appendOnlyButton);
            expect(component.state.appendOnly).to.equal(true);
            expect(component.state.appendOnlyErrorMessage).to.equal("");
            let schemaValues: IMoreOptionsComponentSchemaValues = component.getSchemaValues();
            expect(schemaValues.AppendOnly).to.equal(true);
        });
    });



  it('isDocumentLibrary set to false, recognize and validate rich text toggle changes', () => {
    const richText = renderedDOM.getElementsByClassName('richText')[0]
    const richTextButton: HTMLButtonElement = richText.getElementsByTagName('button')[0];

    //Turning on toggle
    ReactTestUtils.Simulate.click(richTextButton);
    let schemaValues: IMoreOptionsComponentSchemaValues = component.getSchemaValues();
    expect(schemaValues.RichTextMode).to.equal("FullHtml");
    expect(schemaValues.IsolateStyles).to.equal(true);
    expect(schemaValues.RichText).to.equal(true);


    //Turn toggle off
    ReactTestUtils.Simulate.click(richTextButton);
    let schemaValues2: IMoreOptionsComponentSchemaValues = component.getSchemaValues();
    expect(schemaValues2.RichTextMode).to.equal("Compatible");
    expect(schemaValues2.IsolateStyles).to.equal(false);
    expect(schemaValues.RichText).to.equal(true);
  });

    describe('Hiding toggles when forDocumentLibrary is true', () => {
        before(() => {
        noteColumnMoreOptionsProps.isDocumentLibrary = true;
        component = ReactTestUtils.renderIntoDocument(
            <NoteColumnMoreOptions { ...noteColumnMoreOptionsProps } />
        );
        renderedDOM = ReactDOM.findDOMNode(component as React.ReactInstance);
        });

        it('isDocumentLibrary set to true, toggles will not show', () => {
            expect(component.props.isDocumentLibrary).to.be.true;
        });
    });

});