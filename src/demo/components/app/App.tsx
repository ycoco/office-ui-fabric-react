import * as React from 'react';
import { autobind } from 'office-ui-fabric-react/lib/utilities/autobind';
import {
  Fabric,
  Panel
} from '../../index';
import {
  Header
} from '../../index';
import { Nav } from '../../index';
import './App.scss';
import { AppState, ExampleStatus } from './AppState';
import { withResponsiveMode, ResponsiveMode } from '../../index';

export interface IAppProps extends React.Props<App> {
  responsiveMode?: ResponsiveMode;
}
export interface IAppState {
  isMenuVisible: boolean;
}

@withResponsiveMode
export class App extends React.Component<IAppProps, any> {

  constructor(props: IAppProps) {
    super(props);

    this.state = {
      isMenuVisible: false
    };
  }

  public render() {
    let { responsiveMode } = this.props;
    let { isMenuVisible } = this.state;

    let navPanel = (
      <Nav groups={ AppState.examplePages } onRenderLink={(link) => ([
        <span key={ 1 } className='Nav-linkText'>{ link.name }</span>,
        (link.status !== undefined ?
          <span key={ 2 } className={ 'Nav-linkFlair ' + 'is-state' + link.status } title={ ExampleStatus[link.status] }>{ link.status === 0 ? 'g' : ExampleStatus[link.status] }</span> :
          null)
        ])}
        />
    );

    return (
      <Fabric className='App'>

        <div className='App-header'>
          <Header
            title={ AppState.appTitle }
            sideLinks={ AppState.headerLinks }
            isMenuVisible={ isMenuVisible }
            onIsMenuVisibleChanged={ this._onIsMenuVisibleChanged }
            />
        </div>

        { (responsiveMode > ResponsiveMode.large) ? (
          <div className='App-nav'>
            { navPanel }
          </div>
        ) : ( null ) }

        <div className='App-content'>
          { this.props.children }
        </div>

        { (responsiveMode <= ResponsiveMode.large) ? (
          <Panel className='App-navPanel ms-font-m' isOpen={isMenuVisible} onDismiss={ this._onIsMenuVisibleChanged.bind(this, false) }>
            { navPanel }
          </Panel>
        ) : (null) }
      </Fabric>
    );
  }

  @autobind
  private _onIsMenuVisibleChanged(isMenuVisible: boolean) {
    this.setState({ isMenuVisible });
  }
}
