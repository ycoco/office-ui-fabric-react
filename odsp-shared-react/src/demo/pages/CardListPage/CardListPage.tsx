import * as React from 'react';
import { ExampleCard } from '../../index';
import { CardListExample } from './examples/CardList.Example';
import { CardListWithCompactCardExample } from './examples/CardListWithCompactCard.Example';
let CardListExampleCode = require('./examples/CardList.Example.tsx');
let CardListWithCompactCardExampleCode = require('./examples/CardListWithCompactCard.Example.tsx');

export class CardListPage extends React.Component<any, any> {
  public render() {
    return (
      <div className='CardListExample'>
        <h1 className='ms-font-xxl'>Card List</h1>
        <div>Card list is used to render items using controls extended from DocumentCard. The card size is auto adjusted to fit the parent surface.</div>
        <h2 className='ms-font-xl'>Examples</h2>
        <ExampleCard title='CardList' code={ CardListExampleCode }>
          <CardListExample />
        </ExampleCard>
        <ExampleCard title='CardList use compact card' code={ CardListWithCompactCardExampleCode }>
          <CardListWithCompactCardExample />
        </ExampleCard>
        <br /><br />
        </div>
    );
  }
}
