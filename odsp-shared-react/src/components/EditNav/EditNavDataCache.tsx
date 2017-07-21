import {
  INavLinkGroup,
  INavLink
} from 'office-ui-fabric-react/lib/components/Nav';

import { CtxMenuCommand } from './EditNav';
import { IEditNavLinkGroup, IEditNavLink } from './EditNav.Props';

/**
 * EditNavStateManage DataSource agnostic module that
 * store and responds to the EditNav component data updates
 * data insert and data remove of the current EditNav nodes till
 * onSave is called.  Its life Cycle is from EditNav component mount and unmount.
 */
export class EditNavDataCache {
  public _groups: IEditNavLinkGroup[] = [];

  constructor(groups: INavLinkGroup[]) {
    // make a copy of leftNav nodes for edit
    this._groups = this._getEditGroups(groups);
    this._ensurePositions();
  }

  /**
   * Add or Edit a Nav link
   */
  public updateLink(position: number, address: string, display: string, isInsert: boolean, openInNewTab?: boolean) {
    // insert a new node right after passed in position
    let done: boolean = false;

    // loop through group headers
    for (let i = 0; !done && i < this._groups.length; i++) {
      let group = this._groups[i];
      if (this._groups[i].links.length === 0) {
        // insert into empty list
        this._insertLinkAtIndex(group.links, -1, position, address, display, openInNewTab);
        break;
      }
      let lastIdx = this._groups[i].links.length - 1;
      // loop through level 1 links from last to first order
      for (let j = lastIdx; !done && j >= 0; j--) {
        if (group.links[j].position === position) {
          // insert rigth after this node
          if (isInsert) {
            this._insertLinkAtIndex(group.links, j, position, address, display, openInNewTab);
          } else {
            this._updateLinkAtIndex(group.links, j, position, address, display, openInNewTab);
          }
          done = true;
        } else if (group.links[j].position < position) {
          // insert may be at its children
          if (group.links[j].links) {
            for (let k = 0; k < group.links[j].links.length; k++) {
              let link: IEditNavLink = group.links[j].links[k];
              if (link.position === position) {
                // insert rigth after this node
                if (isInsert) {
                  this._insertLinkAtIndex(group.links[j].links, k, position, address, display, openInNewTab);
                } else {
                  this._updateLinkAtIndex(group.links[j].links, k, position, address, display, openInNewTab);
                }
                done = true;
                break;
              }
            }
          }
        }
      }
    }
  }

  /**
   * ContextMenu command on a Nav link
   */
  public contextMenuCommand(link: IEditNavLink, cmdType: CtxMenuCommand) {
    let done: boolean = false;
    let position = link.position;

    // loop through group headers
    for (let i = 0; !done && i < this._groups.length; i++) {
      let group = this._groups[i];
      // loop through level 1 links from last to first order
      for (let j = 0; !done && j < group.links.length; j++) {
        if (group.links[j].position === position) {
          this._actions(group.links, cmdType, j);
          done = true;
        } else if (group.links[j].position < position) {
          // Loop through children
          if (group.links[j].links) {
            for (let k = 0; !done && k < group.links[j].links.length; k++) {
              let ln: IEditNavLink = group.links[j].links[k];
              if (ln.position === position) {
                this._actions(group.links[j].links, cmdType, k, j, group.links);
                done = true;
              }
            }
          }
        }
      }
    }
  }

  public getViewGroups(): INavLinkGroup[] {
    let gs: INavLinkGroup[] = [];
    gs = this._groups.map((group: IEditNavLinkGroup) => {
      let g = ({
        name: group.name,
        links: this._getViewLinks(group.links),
        automationId: group.automationId
      });
      return g;
    });
    return gs;
  }

  private _getEditGroups(groups: INavLinkGroup[]): IEditNavLinkGroup[] {
    let gs: IEditNavLinkGroup[] = [];
    gs = groups.map((group: INavLinkGroup) => {
      let g = ({
        name: group.name,
        links: this._getLinks(group.links, false),
        automationId: group.automationId
      });
      return g;
    });
    return gs;
  }

  private _getLinks(links: INavLink[], isChildLink: boolean = false): IEditNavLink[] {
    let ls: IEditNavLink[] = [];
    ls = links.map((link: INavLink) => {
      let l = ({
        name: link.name,
        url: link.url,
        key: link.key,
        ariaLabel: link.ariaLabel,
        automationId: link.automationId,
        position: 0,
        links: link.links ? this._getLinks(link.links, true) : null,
        isDeleted: false,
        isContextMenuVisible: false,
        isCalloutVisible: false,
        isExpanded: true,
        isSubLink: isChildLink
      });
      return l;
    });

    return ls;
  }

  private _getViewLinks(links: IEditNavLink[]): INavLink[] {
    let ls: INavLink[] = [];
    ls = links
      .filter((link: IEditNavLink) => !link.isDeleted)
      .map((link: IEditNavLink) => {
        let l = ({
          name: link.name,
          url: link.url,
          key: link.key,
          links: link.links ? this._getViewLinks(link.links) : null,
          ariaLabel: link.ariaLabel,
          automationId: link.automationId,
          isExpanded: true,
          target: link.target
        });
        return l;
      });

    return ls;
  }

  private _actions(links: IEditNavLink[], cmdType: CtxMenuCommand, ifrom: number,
    iparent?: number, parentLinks?: IEditNavLink[]) {
    let to: number;
    switch (cmdType) {
      case CtxMenuCommand.moveUp:
        to = ifrom - 1;
        if (to >= 0) {
          this._swapLinks(links, ifrom, to);
        }
        break;
      case CtxMenuCommand.moveDown:
        to = ifrom + 1;
        if (to < links.length) {
          this._swapLinks(links, ifrom, to);
        }
        break;
      case CtxMenuCommand.remove:
        this._removeLinkAtIndex(links, ifrom);
        break;
      case CtxMenuCommand.makeSubLink:
        this._moveParentLinkToChildLink(links, ifrom);
        break;
      case CtxMenuCommand.promoteSubLink:
        this._moveChildLinkToParentLink(links, ifrom, iparent, parentLinks);
        break;
      default:
        alert('unexpected');
        break;
    }
    this._ensurePositions();
  }

  private _removeLinkAtIndex(links: IEditNavLink[], index: number) {
    if (!links[index].key) {
      // newly added node has not been persisted to server yet, just remove it.
      links.splice(index, 1);
    } else {
      // otherwise server node, mark it as deleted.
      links[index].isDeleted = true;
    }
  }

  private _insertLinkAtIndex(links: IEditNavLink[], index: number, position: number,
    address: string, display: string, openInNewTab: boolean) {
    const targetVal = openInNewTab ? '_blank' : '';
    links.splice(index + 1, 0, { name: display, url: address, target: targetVal, position: position + 1 });
    this._ensurePositions();
  }

  private _updateLinkAtIndex(links: IEditNavLink[], index: number, position: number,
    address: string, display: string, openInNewTab?: boolean) {
    links[index].name = display;
    links[index].url = address;
    links[index].target = openInNewTab ? '_blank' : '';
  }

  private _swapLinks(links: IEditNavLink[], ifrom: number, to: number) {
    if (to < 0 || to > links.length - 1) {
      return;
    }

    let temp = links[to];
    links[to] = links[ifrom];
    links[ifrom] = temp;
    this._ensurePositions();
  }

  private _moveParentLinkToChildLink(links: IEditNavLink[], ifrom: number) {
    // on server data, this treated as node moved.
    let plink = links[ifrom];
    plink.isSubLink = true;

    // insert it as child of parent prev sibling node
    let toIdx = ifrom - 1;
    if (toIdx < 0) {
      toIdx = ifrom + 1;
      if (toIdx >= links.length) {
        // no other parent link to be with
        return;
      }
    }

    if (!links[toIdx].links) {
      links[toIdx].links = [];
    }
    // as as child link to the destinated parent node
    links[toIdx].links.push(plink);
    // make sure parent link is at expanded state
    links[toIdx].isExpanded = true;
    // remove old parent node from level 0 list
    links.splice(ifrom, 1);
  }

  private _moveChildLinkToParentLink(links: IEditNavLink[], ifrom: number,
    iparent: number, parentLinks: IEditNavLink[]) {
    let clink = links[ifrom];
    clink.isSubLink = false;

    // remove from children links
    links.splice(ifrom, 1);

    // add to parent list
    parentLinks.splice(iparent + 1, 0, clink);
  }

  private _ensurePositions() {
    let pos = 0;
    for (let i = 0; i < this._groups.length; i++) {
      let group = this._groups[i];
      // loop through level 1 links from last to first order
      for (let j = 0; j < group.links.length; j++) {
        group.links[j].position = pos++;
        if (group.links[j].links) {
          for (let k = 0; k < group.links[j].links.length; k++) {
            let lk: IEditNavLink = group.links[j].links[k];
            lk.position = pos++;
          }
        }
      }
    }
  }
}
