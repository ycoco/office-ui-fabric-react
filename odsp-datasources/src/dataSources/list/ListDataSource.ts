import DataSource from '../base/DataSource';
import IListDataSource from './IListDataSource';
import FieldSchemaXmlHelper from './FieldSchemaXmlHelper';
import { ItemUrlHelper } from '../../utilities/url/ItemUrlHelper';
import { ApiUrlHelper, IApiUrl } from '../../utilities/url/ApiUrlHelper';
import { ISpPageContext } from './../../interfaces/ISpPageContext';
import IFieldSchema from '../../interfaces/list/IFieldSchema';
import IServerField from '../../interfaces/list/IServerField';
import IField from '../../interfaces/list/IField';
import Promise from '@ms/odsp-utilities/lib/async/Promise';

export class ListDataSource extends DataSource implements IListDataSource {
    private _fieldSchemaXmlHelper: FieldSchemaXmlHelper;
    private _itemUrlHelper: ItemUrlHelper;
    private _apiUrlHelper: ApiUrlHelper;

    constructor(pageContext: ISpPageContext) {
        super(pageContext);
        this._fieldSchemaXmlHelper = new FieldSchemaXmlHelper();
        this._itemUrlHelper = new ItemUrlHelper({}, { pageContext: pageContext });
        this._apiUrlHelper = new ApiUrlHelper({}, { pageContext: pageContext, itemUrlHelper: this._itemUrlHelper });
    }

    public createField(fieldSchema: IFieldSchema, listFullUrl?: string): Promise<string> {
        let postBody = {
            'parameters': {
                '__metadata': {
                    'type': 'SP.XmlSchemaFieldCreationInformation'
                },
                'SchemaXml': this._fieldSchemaXmlHelper.getFieldSchemaXml(fieldSchema)
            }
        };

        return this.getData(
            /*getUrl*/() => this._getListApiUrl(listFullUrl)
                .segment('Fields').segment('CreateFieldAsXml').toString(),
            /*parseResponse*/(responseText: string): string => {
                let serverObj = JSON.parse(responseText);
                return serverObj.d.InternalName;
            },
            /*qosName*/ 'CreateField',
            /*getAdditionalPostData*/ () => JSON.stringify(postBody),
            /*method*/ 'POST');
    }

    public getFields(listFullUrl?: string): Promise<IField[]> {
        return this.getData(
            // Specify only some of the field properties to reduce the size of the response
            /*getUrl*/() => this._getListApiUrl(listFullUrl)
                .segment('Fields')
                .oDataParameter('$select', 'Id,InternalName,StaticName,Hidden,Title')
                .toString(),
            /*parseResponse*/(responseText: string): IField[] => {
                let response = JSON.parse(responseText);
                let serverFields: IServerField[] = response.d.results;
                return serverFields.map((serverField: IServerField) => ({
                    id: serverField.Id,
                    internalName: serverField.InternalName,
                    isHidden: serverField.Hidden,
                    staticName: serverField.StaticName,
                    title: serverField.Title
                }));
            },
            /*qosName*/ 'GetFields',
            /*getAdditionalPostData*/ null,
            /*method*/ 'GET');
    }

    public getField(internalNameOrTitle: string, listFullUrl?: string): Promise<IServerField> {
        return this.getData(
            /*getUrl*/() => this._getListApiUrl(listFullUrl)
                .segment('Fields').method('GetByInternalNameOrTitle', internalNameOrTitle).toString(),
            /*parseResponse*/(responseText: string): IServerField => {
                let response = JSON.parse(responseText);
                let serverField: IServerField = response && response.d;
                return serverField;
            },
            /*qosName*/ 'GetField',
            /*getAdditionalPostData*/ null,
            /*method*/ 'GET');
    }

    public editField(internalNameOrTitle: string, fieldSchema: IFieldSchema, listFullUrl?: string): Promise<string> {
        let postBody = {
            '__metadata': {
                'type': 'SP.Field'
            },
            'SchemaXml': this._fieldSchemaXmlHelper.getFieldSchemaXml(fieldSchema)
        };
        return this.getData(
            /*getUrl*/() => this._getListApiUrl(listFullUrl)
                .segment('Fields').method('GetByInternalNameOrTitle', internalNameOrTitle).toString(),
            /*parseResponse*/(responseText: string)=> { return responseText },
            /*qosName*/ 'EditField',
            /*getAdditionalPostData*/ () => JSON.stringify(postBody),
            /*method*/ 'MERGE');
    }

    public deleteField(internalNameOrTitle: string, listFullUrl?: string): Promise<string> {
        return this.getData(
            /*getUrl*/() => this._getListApiUrl()
                .segment('Fields').method('GetByInternalNameOrTitle', internalNameOrTitle).segment('DeleteObject').toString(),
            /*parseResponse*/(responseText: string) => { return responseText; },
            /*qosName*/ 'DeleteField',
            /*getAdditionalPostData*/ null,
            /*method*/ 'POST');
    }

    private _getListApiUrl(listFullUrl?: string): IApiUrl {
        const listUrlParts = this._itemUrlHelper.getUrlParts({
            path: listFullUrl || this._pageContext.listUrl,
            listUrl: listFullUrl || this._pageContext.listUrl
        });

        return this._apiUrlHelper.build()
            .webByItemUrl(listUrlParts)
            .method('GetList', listUrlParts.serverRelativeListUrl);
    }
}

export default ListDataSource;