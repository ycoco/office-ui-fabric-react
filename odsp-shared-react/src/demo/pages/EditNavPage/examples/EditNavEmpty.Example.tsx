import * as React from 'react';
import {
  EditNav
} from '../../../../index';
import './EditNav.Example.scss';

export class EditNavEmptyExample extends React.Component<any, any> {
  public render() {
    return (
      <div className='ms-editNavExample-Panel' >
        <EditNav
          groups={ [{
            links: [] }] }
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
            linkToLabel: 'Choose an option',
            linkToLinks: [
              { name: 'Group Conversation', url: 'http://bing.com' },
              { name: 'Group Calendar', url: 'http://msn.com' },
              { name: 'Group Planner', url: 'http://cnn3.com' },
              { name: 'Group Notebook', url: 'http://cnn4.com' }]
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
