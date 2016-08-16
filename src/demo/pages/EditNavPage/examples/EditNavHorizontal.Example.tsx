import * as React from 'react';
import {
  EditNav
} from '../../../../index';

export class EditNavHorizontalExample extends React.Component<any, any> {
  public render() {
    return (
        <EditNav
        groups={[{ links: [{ name: 'A link', url: 'http://example.com', links: [{name: 'A Link child-1 with a long name', url: 'http://msn.com' }, { name: 'A Link child-2', url: 'http://msn.com' } ], isExpanded: true}, { name: 'B link', url: 'http://example.com', links: [{ name: 'B Child Link is a very long name', url: 'http://msn.com' } ],isExpanded: true}, { name: 'C Link no chid', url: 'http://msn.com' } ]}]} saveButtonLabel={ 'Save' } cancelButtonLabel={ 'Cancel' } horizontal={ true }
       />
    );
  }
}
