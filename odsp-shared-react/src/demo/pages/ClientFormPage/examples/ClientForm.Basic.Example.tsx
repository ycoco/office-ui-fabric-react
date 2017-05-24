// external packages
import * as React from 'react';

// local packages
import { ReactClientForm } from '../../../../ClientForm';
import './ClientForm.Basic.Example.scss';

const mockProps= '{"clientForm":{"item":{"isDropEnabled":false,"permissions":{"High":432,"Low":1011030767},"key":"id=%2Fteams%2Fcyrusplayground%2FLists%2Fstanleyylist%2F1%5F%2E000","revision":0,"queryType":0,"displayType":0,"isPlaceholder":false,"properties":{"ContentTypeId":"0x0100837F3B669D8C20428CBDB94EC4C75C45","Title":"mytitle01","_ModerationComments":"","LinkTitleNoMenu":"mytitle01","LinkTitle":"mytitle01","LinkTitle2":"mytitle01","File_x0020_Type":"","File_x0020_Type.mapapp":"","HTML_x0020_File_x0020_Type.File_x0020_Type.mapcon":"","HTML_x0020_File_x0020_Type.File_x0020_Type.mapico":"icgen.gif","ID":"1","ContentType":"Item","Modified":"5/23/2017 10:19 AM","Modified.FriendlyDisplay":"1|0|6|4","Created":"5/23/2017 10:19 AM","Created.FriendlyDisplay":"1|0|6|4","Author":[{"id":"100","title":"Stanley Yao","email":"stanleyy@microsoft.com","sip":"stanleyy@microsoft.com","picture":""}],"Editor":[{"id":"100","title":"Stanley Yao","email":"stanleyy@microsoft.com","sip":"stanleyy@microsoft.com","picture":""}],"_HasCopyDestinations":"","_HasCopyDestinations.value":"","_CopySource":"","owshiddenversion":"1","owshiddenversion.":"1","WorkflowVersion":"1","WorkflowVersion.":"1","_UIVersion":"512","_UIVersion.":"512","_UIVersionString":"1.0","Attachments":"0","_ModerationStatus":"Approved","_ModerationStatus.":"0","SelectTitle":"1","InstanceID":"","InstanceID.":"","Order":"100","Order.":"100.000000000000","GUID":"{E6014F6F-07CB-4F77-B132-C322C85B68D5}","WorkflowInstanceID":"","FileRef":"/teams/cyrusplayground/Lists/stanleyylist/1_.000","FileDirRef":"/teams/cyrusplayground/Lists/stanleyylist","Last_x0020_Modified":"5/23/2017 10:19 AM","FSObjType":"0","SortBehavior":"0","PermMask":"0x1b03c431aef","FileLeafRef":"1_.000","UniqueId":"{9EEB4956-A5E2-4388-AF53-F216488120E2}","SyncClientId":"","ProgId":"","ScopeId":"{BA27951D-D845-4C0D-B7A8-1F416AA9654C}","HTML_x0020_File_x0020_Type":"","_EditMenuTableStart":"1_.000","_EditMenuTableStart2":"1","_EditMenuTableEnd":"1","LinkFilenameNoMenu":"1_.000","LinkFilename":"1_.000","LinkFilename2":"1_.000","DocIcon":"","ServerUrl":"/teams/cyrusplayground/Lists/stanleyylist/1_.000","EncodedAbsUrl":"https://microsoft.sharepoint.com/teams/cyrusplayground/Lists/stanleyylist/1_.000","BaseName":"1_","MetaInfo":[{"lookupId":1,"lookupValue":"","isSecretFieldValue":false}],"_Level":"1","_Level.":"1","_IsCurrentVersion":"Yes","_IsCurrentVersion.value":"1","ItemChildCount":"0","FolderChildCount":"0","Restricted":"","OriginatorId":"","NoExecute":"0","ContentVersion":"0","_ComplianceFlags":"","_ComplianceTag":"","_ComplianceTagWrittenTime":"","_ComplianceTagUserId":"","AccessPolicy":"","AppAuthor":"","AppEditor":"","SMTotalSize":"190","SMLastModifiedDate":"5/23/2017 10:19 AM","SMTotalFileStreamSize":"0","SMTotalFileCount":"0",".zipUrl":"{.mediaBaseUrl}/transform/zip?cs={.callerStack}","uniqueId":"9eeb4956-a5e2-4388-af53-f216488120e2","FileName":"mytitle01","nameFieldAriaLabel":"mytitle01","iconFieldAriaLabel":"","modifiedFieldAriaLabel":"Modified, 4 hours ago","calloutInvokerIconAriaLabel":"Open context menu for selected item","modifiedByFieldAriaLabel":"Modified By, Stanley Yao"},"recycleBinProperties":{},"reputationProperties":{},"statistics":{"views":0,"viewsUnique":0,"viewsLast2Weeks":0,"viewsLast2WeeksUnique":0,"viewsLastWeek":0,"viewsLastWeekUnique":0,"viewsLastMonth":0,"viewsLastMonthUnique":0},"urls":{"1":"/teams/cyrusplayground/Lists/stanleyylist/1_.000","5":"/teams/cyrusplayground/Lists/stanleyylist/1_.000","7":"undefined&manifestMetadata="},"state":{"upload":{"status":5},"removing":false},"parentKey":"id=%2Fteams%2Fcyrusplayground%2FLists%2Fstanleyylist","extension":"","id":"/teams/cyrusplayground/Lists/stanleyylist/1_.000","policyTip":0,"listItem":{},"name":"mytitle01","displayName":"mytitle01","dateModifiedValue":"5/23/2017 10:19 AM","dateModified":"4 hours ago","totalSize":190,"openUrl":"/teams/cyrusplayground/Lists/stanleyylist/1_.000","type":0,"sharingRole":0,"sharingType":5,"iconName":"listitem","defaultSubText":"edited by Stanley Yao","isDraggable":true,"parent":{"isDropEnabled":true,"permissions":{"High":432,"Low":1011030767},"key":"id=%2Fteams%2Fcyrusplayground%2FLists%2Fstanleyylist","revision":0,"queryType":0,"displayType":0,"isPlaceholder":false,"properties":{"commandsSupported":false,"id":"/teams/cyrusplayground/Lists/stanleyylist","folder":{"childCount":1,"startIndex":0,"children":[{"ContentTypeId":"0x0100837F3B669D8C20428CBDB94EC4C75C45","Title":"mytitle01","_ModerationComments":"","LinkTitleNoMenu":"mytitle01","LinkTitle":"mytitle01","LinkTitle2":"mytitle01","File_x0020_Type":"","File_x0020_Type.mapapp":"","HTML_x0020_File_x0020_Type.File_x0020_Type.mapcon":"","HTML_x0020_File_x0020_Type.File_x0020_Type.mapico":"icgen.gif","ID":"1","ContentType":"Item","Modified":"5/23/2017 10:19 AM","Modified.FriendlyDisplay":"1|0|6|4","Created":"5/23/2017 10:19 AM","Created.FriendlyDisplay":"1|0|6|4","Author":[{"id":"100","title":"Stanley Yao","email":"stanleyy@microsoft.com","sip":"stanleyy@microsoft.com","picture":""}],"Editor":[{"id":"100","title":"Stanley Yao","email":"stanleyy@microsoft.com","sip":"stanleyy@microsoft.com","picture":""}],"_HasCopyDestinations":"","_HasCopyDestinations.value":"","_CopySource":"","owshiddenversion":"1","owshiddenversion.":"1","WorkflowVersion":"1","WorkflowVersion.":"1","_UIVersion":"512","_UIVersion.":"512","_UIVersionString":"1.0","Attachments":"0","_ModerationStatus":"Approved","_ModerationStatus.":"0","SelectTitle":"1","InstanceID":"","InstanceID.":"","Order":"100","Order.":"100.000000000000","GUID":"{E6014F6F-07CB-4F77-B132-C322C85B68D5}","WorkflowInstanceID":"","FileRef":"/teams/cyrusplayground/Lists/stanleyylist/1_.000","FileDirRef":"/teams/cyrusplayground/Lists/stanleyylist","Last_x0020_Modified":"5/23/2017 10:19 AM","FSObjType":"0","SortBehavior":"0","PermMask":"0x1b03c431aef","FileLeafRef":"1_.000","UniqueId":"{9EEB4956-A5E2-4388-AF53-F216488120E2}","SyncClientId":"","ProgId":"","ScopeId":"{BA27951D-D845-4C0D-B7A8-1F416AA9654C}","HTML_x0020_File_x0020_Type":"","_EditMenuTableStart":"1_.000","_EditMenuTableStart2":"1","_EditMenuTableEnd":"1","LinkFilenameNoMenu":"1_.000","LinkFilename":"1_.000","LinkFilename2":"1_.000","DocIcon":"","ServerUrl":"/teams/cyrusplayground/Lists/stanleyylist/1_.000","EncodedAbsUrl":"https://microsoft.sharepoint.com/teams/cyrusplayground/Lists/stanleyylist/1_.000","BaseName":"1_","MetaInfo":[{"lookupId":1,"lookupValue":"","isSecretFieldValue":false}],"_Level":"1","_Level.":"1","_IsCurrentVersion":"Yes","_IsCurrentVersion.value":"1","ItemChildCount":"0","FolderChildCount":"0","Restricted":"","OriginatorId":"","NoExecute":"0","ContentVersion":"0","_ComplianceFlags":"","_ComplianceTag":"","_ComplianceTagWrittenTime":"","_ComplianceTagUserId":"","AccessPolicy":"","AppAuthor":"","AppEditor":"","SMTotalSize":"190","SMLastModifiedDate":"5/23/2017 10:19 AM","SMTotalFileStreamSize":"0","SMTotalFileCount":"0",".zipUrl":"{.mediaBaseUrl}/transform/zip?cs={.callerStack}"}]},"nextRequestToken":"","PermMask":"0x1b03c431aef","groups":null,"nameFieldAriaLabel":"undefined, Folder","iconFieldAriaLabel":"Folder","modifiedFieldAriaLabel":"","calloutInvokerIconAriaLabel":"Open context menu for selected item","modifiedByFieldAriaLabel":"Modified By, "},"recycleBinProperties":{},"reputationProperties":{},"statistics":{"views":0,"viewsUnique":0,"viewsLast2Weeks":0,"viewsLast2WeeksUnique":0,"viewsLastWeek":0,"viewsLastWeekUnique":0,"viewsLastMonth":0,"viewsLastMonthUnique":0},"urls":{"7":"undefined&manifestMetadata="},"state":{"upload":{"status":5},"removing":false},"type":1,"isRootFolder":true,"name":"stanleyylist","displayName":"stanleyylist","list":{"id":"{D819D31D-9803-4516-85DE-2D91AAD3DFE6}","allowGridMode":true,"allowCreateFolder":false,"enableMinorVersions":false,"enableVersions":false,"templateType":100,"isDocumentLibrary":false,"isModerated":false,"newWOPIDocumentEnabled":false,"permissions":{"manageLists":true,"managePersonalViews":true,"openItems":true},"openInClient":false,"excludeFromOfflineClient":false,"contentTypesEnabled":false},"extension":"","id":"/teams/cyrusplayground/Lists/stanleyylist","policyTip":0,"isDocSet":false,"folder":{},"sharingRole":0,"sharingType":5,"iconName":"folder","defaultSubText":"","isDraggable":true},"hasClientFormData":true},"formType":3,"contentType":"Item","contentTypeId":"0x0100837F3B669D8C20428CBDB94EC4C75C45","fields":[{"hasException":false,"errorMessage":"","schema":{"Id":"fa564e0f-0c70-4ab9-b863-0177e6ddd247","Title":"Title","Hidden":false,"IMEMode":null,"Name":"Title","Required":false,"Direction":"none","FieldType":"Text","Description":"","ReadOnlyField":false,"IsAutoHyperLink":true,"Type":"Text","DefaultValue":null,"DefaultValueTyped":null,"MaxLength":255},"state":0,"data":"mytitle01","serverData":"mytitle01"},{"hasException":false,"errorMessage":"","schema":{"Id":"67df98f4-9dec-48ff-a553-29bece9c5bf4","Title":"Attachments","Hidden":false,"IMEMode":null,"Name":"Attachments","Required":false,"Direction":"none","FieldType":"Attachments","Description":"","ReadOnlyField":false,"IsAutoHyperLink":false,"Type":"Attachments","DefaultValue":null,"DefaultValueTyped":null},"state":0,"data":"","serverData":""}]},"interactiveSave":true,"isInfoPane":false}';

export interface IClientFormBasicExampleState {
  count: number;
}

export class ClientFormBasicExample extends React.Component<any, IClientFormBasicExampleState> {
  constructor() {
    super();

    this.state = {
      count: 0
    };
  }

  public render() {
    let props = JSON.parse(mockProps);
    props.onSave = (any) => {
      let newCount = this.state.count + 1;
      this.setState({
        count: newCount
      });
    }
    return (
      <div className='ms-ClientForm-container'>
        <ReactClientForm { ...props } />

        <div className='ms-ClientForm-output'>Output:</div>
        <div>onSave() callback was called { this.state.count } times.</div>
      </div>
    );
  }
}
