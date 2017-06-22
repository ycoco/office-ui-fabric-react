/**
 * Exposes basic properties of an SPWeb for getting and setting using the WebDataSource.
 *
 * Not an exhaustive list, please add additional properties as they are needed.
 */
export interface IWeb {
    /** Description for the web site */
    description?: string;

    /** Absolute URL of the website logo */
    siteLogoUrl?: string;

    /** Title for the web site */
    title?: string;
}

export default IWeb;