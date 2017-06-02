// import * as React from 'react';
// import * as ReactDOM from 'react-dom';
// import * as ReactTestUtils from 'react-addons-test-utils';
// import * as sinon from 'sinon';

// import { NoteColumnMoreOptions, INoteColumnMoreOptionsProps } from './index';
// import { IMoreOptionsComponentSchemaValues } from './index';
// import { MockColumnManagementPanelStrings, fillInColumnManagementPanelStrings } from '../../../../containers/columnManagementPanel/index';

// const expect: Chai.ExpectStatic = chai.expect;

// describe('NoteColumnMoreOptions', () => {
//   let component;
//   let renderedDOM;
//   let showMoreOptions = sinon.spy();

//   let strings = fillInColumnManagementPanelStrings(MockColumnManagementPanelStrings as {});
//   let noteColumnMoreOptionsProps: INoteColumnMoreOptionsProps = {
//     numberOfLines: "6",
//     richText: false,
//     appendOnly: false,
//     forDocumentLibrary: false,
//     showMoreOptions: showMoreOptions,
//     strings: strings,
//     versionEnabled: false
//   };

//   beforeEach(() => {
//     component = ReactTestUtils.renderIntoDocument(
//       <NoteColumnMoreOptions { ...noteColumnMoreOptionsProps } />
//     );
//     renderedDOM = ReactDOM.findDOMNode(component as React.ReactInstance);
//   });

//   it('should recognize and validate number of line inputs for non numbers and invalid numbers', () => {
//     const numberOfLines = renderedDOM.getElementsByClassName('ms-ColumnManagementPanel-numberOfLines')[0]
//     const numberOfLinesInput: HTMLInputElement = numberOfLines.getElementsByTagName('input')[0];
//     const validNumberEvent: EventTarget = { value: "25" } as HTMLInputElement;
//     const notANumberEvent: EventTarget = { value: "blue" } as HTMLInputElement;  //non-number value input
//     const numberTooBigEvent: EventTarget = { value: "1001"} as HTMLInputElement; //number value too large input

//     ReactTestUtils.Simulate.input(numberOfLinesInput, { target: validNumberEvent });
//     expect(numberOfLinesInput.value).to.equal("25");
//     expect(component.state.numLinesErrorMessage).to.equal("");
//     let schemaValues: IMoreOptionsComponentSchemaValues = component.getSchemaValues();
//     expect(schemaValues.NumLines).to.equal(25);

//     ReactTestUtils.Simulate.input(numberOfLinesInput, { target: notANumberEvent });
//     expect(numberOfLinesInput.value).to.equal("blue");
//     expect(component.state.numLinesErrorMessage).to.equal(strings.numberOfLinesNotValid);
//     let errorSchemaValues: IMoreOptionsComponentSchemaValues | false = component.getSchemaValues();
//     expect(errorSchemaValues).to.equal(false);

//     ReactTestUtils.Simulate.input(numberOfLinesInput, { target: numberTooBigEvent });
//     expect(numberOfLinesInput.value).to.equal("1001");
//     expect(component.state.numLinesErrorMessage).to.equal(strings.numberOfLinesNotValid);
//     let errorSchemaValues2: IMoreOptionsComponentSchemaValues | false = component.getSchemaValues();
//     expect(errorSchemaValues2).to.equal(false);

//   });

//    it('forDocumentLibrary set to false, recognize and validate apppend only toggle changes', () => {
//     const appendOnly = renderedDOM.getElementsByClassName('appendOnly')[0];
//     const appendOnlyState: HTMLLabelElement = appendOnly.getElementsByClassName('ms-Toggle-stateText')[0];
//     const appendOnlyButton: HTMLButtonElement = appendOnly.getElementsByTagName('button')[0];

//     //checks if checkbox is working
//     expect(appendOnlyState.innerText).to.equal(strings.toggleOffText);
//     ReactTestUtils.Simulate.click(appendOnlyButton);
//     expect(appendOnlyState.innerText).to.equal(strings.toggleOnText);

//     // if versioning enabling is off, append only should not be allowed
//     expect(component.appendOnly).to.equal(true);
//     expect(component.state.appendOnlyErrorMessage).to.equal(strings.appendOnlyNotValid);
//     let errorSchemaValues: IMoreOptionsComponentSchemaValues | false = component.getSchemaValues();
//     expect(errorSchemaValues).to.equal(false);
//     ReactTestUtils.Simulate.click(appendOnlyButton);

//     //if version enabling is on, append only should be allowed
//     component.versionEnabled = true;
//     ReactTestUtils.Simulate.click(appendOnlyButton);
//     expect(appendOnly).to.equal(true);
//     expect(component.state.numLinesErrorMessage).to.equal("");
//     let schemaValues: IMoreOptionsComponentSchemaValues = component.getSchemaValues();
//     expect(schemaValues.AppendOnly).to.equal(true);
//   });

//   it('forDocumentLibrary set to false, recognize and validate rich text toggle changes', () =>{
//     const richText = renderedDOM.getElementsByClassName('richText')[0]
//     const richTextInput: HTMLInputElement = richText.getElementsByTagName('button')[0];
//     const turnOnEvent: EventTarget = { checked: true} as HTMLInputElement;
//     const turnOffEvent: EventTarget = { checked: false} as HTMLInputElement;


//     //Turning on toggle
//     ReactTestUtils.Simulate.input(richTextInput, { target: turnOnEvent });
//     expect(richTextInput.value).to.equal(true);
//     let errorSchemaValues: IMoreOptionsComponentSchemaValues | false = component.getSchemaValues();
//     expect(errorSchemaValues).to.equal(false);
//     let schemaValues: IMoreOptionsComponentSchemaValues = component.getSchemaValues();
//     expect(schemaValues.RichTextMode).to.equal("FullHtml");
//     expect(schemaValues.IsolateStyles).to.equal(true);


//     //Turn toggle off
//     ReactTestUtils.Simulate.click(richTextInput, { target: turnOffEvent });
//     expect(richTextInput.value).to.equal(false);
//     let errorSchemaValues2: IMoreOptionsComponentSchemaValues | false = component.getSchemaValues();
//     expect(errorSchemaValues2).to.equal(false);
//     let schemaValues2: IMoreOptionsComponentSchemaValues = component.getSchemaValues();
//     expect(schemaValues2.RichTextMode).to.equal("Compatible");
//     expect(schemaValues2.IsolateStyles).to.equal(false);
//   });


// });