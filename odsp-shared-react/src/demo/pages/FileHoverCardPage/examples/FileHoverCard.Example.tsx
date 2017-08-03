import * as React from 'react';
import { DetailsList } from 'office-ui-fabric-react/lib/DetailsList';
import { FileHoverCard, IFileHoverCardStrings } from '../../../../index';
import { FileHoverCardStoreExample } from './FileHoverCardStoreExample';
import { autobind } from 'office-ui-fabric-react/lib/Utilities';
import './FileHoverCard.Example.scss';

const mockItems = JSON.parse('[{"key":"item-0 in commodo eu nostrud","name":"voluptate Ut aliqua. deserunt id","location":"Seattle","fileName":"Voluptate Ut Aliqua..docx"},{"key":"item-1 qui anim dolor ut","name":"amet, ut mollit in mollit","location":"Los Angeles","fileName":"Amet, Ut Mollit.docx"},{"key":"item-2 in laboris pariatur. veniam,","name":"Duis voluptate ut minim nisi","location":"Seattle","fileName":"Duis Voluptate Ut.docx"},{"key":"item-3 aliqua. irure dolor ad","name":"ipsum enim non ullamco in","location":"Los Angeles","fileName":"Ipsum Enim Non.docx"},{"key":"item-4 ad ex consectetur est","name":"in in exercitation dolore sit","location":"Seattle","fileName":"In In Exercitation.docx"},{"key":"item-5 Ut Ut ut anim","name":"Lorem dolor mollit magna ut","location":"Seattle","fileName":"Lorem Dolor Mollit.docx"},{"key":"item-6 qui sint occaecat est","name":"ex esse id deserunt Lorem","location":"New York","fileName":"Ex Esse Id.docx"},{"key":"item-7 incididunt minim mollit amet,","name":"Duis eiusmod magna commodo dolore","location":"Los Angeles","fileName":"Duis Eiusmod Magna.docx"},{"key":"item-8 consequat. nulla non aliqua.","name":"dolore cillum reprehenderit in sed","location":"Portland","fileName":"Dolore Cillum Reprehenderit in sed Cillum Dolore lus.docx"},{"key":"item-9 ad fugiat sunt minim","name":"labore sint ad ea ex","location":"Portland","fileName":"Labore Sint Ad.docx"}]');
const mockColumns = JSON.parse('[{"key":"fileName","name":"fileName","fieldName":"Name","minWidth":100,"maxWidth":300,"isCollapsable":true,"isMultiline":false,"isSorted":false,"isSortedDescending":false,"isRowHeader":false,"columnActionsMode":1,"isGrouped":false},{"key":"location","name":"location","fieldName":"location","minWidth":100,"maxWidth":300,"isCollapsable":true,"isMultiline":false,"isSorted":false,"isSortedDescending":false,"isRowHeader":false,"columnActionsMode":1,"isGrouped":false},{"key":"key","name":"key","fieldName":"key","minWidth":100,"maxWidth":300,"isCollapsable":true,"isMultiline":false,"isSorted":false,"isSortedDescending":false,"isRowHeader":false,"columnActionsMode":1,"isGrouped":false}]');
const mockActivity = {
  activityDateTime: '10:02am',
  activityType: 'Access',
  actor: {
    user: {
      displayName: 'Alan Munger',
      id: '0',
      email: 'alan@microsoft.com',
      image: 'https://static2.sharepointonline.com/files/fabric/office-ui-fabric-react-assets/persona-male.png'
    }
  }
};
const mockStrings: IFileHoverCardStrings = {
  accessActivity: 'last viewed this',
  viewers: 'Viewers',
  views: 'Views',
  details: 'See details'
};

export class FileHoverCardExample extends React.Component<any, {}> {

  public static childContextTypes = {
    fileHoverCardStore: React.PropTypes.object.isRequired
  }

  public getChildContext() {
    return {
      fileHoverCardStore: new FileHoverCardStoreExample()
    };
  }

  public render() {
    return (
      <div>
        <p> Hover over location of a row item to see the card </p>
        <DetailsList
          setKey='hoverSet'
          items={ mockItems }
          columns={ mockColumns }
          onRenderItemColumn={ this._onRenderItemColumn }
        />
      </div>
    );
  }

  @autobind
  private _onRenderItemColumn(item, index, column) {
    if (column.key === 'fileName') {
      return (
        <div className='FileHoverCardExample--item'>
          <FileHoverCard
            itemTitle={ item.fileName }
            currentUserActivity={ mockActivity }
            item={ { itemId: item.key } }
            onDetails={ this._onDetails }
            onView={ this._onView }
            data={ item }
            actionBarItems={ [
              {
                key: 'share',
                icon: 'share',
                data: item,
                onClick: this._onShare
              }
            ] }
            locStrings={ mockStrings }
          >
            { item.fileName }
          </FileHoverCard>
        </div>
      );
    }

    return item[column.key];
  }

  @autobind
  private _onView(event, item) {
    alert(`onView: ${item.data.location}`);
  }

  @autobind
  private _onShare(event, item) {
    alert(`onShare: ${item.data.location}`);
  }

  @autobind
  private _onDetails(event, item) {
    alert(`onDetails: ${item.data.location}`);
  }
}