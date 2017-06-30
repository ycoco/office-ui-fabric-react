import DataSource from '../base/DataSource';
import Promise from '@ms/odsp-utilities/lib/async/Promise';

export interface IDepartmentDataSource {
    getDepartmentData(): Promise<IDepartmentData>;
    setDepartment(id: string): Promise<void>;
}

export interface IDepartmentData {
    /**
     * Optional title of the department.
     */
    name?: string;

    /**
     * Optional URL for a department logo.
     */
    logoUrl?: string;

    /**
     * URL of the parent site (navigate here when logo or title is clicked).
     */
    url: string;

    /**
     * Navigation links
     */
    navigation: IDepartmentNavLink[];
}

/**
 * Nav link for a department. Should match office-ui-fabric-react Nav's INavLink.
 */
export interface IDepartmentNavLink {
    name: string;
    url: string;
}

export class DepartmentDataSource extends DataSource implements IDepartmentDataSource {
    public getDepartmentData(): Promise<IDepartmentData> {
        // Temporary placeholder data
        let links: IDepartmentNavLink[] = [];
        for (let i = 0; i < 25; i++) {
            links.push({
                name: `Nav link ${i + 1}`,
                url: 'http://bing.com'
            });
        }

        return Promise.wrap({
            name: 'Microsoft',
            logoUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAIAAABvFaqvAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAA7SURBVDhPY/iUqoQf/QeDnmP2+NGoQaMG4UVD1yCIOsoB9QxiWPceP4IqPMSHH40aNGoQXjREDTrEBwC5RyDvvdPigwAAAABJRU5ErkJggg==',
            url: 'http://microsoft.com',
            navigation: links
        });
    }

    public setDepartment(id: string): Promise<void> {
        return Promise.wrap<void>();
    }
}

export default DepartmentDataSource;
