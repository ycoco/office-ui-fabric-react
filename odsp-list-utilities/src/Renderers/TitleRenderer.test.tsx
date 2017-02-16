/* tslint:disable:no-unused-variable */
import * as React from 'react';
/* tslint:enable:no-unused-variable */

import * as ReactDOM from 'react-dom';
import * as ReactTestUtils from 'react-addons-test-utils';
import { TitleRenderer, ITitleRendererProps } from './TitleRenderer';
import chai = require('chai');

const assert = chai.assert;
const expect = chai.expect;

const basicTitleProps: ITitleRendererProps = {
  text: 'Kitty Petting Club',
  hasTitle: true,
  isLinkTitle: true,
  onClick: (evt: React.MouseEvent<HTMLElement>) => { /* do nothing */ }
}

describe('TitleRenderer', () => {
  it('renders a title', () => {
    const renderer = ReactTestUtils.createRenderer();
    renderer.render(<TitleRenderer { ...basicTitleProps } />);
    const result = renderer.getRenderOutput();

    assert.equal(result.type, 'div', 'Rendered a div');
  });
});