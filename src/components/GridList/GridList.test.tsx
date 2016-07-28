/* tslint:disable:no-unused-variable */
import * as React from 'react';
/* tslint:enable:no-unused-variable */

import * as ReactDOM from 'react-dom';
import * as ReactTestUtils from 'react-addons-test-utils';

let { expect } = chai;

import { GridList, IOnRenderCellParams } from './index';

describe('GridList', () => {
  let onRenderCell = (params: IOnRenderCellParams<any>) => {
    let {
      cellHeight,
      cellWidth
    } = params;

    return (
      <img src={ `http://placehold.it/${cellWidth}x${cellHeight}` } height={ cellHeight } width={ cellWidth } />
    );
  };

  let generateArbitraryItems = (itemCount) => Array.apply(null, new Array(itemCount)).map(Number.prototype.valueOf, 1);

  // Create mock boundingClientRect function so that the list has non-zero width
  function mockBoundingClientRect() {
    Element.prototype.getBoundingClientRect = () => {
      return {
        left: 0, right: 1024,
        top: 0, bottom: 1024,
        width: 1024,
        height: 1024
      };
    };
  }

  it('should not crash when given no items', () => {
    mockBoundingClientRect();

    let component = ReactTestUtils.renderIntoDocument(
      <GridList
        items={ [] }
        onRenderCell={ onRenderCell }
      />
    );
    let renderedDOM = ReactDOM.findDOMNode(component);

    expect(renderedDOM.getElementsByClassName('ms-List').length).to.equal(1);
    expect(renderedDOM.getElementsByClassName('ms-GridList-cell').length).to.equal(0);
  });

  it('should render 10 items', () => {
    mockBoundingClientRect();

    let itemCount = 10;
    let component = ReactTestUtils.renderIntoDocument(
      <div className='ms-Test-GridList-container'>
        <GridList
          items={ generateArbitraryItems(itemCount) }
          onRenderCell={ onRenderCell }
        />
      </div>
    );
    let renderedDOM = ReactDOM.findDOMNode(component);

    expect(renderedDOM.getElementsByClassName('ms-List').length).to.equal(1);
    expect(renderedDOM.getElementsByClassName('ms-List-page').length).to.equal(2);
    expect(renderedDOM.getElementsByClassName('ms-GridList-cell').length).to.equal(itemCount);
  });

  it(`should strech thin items to meet minimum aspect ratio`, () => {
    mockBoundingClientRect();

    let minimumRatio = 1.6;
    let cellRatio = 0;
    let onRenderCellGetRatio = (params: IOnRenderCellParams<any>) => {
      cellRatio = params.cellWidth / params.cellHeight;
      return onRenderCell(params);
    };

    let component = ReactTestUtils.renderIntoDocument(
      <div className='ms-Test-GridList-container'>
        <GridList
          items={ generateArbitraryItems(1) }
          onRenderCell={ onRenderCellGetRatio }
          minimumCellRatio={ minimumRatio }
        />
      </div>
    );
    let renderedDOM = ReactDOM.findDOMNode(component);

    expect(renderedDOM.getElementsByClassName('ms-GridList-cell').length).to.equal(1);
    expect(cellRatio).to.equal(minimumRatio); // Floating point approximation
  });

  it('when minimum height is greater than the maximum height, all cells are the minimum height', () => {
    mockBoundingClientRect();

    let itemCount = 10;
    let minimumHeight = 128;
    let cellHeights = new Array(itemCount);
    let onRenderCellGetHeight = (params: IOnRenderCellParams<any>) => {
      cellHeights[params.index] = params.cellHeight;
      return onRenderCell(params);
    };

    let component = ReactTestUtils.renderIntoDocument(
      <div className='ms-Test-GridList-container'>
        <GridList
          items={ generateArbitraryItems(itemCount) }
          onRenderCell={ onRenderCellGetHeight }
          maximumHeight={ minimumHeight / 2 }
          minimumHeight={ minimumHeight }
        />
      </div>
    );
    let renderedDOM = ReactDOM.findDOMNode(component);

    expect(renderedDOM.getElementsByClassName('ms-GridList-cell').length).to.equal(itemCount);
    for (let i = 0; i < itemCount; i++) {
      expect(cellHeights[i]).to.equal(minimumHeight);
    }
  });
});
