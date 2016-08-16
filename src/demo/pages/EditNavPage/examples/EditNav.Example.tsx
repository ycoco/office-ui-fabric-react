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
        groups={[{ links: [{ name: 'Home', url: 'http://example.com', position: 0, links: [{name: 'A Link child-1 with a long name', url: 'http://msn.com', position: 1 }, { name: 'A Link child-2', url: 'http://msn.com', position: 2 } ], isExpanded: true}, { name: 'Documents', url: 'http://example.com', position: 3 }, { name: 'Shared with me', url: 'http://msn.com', position: 4 }, { name: 'Site Contents', url: 'http://msn.com', position: 5 }, { name: 'Recycle bin', url: 'http://msn.com', position: 6 }, { name: 'Page Link has a very long name', url: 'http://msn.com', position: 7 } ]}]}
        saveButtonLabel={ 'Save' }
        cancelButtonLabel={ 'Cancel' }
        addLinkTitle={ 'Add a link' }
        editLinkTitle={ 'Edit a link' }
        editNavCalloutProps={ {
          title: 'Add a link',
          okLabel: 'OK',
          cancelLabel: 'Cancel',
          addressLabel: 'Address',
          displayLabel: 'Display Text',
          addressPlaceholder: 'http://',
          displayPlaceholder: 'Type link display name',
          errorMessage: 'You need to enter a valid url'
          }
        }
        editNavContextMenuProps={ {
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
