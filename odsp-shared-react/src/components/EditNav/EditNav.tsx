/**
 * @copyright Microsoft Corporation. All rights reserved.
 *
 * @EditNav component that will render rencent EditNav composite component.
 */

import * as React from 'react';
import { FocusZone, FocusZoneDirection } from 'office-ui-fabric-react/lib/FocusZone';
import { EventGroup, autobind, Async } from 'office-ui-fabric-react/lib/Utilities';
import { Button, ButtonType } from 'office-ui-fabric-react/lib/Button';
import StringHelper = require('@ms/odsp-utilities/lib/string/StringHelper');
import Uri from '@ms/odsp-utilities/lib/uri/Uri';

// odsp-shared-react
import './EditNav.scss';
import { EditNavContextMenu } from './EditNavContextMenu/EditNavContextMenu';
import { EditNavCallout } from './EditNavCallout/EditNavCallout';
import { EditNavDataCache } from './EditNavDataCache';

import {
  IEditNavProps,
  IEditNavLinkGroup,
  IEditNavLink
} from './EditNav.Props';

const EDITNAVLINK_CHANGE = 'editnavchange';
const INDEX_FORMAT = '{0}_{1}_{2}_{3}';

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
  /** Save failed error message. */
  errorMessage?: string;
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

  public refs: {
    [key: string]: React.ReactInstance;
    root: HTMLElement;
  };

  private _editNavItemsRef: { [index: number]: HTMLElement };
  private _resolvedElement: (index: number) => (el: HTMLElement) => any;

  private _dataCache: EditNavDataCache;
  private _events: EventGroup;
  private _insertMode: boolean;
  private _currentPos: number;
  private _async: Async;
  private _uniqueIndex: number;
  private _defaultCalloutDropdownKey: string;
  private _isCalloutVisible: boolean;

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
    this._isCalloutVisible = false;
    this._async = new Async(this);
    this._uniqueIndex = 0;
    this._editNavItemsRef = {};
    this._resolvedElement = (index: number) => (el: HTMLElement) => this._editNavItemsRef[index] = el;
  }

  public componentDidMount() {
    if (this._events) {
      this._events.on(window, EDITNAVLINK_CHANGE, this._updateRenderedEditNav);
    }

    this.refs.root.focus();
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

    this._defaultCalloutDropdownKey = undefined;

    return (
      <div>
        <FocusZone direction={ FocusZoneDirection.vertical } ref='root'>
          <nav role='region' aria-label={ this.props.ariaLabel } className={ 'ms-EditNav' + (this.props.isOnTop ? ' is-onTop ms-u-slideRightIn40' : '') }>
            { groupElements }
            <div className='ms-EditNav-Buttons'>
              <span className='ms-EditButton-container'>
                <Button disabled={ this.state.isSaveButtonDisabled }
                  buttonType={ ButtonType.primary }
                  className='ms-Button'
                  data-logging-id={ 'EditNav.Save' }
                  onClick={ this._onSaveClick }>
                  { this.props.saveButtonLabel }
                </Button>
              </span>
              <span className='ms-EditButton-container'>
                <Button className='ms-Button'
                  onClick={ this._onCancelClick }>
                  { this.props.cancelButtonLabel }
                </Button>
              </span>
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
      let insertId = 'insert_0_0_0';
      let link: IEditNavLink = {
        isCalloutVisible: this._isCalloutVisible,
        position: 0
       } as IEditNavLink;
      return (
         <div className={ 'ms-EditNav-link' }>
          <span className={ 'ms-EditNav-insertLine is-visible' }
              id={ 'insert_0_0_0' }
              role={ 'button' }
              data-is-focusable={ true }
              aria-label={ this.props.addLinkTitle }
              onClick={ this._onShowHideCalloutClicked.bind(this, link, 'insert_0_0_0', true) }>
              <i className='ms-Icon ms-EditNav-plusIcon ms-Icon--Add' ></i>
          </span>
          { link.isCalloutVisible ? (
            <EditNavCallout
                targetElement={ this.state.hostElement }
                title={  this.props.addLinkTitle }
                okLabel={ this.props.editNavCalloutProps.okLabel }
                cancelLabel={ this.props.cancelButtonLabel }
                addressLabel={ this.props.editNavCalloutProps.addressLabel }
                displayLabel={ this.props.editNavCalloutProps.displayLabel }
                addressPlaceholder={ this.props.editNavCalloutProps.addressPlaceholder }
                displayPlaceholder={ this.props.editNavCalloutProps.displayPlaceholder }
                onOKClicked={ this._onCalloutOkClicked }
                onCancelClicked={ this._onShowHideCalloutClicked.bind(this, link, insertId, true) }
                errorMessage={ this.props.editNavCalloutProps.errorMessage }
                openInNewTabText={ this.props.editNavCalloutProps.openInNewTabText }
                linkToLabel={ this.props.editNavCalloutProps.linkToLabel }
                linkToLinks={ this._getLinkTolinks(this.props.editNavCalloutProps.linkToLinks, link.url) }
                defaultSelectedKey={ this._defaultCalloutDropdownKey }
                insertMode={ 1 }
              />) : (undefined) }
         </div>
        );
    }

    let siblings = this._getSiblingsCount(links);
    const linkElements: React.ReactElement<HTMLLIElement>[] = links.map(
      (link: IEditNavLink, linkIndex: number) => this._renderLink(link, linkIndex, level, siblings));

    return (
      <ul className={ this.props.horizontal ? 'ms-EditNav-horizontal' : '' } role='list' >
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
        { this._renderCompositeLink(link, linkIndex, level, siblings) }
        { (link.isExpanded ? this._renderLinks(link.links, ++level) : undefined) }
      </li>
    );
  }

  private _renderCompositeLink(link: IEditNavLink, linkIndex: number, level: number, siblings: number): React.ReactElement<HTMLDivElement> {
    let ellipsisId = StringHelper.format(INDEX_FORMAT, 'ctx', level, this._uniqueIndex, linkIndex);
    let insertId = StringHelper.format(INDEX_FORMAT, 'insert', level, this._uniqueIndex, linkIndex);
    let editId = StringHelper.format(INDEX_FORMAT, 'edit', level, this._uniqueIndex, linkIndex);
    this._uniqueIndex++;

    // a text link element compose of link display text, contextMenu button and immediate after an insertline that indicates
    // position of newly added link will be through callout when clicked.
    let menuItems = [];
    menuItems.push({ name: this.props.editNavContextMenuProps.editText, key: 'idEdit', onClick: this._onEditCommandClicked.bind(this, link, editId) });
    if (linkIndex > 0) {
      menuItems.push({ name: this.props.editNavContextMenuProps.moveupText, key: 'idMoveup', onClick: this._onContextMenuCommand.bind(this, link, CtxMenuCommand.moveUp) });
    }
    if (linkIndex < siblings - 1) {
      menuItems.push({ name: this.props.editNavContextMenuProps.movedownText, key: 'idMoveDown', onClick: this._onContextMenuCommand.bind(this, link, CtxMenuCommand.moveDown) });
    }
    if (level === 0 && siblings > 1 && (!link.links || link.links.length === 0)) {
      // only level 0 link without child links can be made to a child link and it has siblings
      menuItems.push({ name: this.props.editNavContextMenuProps.indentlinkText, key: 'idIndentlink', onClick: this._onContextMenuCommand.bind(this, link, CtxMenuCommand.makeSubLink) });
    }
    if (level === 1) {
      // only level 1 link can be promoted to a level 0 link
      menuItems.push({ name: this.props.editNavContextMenuProps.promotelinkText, key: 'idPromotelink', onClick: this._onContextMenuCommand.bind(this, link, CtxMenuCommand.promoteSubLink) });
    }
    menuItems.push({ name: this.props.editNavContextMenuProps.removeText, key: 'idRemove', onClick: this._onContextMenuCommand.bind(this, link, CtxMenuCommand.remove) });

    let ariaLabelForCtx = StringHelper.format(this.props.ariaLabelContextMenu, link.name);
    return (
      <div>
        <div className={ 'ms-EditNav-link' }
          ref={ this._resolvedElement(link.position) }
          href={ link.url }
          title={ link.name }
          aria-label={ link.ariaLabel || link.title }
          id={ editId }
          data-is-focusable={ true }
          role={ 'button' }
          onClick={ this._onShowHideCalloutClicked.bind(this, link, editId, false) }
        >
          <span className='ms-EditNav-linkText'>{ link.name }</span>
        </div>
        <i className={ 'ms-EditNav-linkButton ms-Icon ms-Icon--More' + (link.isContextMenuVisible ? ' is-visible' : '') }
          id={ ellipsisId }
          role={ 'button' }
          aria-label={ ariaLabelForCtx }
          data-is-focusable={ true }
          onClick={ this._onShowHideMenuClicked.bind(this, link, ellipsisId) }></i>
        { link.isContextMenuVisible ? (
          <EditNavContextMenu
            targetElement={ this.state.hostElement }
            menuItems={ menuItems }
            onDismiss={ this._onDismissMenu.bind(this, link) }
          />
        ) : (undefined) }
        <span className={ 'ms-EditNav-insertLine' + (link.isCalloutVisible && this._insertMode ? ' is-visible' : '') }
          id={ insertId }
          role={ 'button' }
          data-is-focusable={ true }
          aria-label={ this.props.addLinkTitle }
          onClick={ this._onShowHideCalloutClicked.bind(this, link, insertId, true) }>
          <i className='ms-Icon ms-EditNav-plusIcon ms-Icon--Add' ></i>
        </span>
        { link.isCalloutVisible ? (
          <EditNavCallout
            targetElement={ this.state.hostElement }
            title={ this._insertMode ? this.props.addLinkTitle : this.props.editLinkTitle }
            okLabel={ this.props.editNavCalloutProps.okLabel }
            cancelLabel={ this.props.cancelButtonLabel }
            addressLabel={ this.props.editNavCalloutProps.addressLabel }
            displayLabel={ this.props.editNavCalloutProps.displayLabel }
            addressPlaceholder={ this._insertMode ? this.props.editNavCalloutProps.addressPlaceholder : '' }
            displayPlaceholder={ this._insertMode ? this.props.editNavCalloutProps.displayPlaceholder : '' }
            addressValue={ this._insertMode ? '' : link.url }
            displayValue={ this._insertMode ? '' : link.name }
            onOKClicked={ this._onCalloutOkClicked }
            onCancelClicked={ this._onShowHideCalloutClicked.bind(this, link, this._insertMode ? insertId : editId, this._insertMode ? true : false) }
            errorMessage={ this.props.editNavCalloutProps.errorMessage }
            openInNewTabText={ this.props.editNavCalloutProps.openInNewTabText }
            linkToLabel={ this.props.editNavCalloutProps.linkToLabel }
            linkToLinks={ this._getLinkTolinks(this.props.editNavCalloutProps.linkToLinks, link.url) }
            defaultSelectedKey={ this._defaultCalloutDropdownKey }
            insertMode={ this._insertMode ? 1 : 0 }
          />
        ) : (undefined) }
      </div>);
  }

  private _getLinkTolinks(links, currentAddress): any[] {
    if (!links || links.length === 0) {
      return undefined;
    }
    let options = [];
    // add default option first
    options.push({ name: 'URL', url: 'http://' });
    links.forEach((link) => {
      options.push(link);
      if (!this._insertMode && this._isSameUrl(currentAddress, link.url)) {
        this._defaultCalloutDropdownKey = link.url;
      }
    });
    return options;
  }

  private _isSameUrl(current: string, linkUrl: string): boolean {
    const curUri: Uri = new Uri(current);
    const linkUri: Uri = new Uri(linkUrl);
    if (current === linkUrl ||
      curUri.getPath() === linkUri.getPath() && curUri.getQuery() === linkUri.getQuery()) {
      return true;
    }
    return false;
  }

  private _getSiblingsCount(links: IEditNavLink[]): number {
    return links.filter((link: IEditNavLink) => link.key === undefined || Number(link.key) >= 0).length;
  }

  private _onEditCommandClicked(link: IEditNavLink, id: string): void {
    // ensure current contextMenu gone
    link.isContextMenuVisible = !link.isContextMenuVisible;
    let elm: HTMLElement = document.getElementById(id) || this._editNavItemsRef[link.position];
    // async to show the Edit callout
    this.setState({ hostElement: elm });
    this._async.setTimeout(() => {
      this._onShowHideCalloutClicked(link, id, false);
    }, 0);
  }

  private _onShowHideCalloutClicked(link: IEditNavLink, id: string, isInsert: boolean): void {
    let isVisible = !this._isCalloutVisible;
    if (isVisible) {
      this._ensureCloseOpenedObject();
      this._currentPos = link.position;
    }
    this._isCalloutVisible = isVisible;
    this._insertMode = isInsert;
    let elm: HTMLElement = id ? document.getElementById(id) : undefined;
    elm = elm || this._editNavItemsRef[link.position];
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

    this.setState({ hostElement: elm });
  }

  private _onCalloutOkClicked(address: string, display: string, openInNewTab: boolean) {
    EventGroup.raise(window, EDITNAVLINK_CHANGE, { address, display, openInNewTab });
  }

  @autobind
  private _updateRenderedEditNav(ev) {
    let address = ev.args.address;
    let display = ev.args.display;
    let openInNewTab = ev.args.openInNewTab;
    this._ensureCloseOpenedObject();

    // Insert/update a link to leftNav at position
    this._dataCache.updateLink(this._currentPos, address, display, this._insertMode, openInNewTab);
    this.setState({ groups: this._dataCache._groups, isSaveButtonDisabled: false });

    ev.stopPropagation();
    ev.preventDefault();
  }

  private _onContextMenuCommand(link: IEditNavLink, cmdType: CtxMenuCommand) {
    link.isContextMenuVisible = !link.isContextMenuVisible;
    this._dataCache.contextMenuCommand(link, cmdType);
    this.setState({ groups: this._dataCache._groups, isSaveButtonDisabled: false });
  }

  @autobind
  private _onSaveClick(ev: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>): void {
    this.props.onSave(this.state.groups);
    ev.stopPropagation();
    ev.preventDefault();
  }

  @autobind
  private _onCancelClick(ev: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) {
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

  private _onDismissMenu(link: IEditNavLink, ev: React.MouseEvent<HTMLElement>) {
    link.isContextMenuVisible = false;
    this.forceUpdate();
    ev.stopPropagation();
    ev.preventDefault();
  }
}
