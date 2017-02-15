import * as React from 'react';

import * as ReactDOM from 'react-dom';
import * as ReactTestUtils from 'react-addons-test-utils';

let { expect } = chai;

import { EditNav } from './EditNav';

describe('EditNav', () => {

  it('handles the basic scenario of EditNav nodes correctly', () => {
    let component = ReactTestUtils.renderIntoDocument(
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
              { name: 'Test Link', url: 'http://msn.com', position: 8 }]
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
          openInNewTabText: 'Open in new browser tab'
          }
        }
        editNavContextMenuProps={ {
          editText: 'Edit',
          moveupText: 'Move up',
          movedownText: 'Move down',
          indentlinkText: 'Make sub link',
          promotelinkText: 'Promote sub link',
          removeText: 'Remove'
        } }
     />
    );
    let renderedDOM = ReactDOM.findDOMNode(component as React.ReactInstance);

    expect(renderedDOM.getElementsByClassName('ms-EditNav-link').length).to.equal(7);
  });
});
