/* tslint:disable:no-unused-variable */
import * as React from 'react';
/* tslint:enable:no-unused-variable */

import * as ReactDOM from 'react-dom';
import * as ReactTestUtils from 'react-addons-test-utils';

let { expect } = chai;

import {
  ItemTile,
  ItemTileType
} from './index';

import {
  Selection
} from 'office-ui-fabric-react/lib/utilities/selection/index';

describe('ItemTile', () => {

  it('renders an itemtile', () => {
    let component = ReactTestUtils.renderIntoDocument(
      <ItemTile
        itemTileType={ ItemTileType.file }
        displayName='Hello, world!'
      />
    );
    let renderedDOM = ReactDOM.findDOMNode(component);

    expect(
      renderedDOM.getElementsByClassName('ms-ItemTile-name')[0] &&
      renderedDOM.getElementsByClassName('ms-ItemTile-name')[0].textContent
      ).to.equal('Hello, world!');
  });

  it('should call onClick callback when clicked', () => {
    let clicked = false;

    let component = ReactTestUtils.renderIntoDocument(
      <ItemTile
        itemTileType={ ItemTileType.file }
        displayName='Hello, world!'
        onClick={ () => {
          clicked = true;
        } }
      />
    );
    let renderedDOM = ReactDOM.findDOMNode(component);

    ReactTestUtils.Simulate.click(renderedDOM);
    expect(clicked).to.equal(true);
  });

  it('should not call onClick callback when checkCircle clicked or pressed', () => {
    let clicked = false;

    let component = ReactTestUtils.renderIntoDocument(
      <ItemTile
        itemTileType={ ItemTileType.file }
        displayName='Hello, world!'
        onClick={ () => {
          clicked = true;
        } }
      />
    );
    let renderedDOM = ReactDOM.findDOMNode(component);

    expect(renderedDOM.getElementsByClassName('ms-ItemTile-checkCircle').length).to.equal(1);
    ReactTestUtils.Simulate.click(renderedDOM.getElementsByClassName('ms-ItemTile-checkCircle')[0]);
    ReactTestUtils.Simulate.mouseDown(renderedDOM.getElementsByClassName('ms-ItemTile-checkCircle')[0]);
    expect(clicked).to.equal(false);
  });

  it('should select itemtile on mousedown', () => {
    let selection = new Selection();
    selection.setItems([0]);

    let component = ReactTestUtils.renderIntoDocument(
      <ItemTile
        itemTileType={ ItemTileType.file }
        displayName='Hello, world!'
        itemIndex={ 0 }
        selection={ selection }
      />
    );
    let renderedDOM = ReactDOM.findDOMNode(component);

    ReactTestUtils.Simulate.mouseDown(renderedDOM);
    expect(selection.isIndexSelected(0)).to.equal(true);
  });
});
