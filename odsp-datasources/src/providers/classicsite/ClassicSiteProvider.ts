
import Promise from '@ms/odsp-utilities/lib/async/Promise';
import ISpPageContext from '../../interfaces/ISpPageContext';
import ClassicSiteDataSource, { IClassicSiteDataSource } from '../../dataSources/classicsite/ClassicSiteDataSource';
import WebTemplateType from '../../dataSources/web/WebTemplateType';

export interface IClassicSiteProvider {
    /**
     * Creates the Classic site according to the provided parameters.
     */
    CreateClassicSite(title: string, url: string, classicwebtemplate: WebTemplateType, lcid: Number, owner: string): Promise<void>;
}

export interface IClassicSiteProviderParams {
    pageContext?: ISpPageContext;
    dataSource?: IClassicSiteDataSource;
}

/**
 * O365 Classic site service provider
 */
export class ClassicSiteProvider implements IClassicSiteProvider {

    private _dataSource: IClassicSiteDataSource;

    constructor(params: IClassicSiteProviderParams) {
        this._dataSource = params.dataSource || new ClassicSiteDataSource(params.pageContext);
    }

    /**
     * Creates the Classic site according to the provided parameters.
     */
    public CreateClassicSite(title: string, url: string, classicwebtemplate: WebTemplateType,
        lcid: Number, owner: string): Promise<void> {
        return this._dataSource.createClassicSite(title, url, classicwebtemplate, lcid, owner);
    }
}

export default ClassicSiteProvider;
