import DataSource from '../base/DataSource';
import IListDataSource from './IListDataSource';
import UriEncoding from '@ms/odsp-utilities/lib/encoding/UriEncoding';
import FieldSchemaXmlHelper from './FieldSchemaXmlHelper';
import { ISpPageContext } from './../../interfaces/ISpPageContext';
import IFieldSchema from '../../interfaces/list/IFieldSchema';
import Promise from '@ms/odsp-utilities/lib/async/Promise';

export class ListDataSource extends DataSource implements IListDataSource {
    private _fieldSchemaXmlHelper: FieldSchemaXmlHelper;

    constructor(pageContext: ISpPageContext) {
        super(pageContext);
        this._fieldSchemaXmlHelper = new FieldSchemaXmlHelper();
    }

    public createField(fieldSchema: IFieldSchema): Promise<string> {
        let postBody = {
            'parameters': {
                '__metadata': {
                    'type': 'SP.XmlSchemaFieldCreationInformation'
                },
                'SchemaXml': this._fieldSchemaXmlHelper.getFieldSchemaXml(fieldSchema)
            }
        };

        return this.getData(
            /*getUrl*/() => this._getCreateFieldApiUrl(),
            /*parseResponse*/(responseText: string): string => {
                let serverObj = JSON.parse(responseText);
                return serverObj.d.InternalName;
            },
            /*qosName*/ 'CreateField',
            /*getAdditionalPostData*/ () => JSON.stringify(postBody),
            /*method*/ 'POST');
    }

    private _getCreateFieldApiUrl(): string {
        return [
            UriEncoding.escapeUrlForCallback(this._pageContext.webAbsoluteUrl),
            "/_api/web/GetList(@a1)/Fields/CreateFieldAsXml?@a1='",
            UriEncoding.encodeRestUriStringToken(this._pageContext.listUrl),
            "'"
        ].join('');
    }
}

export default ListDataSource;