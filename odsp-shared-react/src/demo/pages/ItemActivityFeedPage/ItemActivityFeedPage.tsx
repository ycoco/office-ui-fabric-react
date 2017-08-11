import * as React from 'react';
import { ExampleCard } from '../../index';
import { ItemActivityFeedExample } from './examples/ItemActivityFeed.Example';

const ItemActivityFeedExampleCode = require('./examples/ItemActivityFeed.Example.tsx');

export class ItemActivityFeedPage extends React.Component<any, any> {
    public render() {
        return (
            <div className='ItemActivityFeedExample'>
                <h1 className='ms-font-xxl'>Item Activity Feed (Work in Progress)</h1>
                <div>Do not use this component yet!</div>
                <h2 className='ms-font-xl'>Examples</h2>
                <ExampleCard title='ItemActivityFeed' code={ ItemActivityFeedExampleCode }>
                    <ItemActivityFeedExample />
                </ExampleCard>
                <br /><br />
            </div>
        );
    }
}
