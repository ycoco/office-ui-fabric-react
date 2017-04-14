import * as React from 'react';
import {
  EditNav
} from '../../../../index';
import './EditNav.Example.scss';

export class EditNavExample extends React.Component<any, any> {
  public render() {
    return (
      <div className='ms-editNavExample-Panel' >
        <EditNav
          groups={[{
            links: [
              { name: 'Home', url: 'http://example.com', position: 0, links: [{ name: 'A Link child-1 with a long name', url: 'http://msn.com', position: 1 }, { name: 'A Link child-2', url: 'http://msn.com', position: 2 }], isExpanded: true },
              { name: 'Documents', url: 'http://example.com', position: 3 },
              { name: 'Shared with us', url: 'http://msn.com', position: 4, 'key': '-3' },
              { name: 'Site Contents', url: 'http://msn.com', position: 5 },
              { name: 'Pages', url: 'http://msn.com', position: 6, 'key': '-1' },
              { name: 'Recycle bin', url: 'http://msn.com', position: 6, 'key': '-2' },,
              { name: 'Page Link has a very long name', url: 'http://msn.com', position: 7 },
              { name: 'Test Link1', url: 'http://msn.com', position: 8 },
              { name: 'Test Link2', url: 'http://msn.com', position: 9 },
              { name: 'Test Link3', url: 'http://msn.com', position: 10 },
              { name: 'Test Link4', url: 'http://msn.com', position: 11 },
              { name: 'Test Link5', url: 'http://msn.com', position: 12 }]
          }]}
        saveButtonLabel={ 'Save' }
        cancelButtonLabel={ 'Cancel' }
        addLinkTitle={ 'Add a link' }
        editLinkTitle={ 'Edit a link' }
        ariaLabelContextMenu={ '{0} Context menu' }
        editNavCalloutProps={ {
          title: 'Add a link',
          okLabel: 'OK',
          cancelLabel: 'Cancel',
          addressLabel: 'Address',
          displayLabel: 'Display Text',
          addressPlaceholder: 'http://',
          displayPlaceholder: 'Type link display name',
          errorMessage: 'You need to enter a valid url',
          openInNewTabText: 'Open in new browser tab',
          linkToLabel: 'Link to Office365 services',
          linkToLinks: [ { name: 'Create a link to', url: 'http://' },
                         { name: 'Group Conversation', url: 'http://bing.com' },
                         { name: 'Group Calendar', url: 'http://cnn1.com' },
                         { name: 'Group Planner', url: 'http://cnn3.com' },
                         { name: 'Group Notebook', url: 'http://cnn4.com' } ]
        } }
        editNavContextMenuProps={ {
          editText: 'Edit',
          moveupText: 'Move up',
          movedownText: 'Move down',
          indentlinkText: 'Make sub link',
          promotelinkText: 'Promote sub link',
          removeText: 'Remove'
        } }
       />
      </div>
    );
  }
}
