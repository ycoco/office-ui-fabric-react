import * as React from 'react';
import EventGroup from '../eventGroup/EventGroup';

export interface IRouterProps {
  replaceState?: boolean;
  children?: React.ReactElement<any>[];
}

export interface IRouterState {
  path: string;
}

export default class Router extends React.Component<IRouterProps, IRouterState> {
  private _events: EventGroup;

  constructor() {
    super();

    this.state = {
      path: location.hash
    };
    this._events = new EventGroup(this);
  }

  public componentDidUpdate(prevProps: IRouterProps, prevState: IRouterState) {
    if (this.state.path !== prevState.path) {
      window.scrollTo(0, 0);
    }
  }

  public render() {
    return _getComponent(this.state.path, this.props.children);
  }

  public componentDidMount() {
    this._events.on(window, 'hashchange', () => {
      if (this.state.path !== location.hash) {
        this.setState({ path: location.hash });
      }
    });
  }

  public componentWillUnmount() {
    this._events.dispose();
  }
}

function _getComponent(matchPath, children) {
  if (children && children.$$typeof) {
    children = [ children ];
  }

  for (let i = 0; children && i < children.length; i++) {
    let currentChild = children[i];

    if (_match(matchPath, currentChild)) {
      let component = currentChild.props.component;
      let childComponent = _getComponent(matchPath, currentChild.props.children);

      return React.createElement(component, null, childComponent);
    }
  }

  return null;
}

function _match(currentPath, child): boolean {
  if (child.props) {
    let { path } = child.props;

    path = path || '';
    currentPath = currentPath || '';

    return (
      (!path) ||
      (path.toLowerCase() === currentPath.toLowerCase())
    );
  }

  return false;
}
