import * as React from 'react';
import { FocusZone, FocusZoneDirection } from '@ms/office-ui-fabric-react/lib/utilities/focus/index';
import { ContextualMenu, IContextualMenuItem, DirectionalHint } from '@ms/office-ui-fabric-react';
import { getRTL, setRTL } from '@ms/office-ui-fabric-react/lib/utilities/rtl';
import './Header.scss';
import { withResponsiveMode, ResponsiveMode } from '@ms/office-ui-fabric-react/lib/utilities/decorators/withResponsiveMode';

export interface IHeaderProps {
  title: string;
  sideLinks: { name: string, url: string }[];

  isMenuVisible: boolean;
  onIsMenuVisibleChanged?: (isMenuVisible: boolean) => void;

  responsiveMode?: ResponsiveMode;
}

export interface IHeaderState {
  contextMenu?: {
    target: HTMLElement,
    items: IContextualMenuItem[]
  };
  isRTLEnabled?: boolean;
}

@withResponsiveMode
export class Header extends React.Component<IHeaderProps, IHeaderState> {
  constructor(props: IHeaderProps) {
    super(props);

    this._onGearClick = this._onGearClick.bind(this);
    this._onDismiss = this._onDismiss.bind(this);
    this._onRTLToggled = this._onRTLToggled.bind(this);
    this._onMenuClick = this._onMenuClick.bind(this);

    this.state = {
      contextMenu: null,
      isRTLEnabled: getRTL()
    };
  }

  public render() {
    let { title, sideLinks, responsiveMode } = this.props;
    let { contextMenu } = this.state;

    // In medium and below scenarios, hide the side links.
    if (responsiveMode <= ResponsiveMode.medium) {
      sideLinks = [ ];
    }

    return (
      <div>
        <div className='Header'>
          { (responsiveMode <= ResponsiveMode.medium) && (
            <button className='Header-button' onClick={ this._onMenuClick }>
              <i className='ms-Icon ms-Icon--menu'/>
            </button>
          ) }
          <div className='Header-title ms-font-xl ms-fontColor-white'>
            <i className='ms-Icon ms-Icon--classroom' />
            { title }
          </div>
          <div className='Header-buttons'>
            <FocusZone direction={ FocusZoneDirection.horizontal }>
              { sideLinks.map((link, linkIndex) => (
                <a key={ linkIndex } className='Header-button ms-fontColor-white' href={ link.url }>{ link.name }</a>
              )).concat([
                <button key='headerButton' className='Header-button' onClick={ this._onGearClick }>
                  <i className='ms-Icon ms-Icon--gear'/>
                </button>
              ]) }
            </FocusZone>
          </div>
        </div>
        { contextMenu ? (
        <ContextualMenu
          items={ contextMenu.items }
          isBeakVisible={ true }
          targetElement={ contextMenu.target }
          directionalHint={ DirectionalHint.bottomRightEdge }
          gapSpace={ 5 }
          onDismiss={ this._onDismiss } />
        ) : (null) }
      </div>
    );
  }

  private _onMenuClick(ev: React.MouseEvent) {
    let { onIsMenuVisibleChanged, isMenuVisible } = this.props;

    if (onIsMenuVisibleChanged) {
      onIsMenuVisibleChanged(!isMenuVisible);
    }
  }

  private _onGearClick(ev: React.MouseEvent) {
    let { contextMenu } = this.state;

    this.setState({
      contextMenu: contextMenu ? null : {
        target: ev.currentTarget as HTMLElement,
        items: this._getOptionMenuItems()
      }
    });
  }

  private _getOptionMenuItems(): IContextualMenuItem[] {
    return [{
      key: 'isRTL',
      name: `Render in ${ this.state.isRTLEnabled ? 'LTR' : 'RTL' }`,
      icon: 'gear',
      onClick: this._onRTLToggled
    }];
  }

  private _onRTLToggled(item: any, ev: React.MouseEvent) {
    let { isRTLEnabled } = this.state;

    setRTL(!isRTLEnabled);

    this.setState({
      isRTLEnabled: !isRTLEnabled,
      contextMenu: null
    });
  }

  private _onDismiss() {
    this.setState({
      contextMenu: {
        target: null,
        items: null
      }
    });
  }
}
