import * as React from 'react';
import { ExampleCard } from '../../index';
import { PropertiesTableSet } from '../../components/PropertiesTable/PropertiesTableSet';
import { GroupCardTextLinksExample } from './examples/GroupCard.TextLinks.Example';
import { GroupCardTextAndIconExample } from './examples/GroupCard.TextAndIconLinks.Example';
import { GroupCardIconLinksExample } from './examples/GroupCard.IconLinks.Example';

const GroupCardTextAndIconLinksExampleCode = require('./examples/GroupCard.TextAndIconLinks.Example.tsx');
const GroupCardTextLinksExampleCode = require('./examples/GroupCard.TextLinks.Example.tsx');
const GroupCardIconLinksExampleCode = require('./examples/GroupCard.IconLinks.Example.tsx');

export class GroupCardPage extends React.Component<any, any> {

  public render() {
    return (
      <div className='GroupCardExample'>
        <h1 className='ms-font-xxl'>GroupCard</h1>
        <div>GroupCard component </div>
        <h2 className='ms-font-xl'>Examples</h2>
        <ExampleCard title='GroupCard with text links only' code={ GroupCardTextLinksExampleCode }>
          <GroupCardTextLinksExample />
        </ExampleCard>
        <br /><br />

        <ExampleCard title='GroupCard with Text and Icon links' code={ GroupCardTextAndIconLinksExampleCode }>
          <GroupCardTextAndIconExample />
        </ExampleCard>
        <br /><br />

        <ExampleCard title='GroupCard with icon links only' code={ GroupCardIconLinksExampleCode }>
          <GroupCardIconLinksExample />
        </ExampleCard>
        <br /><br />

        <PropertiesTableSet componentName='GroupCard' />
      </div>
    );
  }
}
