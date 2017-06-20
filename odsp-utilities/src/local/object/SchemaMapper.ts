// OneDrive:IgnoreCodeCoverage

import ISchemaMap from './ISchemaMap';

/*
    SchemaMapper is used to translate JSON from one schema to another.
    It simply is map of "from Field" -> "to field"

    usage example:
                var schemaMap = [
                    { from: "DisplayText", to: "name" },
                    { from: "EntityData.Email", to: "email" },
                    { from: "Key", to: "id" }
                ];

                var schemaMapper = new SchemaMapper(schemaMap);
                var transformedArray = schemaMapper.forwardTransform(someJsonBlobArray);

*/
export class SchemaMapper {
    private _map: Array<ISchemaMap>;
    private _callback: (result: any, obj: any) => any;

    constructor(map: Array<ISchemaMap>, callback?: (result: any, obj: any) => void) {
        this._map = map;
        this._callback = callback;
    }

    public forwardTransform(input: any): any {
        return this._transform(input, true);
    }

    public reverseTransform(input: any): any {
        return this._transform(input, false);
    }

    private _getInputProperty(obj: any, strProp: string): any {
        var result: any = obj;
        if (this._callback) {
            this._callback(result, obj);
        }
        //If the "from" schema element has a "." in it, then we navigate through to the
        // leaf node
        var arrPropHierarchy: Array<string> = strProp.split(".");
        for (var i = 0; i < arrPropHierarchy.length; i++) {
            result = result[arrPropHierarchy[i]];
        }
        return result;
    }

    private _transformSingle(input: any, forward: boolean): any {

        var ret: any = {};
        var fromPropName = forward ? "from" : "to";
        var toPropName = forward ? "to" : "from";

        for (var i = 0; i < this._map.length; i++) {
            var fromProp = this._map[i][fromPropName];
            var toProp = this._map[i][toPropName];
            ret[toProp] = this._getInputProperty(input, fromProp);
        }
        return ret;
    }

    private _transform(input: any, forward: boolean): any {
        if (typeof input !== 'undefined' && input.constructor === Array) {
            var retArr = [];

            for (var i = 0; i < input.length; i++) {
                retArr.push(this._transformSingle(input[i], forward));
            }
            return retArr;
        } else {
            return this._transformSingle(input, forward);
        }
    }

}

export default SchemaMapper;