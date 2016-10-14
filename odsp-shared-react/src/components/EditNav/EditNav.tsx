/**
 * @copyright Microsoft Corporation. All rights reserved.
 *
 * @EditNav component that will render rencent EditNav composite component.
 */

import * as React from 'react';
import { FocusZone, FocusZoneDirection } from 'office-ui-fabric-react/lib/FocusZone';
import { EventGroup } from 'office-ui-fabric-react/lib/utilities/eventGroup/EventGroup';
import { Button, ButtonType } from 'office-ui-fabric-react/lib/Button';
import { autobind } from 'office-ui-fabric-react/lib/utilities/autobind';

// odsp-shared-react
import './EditNav.scss';
import { EditNavContextMenu } from './EditNavContextMenu/EditNavContextMenu';
import { EditNavCallout } from './EditNavCallout/EditNavCallout';
import { EditNavDataCache } from './EditNavDataCache';

import { IEditNavProps,
         IEditNavLinkGroup,
         IEditNavLink } from './EditNav.Props';

const EDITNAVLINK_CHANGE = 'editnavchange';

/**
 * SP EditNav Control supports editable LeftNav Nav links
 */
export interface IEditNavState {
  /** Link with child link expand collapsed state change */
  isGroupExpanded?: boolean[];
  /** Current link as hostElement to the callout or contextMenu */
  hostElement?: HTMLElement;
  /** EditNav links */
  groups?: IEditNavLinkGroup[];
  /** control Save button enable/disable state */
  isSaveButtonDisabled?: boolean;
}

export enum CtxMenuCommand {
  moveUp,
  moveDown,
  makeSubLink,
  promoteSubLink,
  remove
}

export class EditNav extends React.Component<IEditNavProps, IEditNavState> {
  public static defaultProps: IEditNavProps = {
    groups: undefined,
    onRenderLink: (link: IEditNavLink) => (<span className='ms-EditNav-linkText'>{ link.name }</span>)
  };

  private _dataCache: EditNavDataCache;
  private _events: EventGroup;
  private _insertMode: boolean;
  private _currentPos: number;

  constructor(props: IEditNavProps) {
    super(props);

    this.state = {
      isGroupExpanded: [],
      groups: this.props.groups,
      isSaveButtonDisabled: true
    };

    this._dataCache = this.props.dataCache;
    this._events = new EventGroup(this);
    this._insertMode = false;
  }

  public componentDidMount() {
    if (this._events) {
      this._events.on(window, EDITNAVLINK_CHANGE, this._updateRenderedEditNav);
    }
  }

  public componentWillUnmount() {
    if (this._events) {
      this._events.off(window, EDITNAVLINK_CHANGE, this._updateRenderedEditNav);
      this._events.dispose();
      this._events = undefined;
    }
  }

  public render(): React.ReactElement<{}> {
    if (!this.state.groups) {
      return undefined;
    }

    const groupElements: React.ReactElement<{}>[] = this.props.groups.map(
      (group: IEditNavLinkGroup, groupIndex: number) => this._renderGroup(group, groupIndex));

    return (
     <div>
      <FocusZone direction={ FocusZoneDirection.vertical }>
        <nav role='navigation' className={ 'ms-EditNav' + (this.props.isOnTop ? ' is-onTop ms-u-slideRightIn40' : '') }>
          { groupElements }
          <div className='ms-EditNav-Buttons'>
            <Button disabled={ this.state.isSaveButtonDisabled }
              buttonType={ ButtonType.primary }
              className='ms-Button'
              onClick={ this._onSaveClick }>
              { this.props.saveButtonLabel }
            </Button>
            <Button className='ms-Button'
              onClick={ this._onCancelClick }>
              { this.props.cancelButtonLabel }
            </Button>
          </div>
        </nav>
      </FocusZone>
     </div>
    );
  }

  private _renderGroup(group: IEditNavLinkGroup, groupIndex: number): React.ReactElement<HTMLDivElement> {
      const isGroupExpanded: boolean = this.state.isGroupExpanded[groupIndex] !== false;

      return (
        <div key={ groupIndex } className={ 'ms-EditNav-group' + (isGroupExpanded ? ' is-expanded' : '') }>
          { (group.name ?
            <button className='ms-EditNav-groupButton'>
              <i className='ms-EditNav-groupChevron ms-Icon ms-Icon--ChevronDown'></i>
              { group.name }
            </button> : undefined) }
          <div className='ms-EditNav-groupContent'>
          { this._renderLinks(group.links, 0 /*level*/) }
          </div>
        </div>
      );
  }

  private _renderLinks(links: IEditNavLink[], level: number): React.ReactElement<HTMLUListElement> {
    if (!links || !links.length) {
      return undefined;
    }

    let siblings = this._getSiblingsCount(links);
    const linkElements: React.ReactElement<HTMLLIElement>[] = links.map(
      (link: IEditNavLink, linkIndex: number) => this._renderLink(link, linkIndex, level, siblings));

    return (
      <ul className={ this.props.horizontal ? 'ms-EditNav-horizontal' : ''} role='list'>
        { linkElements }
      </ul>
    );
  }

  private _renderLink(link: IEditNavLink, linkIndex: number, level: number, siblings: number): React.ReactElement<HTMLLIElement> {
    // any link key is negative are client nodes that should not be part of edit
    if (!link || link.isDeleted || Number(link.key) < 0) {
      return undefined;
    }

    // render a link element.
    return (
        <li className='ms-EditNav-linkRow' key={ link.key || linkIndex } role='listitem'>
          { this._renderTextLink(link, linkIndex, level, siblings) }
          { (link.isExpanded ? this._renderLinks(link.links, ++level) : undefined) }
        </li>
      );
  }

  private _renderTextLink(link: IEditNavLink, linkIndex: number, level: number, siblings: number): React.ReactElement<HTMLDivElement> {
    let ellipsisId = 'ctx_' + level.toString() + '_' + linkIndex.toString();
    let insertId = 'insert_' + level.toString() + '_' + linkIndex.toString();
    let editId = 'edit_' + level.toString() + '_' + linkIndex.toString();

    // a text link element compose of link display text, contextMenu button and immediate after an insertline that indicates
    // position of newly added link will be through callout when clicked.
    let menuItems = [];
    if (linkIndex > 0) {
      menuItems.push({ name: this.props.editNavContextMenuProps.moveupText, key: 'idMoveup', onClick: this._onContextMenuCommand.bind(this, link, CtxMenuCommand.moveUp) });
    }
    if (linkIndex < siblings - 1) {
      menuItems.push({ name: this.props.editNavContextMenuProps.movedownText, key: 'idMoveDown', onClick: this._onContextMenuCommand.bind(this, link, CtxMenuCommand.moveDown) });
    }
    if (level === 0 && siblings > 1 && (!link.links || link.links.length === 0) ) {
      // only level 0 link without child links can be made to a child link and it has siblings
      menuItems.push({ name: this.props.editNavContextMenuProps.indentlinkText, key: 'idIndentlink', onClick: this._onContextMenuCommand.bind(this, link, CtxMenuCommand.makeSubLink) });
    }
    if (level === 1) {
      // only level 1 link can be promoted to a level 0 link
      menuItems.push({ name: this.props.editNavContextMenuProps.promotelinkText, key: 'idPromotelink', onClick: this._onContextMenuCommand.bind(this, link, CtxMenuCommand.promoteSubLink) });
    }
    menuItems.push({ name: this.props.editNavContextMenuProps.removeText, key: 'idRemove', onClick: this._onContextMenuCommand.bind(this, link, CtxMenuCommand.remove)});

    return (
      <div>
        <div className={'ms-EditNav-link'}
            href={ link.url }
            title={ link.name }
            ariaLabel={ link.ariaLabel || link.title }
            id={ editId }
            role={ 'link' }
            onClick={ this._onShowHideCalloutClicked.bind(this, link, editId, false) }
          >
          <span className='ms-EditNav-linkText'>{ link.name }</span>
        </div>
        <i className={ 'ms-EditNav-linkButton ms-Icon ms-Icon--More' + (link.isContextMenuVisible ? ' is-visible' : '') }
           id={ ellipsisId }
           role={ 'button' }
           tabIndex={ 0 }
           onClick={ this._onShowHideMenuClicked.bind(this, link, ellipsisId) }></i>
          { link.isContextMenuVisible ? (
              <EditNavContextMenu
                targetElement={ this.state.hostElement }
                menuItems={ menuItems }
                onDismiss={ this._onDismissMenu.bind(this, link) }
              />
              ) : (undefined) }
        <span className={ 'ms-EditNav-insertLine' + (link.isCalloutVisible &&  this._insertMode ? ' is-visible' : '') }
              id={ insertId }
              tabIndex={ 0 }
              onClick={ this._onShowHideCalloutClicked.bind(this, link, insertId, true) }>
          <i className='ms-Icon ms-EditNav-plusIcon ms-Icon--Add' role={ 'button' } ></i>
          </span>
            { link.isCalloutVisible ? (
                this._insertMode ? (
                  <EditNavCallout
                    targetElement={ this.state.hostElement }
                    title={ this.props.addLinkTitle }
                    okLabel={ this.props.editNavCalloutProps.okLabel }
                    cancelLabel={ this.props.cancelButtonLabel }
                    addressLabel={ this.props.editNavCalloutProps.addressLabel }
                    displayLabel={ this.props.editNavCalloutProps.displayLabel }
                    addressPlaceholder={ this.props.editNavCalloutProps.addressPlaceholder }
                    displayPlaceholder={ this.props.editNavCalloutProps.displayPlaceholder }
                    onOKClicked={ this._onCalloutOkClicked }
                    onCancelClicked={ this._onShowHideCalloutClicked.bind(this, link) }
                    errorMessage={ this.props.editNavCalloutProps.errorMessage }
                  /> ) : (
                  <EditNavCallout
                    targetElement={ this.state.hostElement }
                    title={ this.props.editLinkTitle }
                    okLabel={ this.props.editNavCalloutProps.okLabel }
                    cancelLabel={ this.props.cancelButtonLabel }
                    addressLabel={ this.props.editNavCalloutProps.addressLabel }
                    displayLabel={ this.props.editNavCalloutProps.displayLabel }
                    addressValue={ link.url }
                    displayValue={ link.name }
                    onOKClicked={ this._onCalloutOkClicked }
                    onCancelClicked={ this._onShowHideCalloutClicked.bind(this, link) }
                    errorMessage={ this.props.editNavCalloutProps.errorMessage }
                  /> )
                ) : (undefined) }
        </div>);
  }

  private _getSiblingsCount(links: IEditNavLink[]): number {
    return links.filter((link: IEditNavLink) => link.key === undefined || Number(link.key) >= 0).length;
  }

  private _onShowHideCalloutClicked(link: IEditNavLink, id: string, isInsert: boolean): void {
    let isVisible = !link.isCalloutVisible;
    if (isVisible) {
      this._ensureCloseOpenedObject();
      this._currentPos = link.position;
    }
    link.isCalloutVisible = isVisible;
    let elm: HTMLElement = document.getElementById(id);
    this._insertMode = isInsert;
    this.setState({ hostElement: elm, groups: this.props.groups });
  }

  private _onShowHideMenuClicked(link: IEditNavLink, id: string): void {
    let isVisible = !link.isContextMenuVisible;
    if (isVisible) {
      this._ensureCloseOpenedObject();
      this._currentPos = link.position;
    }
    link.isContextMenuVisible = isVisible;
    let elm: HTMLElement = document.getElementById(id);

    this.setState({hostElement: elm});
  }

  private _onCalloutOkClicked(address: string, display: string) {
    EventGroup.raise(window, EDITNAVLINK_CHANGE, {address, display});
  }

  @autobind
  private _updateRenderedEditNav(ev) {
    let address = ev.args.address;
    let display = ev.args.display;
    this._ensureCloseOpenedObject();

    // Insert/update a link to leftNav at position
    this._dataCache.updateLink(this._currentPos, address, display, this._insertMode);
    this.setState({ groups: this._dataCache._groups, isSaveButtonDisabled: false });

    ev.stopPropagation();
    ev.preventDefault();
  }

  private _onContextMenuCommand(link: IEditNavLink, cmdType: CtxMenuCommand) {
    link.isContextMenuVisible = !link.isContextMenuVisible;
    this._dataCache.contextMenuCommand(link, cmdType);
    this.setState({ groups: this._dataCache._groups, isSaveButtonDisabled: false  });
  }

  @autobind
  private _onSaveClick(ev: React.MouseEvent): void {
    this.props.onSave(this.state.groups);
    ev.stopPropagation();
    ev.preventDefault();
  }

  @autobind
  private _onCancelClick(ev: React.MouseEvent) {
    this.props.onCancel(ev);
    ev.stopPropagation();
    ev.preventDefault();
  }

  private _ensureCloseOpenedObject() {
    this.props.groups.forEach((group) => {
      group.links.forEach((link: IEditNavLink) => {
        link.isCalloutVisible = false;
        link.isContextMenuVisible = false;
        if (link.links) {
          link.links.forEach((sublink: IEditNavLink) => {
            sublink.isCalloutVisible = false;
            sublink.isContextMenuVisible = false;
          });
        }
      });
    });
  }

  private _onDismissMenu(link: IEditNavLink, ev: React.MouseEvent) {
      link.isContextMenuVisible = false;
      this.forceUpdate();
      ev.stopPropagation();
      ev.preventDefault();
  }
}
