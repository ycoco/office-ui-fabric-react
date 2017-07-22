import * as React from 'react';
import './DepartmentNav.scss';
import { HorizontalNav } from '../HorizontalNav/index';
import { IDepartmentDataSource, IDepartmentData } from '@ms/odsp-datasources/lib/dataSources/department/DepartmentDataSource';
import { BaseComponent, IBaseProps, autobind } from 'office-ui-fabric-react/lib/Utilities';
import { IReactDeferredComponentCapability } from '../ReactDeferredComponent/index';
import Promise from '@ms/odsp-utilities/lib/async/Promise';
import { Engagement } from '@ms/odsp-utilities/lib/logging/events/Engagement.event';
import { INavLink } from 'office-ui-fabric-react/lib/Nav';

export interface IDepartmentNavProps extends React.Props<DepartmentNav>, IReactDeferredComponentCapability, IBaseProps {
    /** Data source for getting info about the department. */
    dataSource: IDepartmentDataSource;

    /** Accessible label for the primary department nav div. */
    departmentAriaLabel?: string;

    /** Accessible label for the horizontal nav control inside the department nav. */
    horizontalNavAriaLabel?: string;
}

export interface IDepartmentNavState {
    departmentData?: IDepartmentData;
}

const LOG_PREFIX = 'DepartmentNav';
let _hasLogged = false;

/**
 * Retrieves data for and renders the department nav (a horizontal navigation control containing
 * the logo, name, and links from a parent site).
 */
export class DepartmentNav extends BaseComponent<IDepartmentNavProps, IDepartmentNavState> {
    private _dataPromise: Promise<IDepartmentData>;

    constructor(props: IDepartmentNavProps) {
        super(props);

        this.state = {};
        this._dataPromise = props.dataSource.getDepartmentData();
    }

    public componentDidMount() {
        if (!_hasLogged) {
            // Only log rendering once per page load
            Engagement.logData({ name: `${LOG_PREFIX}.Rendered` });
            _hasLogged = true;
        }

        this._dataPromise.then((data: IDepartmentData) => {
            if (data) {
                // Add logging click handlers to the links
                const addOnClick = (links: INavLink[], level: number) => {
                    for (let link of links) {
                        link.onClick = () => {
                            Engagement.logData({ name: `${LOG_PREFIX}.Link.Level${level}.Click` });
                            Engagement.logData({ name: `${LOG_PREFIX}.Link.Click` });
                            logGenericClick();
                        };
                        if (link.links) {
                            addOnClick(link.links, level + 1);
                        }
                    }
                }
                addOnClick(data.navigation, 1);

                this.setState({ departmentData: data });
            }
        });
    }

    public componentWillUnmount() {
        this._events.dispose();
        this._async.dispose();
    }

    public render() {
        let {
            state: { departmentData },
            props
        } = this;

        let departmentLink;
        let horizontalNav;
        if (departmentData) {
            let {
                name,
                logoUrl,
                url,
                navigation
            } = departmentData;

            departmentLink = (
                <a className='ms-DepartmentNav-link' href={ url }>
                    { logoUrl && <img className='ms-DepartmentNav-logo' src={ logoUrl } onClick={ this._onLogoClick } /> }
                    <span onClick={ this._onNameClick }>{ name || '' }</span>
                </a>
            );
            horizontalNav = <HorizontalNav
                items={ navigation }
                moduleLoader={ props.moduleLoader }
                ariaLabel={ props.horizontalNavAriaLabel} />;
        }

        return (
            <div className='ms-DepartmentNav' aria-label={ props.departmentAriaLabel }>
                { departmentLink }
                { horizontalNav }
            </div>
        );
    }

    @autobind
    private _onNameClick() {
        Engagement.logData({ name: `${LOG_PREFIX}.Name.Click` });
        logGenericClick();
    }

    @autobind
    private _onLogoClick() {
        Engagement.logData({ name: `${LOG_PREFIX}.Logo.Click` });
        logGenericClick();
    }
}

function logGenericClick() {
    Engagement.logData({ name: `${LOG_PREFIX}.Click` });
}

export default DepartmentNav;
