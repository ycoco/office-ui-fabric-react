import * as React from 'react';
import './DepartmentNav.scss';
import { HorizontalNav } from '../HorizontalNav/index';
import { IDepartmentDataSource, IDepartmentData } from '@ms/odsp-datasources/lib/dataSources/department/DepartmentDataSource';
import { BaseComponent } from 'office-ui-fabric-react/lib/Utilities';
import { IReactDeferredComponentCapability } from '../ReactDeferredComponent/index';
import Promise from '@ms/odsp-utilities/lib/async/Promise';

export interface IDepartmentNavProps extends React.Props<DepartmentNav>, IReactDeferredComponentCapability {
    /** Data source for getting info about the department. */
    dataSource: IDepartmentDataSource;

    // TODO: aria labels, for this component or passed to horizontal nav?
}

export interface IDepartmentNavState {
    departmentData?: IDepartmentData;
}

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
        this._dataPromise.then((data: IDepartmentData) => {
            if (data) {
                this.setState({ departmentData: data });
            }
        });
    }

    public componentWillUnmount() {
        this._events.dispose();
        this._async.dispose();
    }

    public render() {
        let { departmentData } = this.state;

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
                    { logoUrl && <img className='ms-DepartmentNav-logo' src={ logoUrl } /> }
                    { name || '' }
                </a>
            );
            horizontalNav = <HorizontalNav
                items={ navigation }
                moduleLoader={ this.props.moduleLoader } />;
        }

        return (
            <div className='ms-DepartmentNav'>
                { departmentLink }
                { horizontalNav }
            </div>
        );
    }
}

export default DepartmentNav;
