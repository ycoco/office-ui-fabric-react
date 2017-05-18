// OneDrive:CoverageThreshold(79)

import IServerView from '@ms/odsp-datasources/lib/interfaces/view/IServerView';
import IVisualization, { VisualizationType } from '@ms/odsp-datasources/lib/interfaces/list/IVisualization';
import { IView, ViewType } from '@ms/odsp-datasources/lib/interfaces/view/IView';
import IListPermissions from '@ms/odsp-datasources/lib/interfaces/list/IListPermissions';
import { IViewArrangeInfo, IOrderedField, IGroupBy, IRowLimit, ArrangeInfoType, IViewDomParts } from '@ms/odsp-datasources/lib/interfaces/view/IViewArrangeInfo';
import Guid from '@ms/odsp-utilities/lib/guid/Guid';
import { CamlConstants, CamlTags as Tags, CamlAttributes as Attrs } from '../caml/CamlConstants';
import * as CamlParsing from '../caml/CamlParsingBasic';
import * as CamlUtilities from '../caml/CamlUtilities';
import { Qos as QosEvent, ResultTypeEnum } from '@ms/odsp-utilities/lib/logging/events/Qos.event';
import * as StringHelper from '@ms/odsp-utilities/lib/string/StringHelper';
import DomUtils from '@ms/odsp-utilities/lib/domUtils/DomUtils';

const _serializer = new XMLSerializer();

export default class View implements IView {
    public title: string;
    public id: string;
    public isDefault: boolean;
    public isHidden: boolean;
    public isPersonal: boolean;
    public isReadOnly: boolean;
    public modifiedInEditor: boolean;
    public rowLimit: number;
    public serverRelativeUrl: string;
    public viewType: ViewType;
    public visualizationInfo: IVisualization;
    /** Probably not the property you're looking for... */
    public baseViewId: string;

    private _baseViewXml: string;
    private _isDirty: boolean;
    private _hasParseError: boolean;
    private _modificationTypes: ArrangeInfoType[];

    /** Current XML document (generated only if modifications have been made) */
    private _xmlDoc: Document;
    /** Relevant DOM elements from the view (generated only if modifications have been made) */
    private _viewDom: IViewDomParts;

    /**
     * Constructs a view from either an IServerView or an XML string.
     * The XML string constructor is useful if you just want to manipulate view XML.
     * (Although the view ID and other information is often present in the view XML,
     * the constructor makes no effort to pull it out if given a string.)
     */
    constructor(viewDef: IServerView | string) {
        if (typeof viewDef === 'string') {
            this.baseViewXml = viewDef;
            return;
        }

        let view = <IServerView>viewDef;

        // NOTE: If updating what server view fields are used here, also update which ones are
        // requested in ListDataSource.getViews.
        this.id = Guid.normalizeLower(view.Id, false /*includeBrackets*/);
        this.title = view.Title;
        this.isDefault = view.DefaultView;
        this.isHidden = view.Hidden;
        this.isPersonal = !!view.PersonalView;
        this.isReadOnly = view.ReadOnlyView;
        this.modifiedInEditor = view.EditorModified;
        this.rowLimit = view.RowLimit;
        this.serverRelativeUrl = view.ServerRelativeUrl;
        this.baseViewId = view.BaseViewId;
        this.baseViewXml = view.ListViewXml;

        if (View.isAppView(view)) {
            this.isHidden = false; // Temp line, TODO: Figure out the best story here
            this.viewType = ViewType.power;
            this.visualizationInfo = view.VisualizationInfo;
        } else {
            if (view.ViewType) {
                switch (view.ViewType.toLowerCase()) {
                    case 'html': this.viewType = ViewType.standard; break;
                    case 'grid': this.viewType = ViewType.datasheet; break;
                    case 'calendar': this.viewType = ViewType.calendar; break;
                    case 'recurrence': this.viewType = ViewType.recurrence; break;
                    case 'chart': this.viewType = ViewType.chart; break;
                    case 'gantt': this.viewType = ViewType.gantt; break;
                }
            }
        }
    }

    public static isAppView(view: IServerView): boolean {
        return !!(view &&
            view.Hidden &&
            view.VisualizationInfo &&
            view.VisualizationInfo.VisualizationType === VisualizationType.VisualizationApp &&
            view.VisualizationInfo.VisualizationAppInfo &&
            view.VisualizationInfo.VisualizationAppInfo.Id);
    }

    public canUserEdit(permissions: IListPermissions): boolean {
        if (!permissions || this.isReadOnly) {
            return false;
        }
        let personalPermissionsRelevant = permissions.managePersonalViews && this.isPersonal;
        return permissions.manageLists || personalPermissionsRelevant;
    }

    public get baseViewXml(): string {
        return this._baseViewXml;
    }

    /**
     * Set the base view XML and clear previous modifications (if any).
     * This is mainly meant for cases where the view XML was not initially defined.
     */
    public set baseViewXml(newXml: string) {
        this._baseViewXml = newXml;
        this.clearXmlOverrides(); // also updates modificationTypes
    }

    public getEffectiveViewXml(): string {
        if (this.isDirty()) {
            return _serializer.serializeToString(this._viewDom.view);
        }
        return this._baseViewXml;
    }

    public getEffectiveQueryXml(includeQueryTag: boolean) {
        this._ensureDom();
        if (!this._viewDom) {
            return undefined;
        }
        if (!this._viewDom.query) {
            return includeQueryTag ? '<Query/>' : '';
        }
        if (includeQueryTag) {
            return _serializer.serializeToString(this._viewDom.query);
        }
        let where = this._viewDom.where ? _serializer.serializeToString(this._viewDom.where) : '';
        let orderBy = this._viewDom.orderBy ? _serializer.serializeToString(this._viewDom.orderBy) : '';
        let groupBy = this._viewDom.groupBy ? _serializer.serializeToString(this._viewDom.groupBy) : '';
        return where + orderBy + groupBy;
    }

    public getEffectiveFieldNames(): string[] {
        this._ensureDom();
        return this._viewDom && this._viewDom.viewFields ? CamlParsing.parseViewFields(this._viewDom.viewFields) : undefined;
    }

    public isDirty(specificModification?: ArrangeInfoType): boolean {
        if (typeof specificModification === 'number') {
            return !!this._modificationTypes && this._modificationTypes.indexOf(specificModification) !== -1;
        }
        return this._isDirty;
    }

    public setIsDirty(isDirty: boolean, modificationType?: ArrangeInfoType) {
        this._isDirty = isDirty;
        if (!isDirty) {
            this._modificationTypes = [];
        } else if (typeof modificationType === 'number' && this._modificationTypes.indexOf(modificationType) === -1) {
            this._modificationTypes.push(modificationType);
        }
    }

    public hasParseError(): boolean {
        return this._hasParseError;
    }

    public getDomParts(): IViewDomParts {
        this._ensureDom();
        return this._viewDom;
    }

    public clearXmlOverrides() {
        this._hasParseError = false;
        this._xmlDoc = undefined;
        this._viewDom = undefined;
        this.setIsDirty(false);
    }

    public prepareForSaving() {
        this._ensureDom();
        if (!this._viewDom || !this._viewDom.where) {
            return;
        }

        let filtersWithId = this._viewDom.where.querySelectorAll('[id]');
        for (let i = 0; i < filtersWithId.length; i++) {
            filtersWithId[i].removeAttribute('id');
        }
    }

    public updateSort(sort: IOrderedField, options: { removeSort?: boolean; overwriteAll?: boolean; prepend?: boolean } = {}) {
        this._ensureDom();
        let { removeSort, overwriteAll, prepend } = options;
        let removeAll = !sort && overwriteAll;
        // No-op if the view XML is unknown or invalid, the sort is not specified, or we're told
        // to remove a sort when in fact no sorts are present.
        if (!this._viewDom || (!removeAll && !sort) || (removeSort && !this._viewDom.orderBy)) {
            return;
        }

        let orderBy = this._viewDom.orderBy;
        if (removeAll) {
            // delete all sort info if requested
            if (orderBy) {
                this._viewDom.query.removeChild(orderBy);
            }
            this._viewDom.orderBy = undefined;
            this.setIsDirty(true, ArrangeInfoType.sorts);
            return;
        }

        let madeModification = false;
        if (!orderBy && !removeAll) {
            // create order by node if it doesn't exist
            orderBy = this._viewDom.orderBy = this._xmlDoc.createElement(Tags.orderBy);
            this._viewDom.query.appendChild(orderBy);
            madeModification = true;
        }

        // for existing sort, find the current element and object
        let elem = orderBy.querySelector(StringHelper.format(CamlConstants.fieldNameQuery, sort.fieldName));
        if (removeSort) {
            // remove sort if requested, and remove parent element too if applicable
            if (elem) {
                orderBy.removeChild(elem);
                madeModification = true;
                if (!orderBy.childElementCount) {
                    this._viewDom.query.removeChild(orderBy);
                    this._viewDom.orderBy = undefined;
                }
            }
        } else {
            madeModification = true;
            if (elem) {
                // element exists, so update the sort direction
                CamlUtilities.updateBooleanAttr(elem, Attrs.ascending, sort.isAscending);
            }
            let shouldAdd;
            if (overwriteAll) {
                // to overwrite, remove all children first (OrderBy can have extra attributes
                // we might want to preserve)
                for (let child = orderBy.lastChild; !!child; child = orderBy.lastChild) {
                    orderBy.removeChild(child);
                }
                shouldAdd = true;
            } else if (elem) {
                // element exists and we're not overwriting, so no further action
                shouldAdd = false;
            } else {
                // new sort to be added at end
                shouldAdd = true;
            }
            if (shouldAdd) {
                elem = elem || CamlUtilities.getFieldRefDom(this._xmlDoc, sort);
                if (prepend) {
                    orderBy.insertBefore(elem, orderBy.firstChild);
                } else {
                    orderBy.appendChild(elem);
                }
            }
        }

        if (madeModification) {
            this.setIsDirty(true, ArrangeInfoType.sorts);
        }
    }

    public updateGroupBy(groupBy: IGroupBy) {
        this._ensureDom();
        if (!this._viewDom) {
            return;
        }
        // If groupBy is not given (or no valid group1 is given), remove group by info
        let query = this._viewDom.query;
        let groupElem = this._viewDom.groupBy;
        if (!(groupBy && groupBy.group1 && groupBy.group1.fieldName)) {
            if (groupElem) {
                query.removeChild(groupElem);
                this._viewDom.groupBy = undefined;
                this.setIsDirty(true, ArrangeInfoType.groupBy);
            }
            return;
        }

        let { isCollapsed, group1, group2 } = groupBy;
        if (!groupElem) {
            // Create GroupBy element since it didn't exist previously
            this._viewDom.groupBy = groupElem = this._xmlDoc.createElement(Tags.groupBy);
            query.appendChild(groupElem);
        }
        // TODO [elcraig]: is missing collapse attribute valid?
        CamlUtilities.updateBooleanAttr(groupElem, Attrs.collapse, isCollapsed);

        // Add or update grouping info
        let firstGroupElem: Element;
        let secondGroupElem: Element;
        if (groupElem.childElementCount > 0) {
            firstGroupElem = groupElem.firstElementChild;
            secondGroupElem = firstGroupElem.nextElementSibling;
        }

        // Update or replace the first grouping level
        CamlUtilities.replaceField(this._xmlDoc, group1, firstGroupElem, groupElem);

        if (group2 && group2.fieldName && group2.fieldName !== group1.fieldName) {
            // Update or replace the second grouping level
            CamlUtilities.replaceField(this._xmlDoc, group2, secondGroupElem, groupElem);
        } else if (secondGroupElem) {
            // Second group is no longer defined, so remove it
            groupElem.removeChild(secondGroupElem);
        } // else, no old or new second-level group info

        this.setIsDirty(true, ArrangeInfoType.groupBy);
    }

    public updateField(name: string, index?: number) {
        this._ensureDom();
        // No-op if the view XML is unknown/invalid or no field name is given
        if (!this._viewDom || !name) {
            return;
        }

        // The ViewFields tag is pre-created when initializing the view (if it didn't exist in
        // the original XML).
        let madeModification = false;
        let viewFields = this._viewDom.viewFields;
        let elem = viewFields.querySelector(StringHelper.format(CamlConstants.fieldNameQuery, name));

        // If the field exists, remove it (will be added back later if updating)
        if (elem) {
            madeModification = true;
            viewFields.removeChild(elem);
        }

        // Now insert or re-insert the field if applicable
        if (typeof index === 'number') {
            madeModification = true;
            if (!elem) { // create element if it doesn't exist
                elem = CamlUtilities.getFieldRefDom(this._xmlDoc, { fieldName: name });
            }
            if (index >= viewFields.childElementCount) {
                // insert field at end of view fields list
                viewFields.appendChild(elem);
            } else if (index >= 0) {
                // insert field at new index
                DomUtils.insertAtIndex(viewFields, elem, index, Tags.fieldRef);
            }
            // else, field will be removed
        }
        if (madeModification) {
            this.setIsDirty(true, ArrangeInfoType.fieldNames);
        }
    }

    public replaceFields(fieldNames: string[]) {
        this._ensureDom();
        // No-op if the XML is unknown/invalid or no field names are given
        // (removing all fields is not allowed)
        if (!this._viewDom || !fieldNames) {
            return;
        }
        fieldNames = fieldNames.filter((name: string) => !!name);
        if (!fieldNames.length) {
            return;
        }

        let fieldDict: { [name: string]: { index: number; elem?: Element; } } = {};
        for (let i = 0; i < fieldNames.length; i++) {
            // Map from field name to index we want that field at
            fieldDict[fieldNames[i]] = { index: i };
        }

        // Walk through the existing view fields and save any we're interested in.
        // With this approach, we'll retain any extra attributes present on the original tags.
        let oldViewFields = this._viewDom.viewFields;
        for (let fieldElem = oldViewFields.firstElementChild; !!fieldElem; fieldElem = fieldElem.nextElementSibling) {
            let fieldName = CamlUtilities.getAttr(fieldElem, Attrs.name);
            if (fieldDict[fieldName]) {
                fieldDict[fieldName].elem = fieldElem;
            }
        }

        // Replace the old ViewFields tag with a new, empty one
        let newViewFields = this._viewDom.viewFields = this._xmlDoc.createElement(Tags.viewFields);
        this._viewDom.view.replaceChild(newViewFields, oldViewFields);
        // Make an array of FieldRef elements in the desired order
        let newFieldElems: Element[] = [];
        for (let fieldName of Object.keys(fieldDict)) {
            let dictEntry = fieldDict[fieldName];
            let fieldElem = dictEntry.elem;
            if (!fieldElem) {
                // Create fields that didn't exist before
                // TODO [elcraig]: are there ever required attributes for certain field types?
                fieldElem = CamlUtilities.getFieldRefDom(this._xmlDoc, { fieldName: fieldName });
            }
            newFieldElems[dictEntry.index] = fieldElem;
        }

        // Append all the FieldRef elements to the ViewFields tag
        for (let fieldElem of newFieldElems) {
            newViewFields.appendChild(fieldElem);
        }

        this.setIsDirty(true, ArrangeInfoType.fieldNames);
    }

    public clearFilters() {
        this._ensureDom();
        if (this._viewDom.where) {
            this._viewDom.query.removeChild(this._viewDom.where);
            this._viewDom.where = undefined;
            this.setIsDirty(true, ArrangeInfoType.filters);
        }
    }

    public addFilters(camlFilters: string[]) {
        this._ensureDom();
        if (!this._viewDom || !camlFilters) {
            return;
        }
        camlFilters = camlFilters.filter((filter: string) => !!filter);
        if (!camlFilters.length) {
            return;
        }

        let caml = CamlUtilities.combineFilters(camlFilters, Tags.and);
        if (!caml) {
            throw new Error('Invalid filter: must be defined and have values');
        }

        this.setIsDirty(true, ArrangeInfoType.filters);
        let filterElem;
        try {
            filterElem = CamlUtilities.xmlToDom(caml).documentElement;
        } catch (ex) {
            throw new Error('Generated filter was not valid XML!');
        }
        let where = this._viewDom.where;
        if (!where) {
            where = this._viewDom.where = this._xmlDoc.createElement(Tags.where);
            this._viewDom.query.appendChild(where);
        }
        if (!where.childElementCount) {
            // Easy case: no previous filters
            where.appendChild(filterElem);
        } else {
            // Complicated case: And the new filters with the old filters
            let oldFilters = where.firstElementChild;
            let and = this._xmlDoc.createElement(Tags.and);

            // Put the old filters first: for large lists only, the order matters because the
            // first column in the query must be indexed.
            // (Once we append the oldFilters to 'and' element, it is auto removed from its parent.
            // So we only need to append the new 'and' element to 'where'.)
            and.appendChild(oldFilters);
            and.appendChild(filterElem);
            where.appendChild(and);
        }
    }

    public updateRowLimit(rowLimit: IRowLimit) {
        this._ensureDom();
        if (!this._viewDom || !rowLimit || typeof rowLimit.rowLimit !== 'number') {
            return;
        }

        this.rowLimit = rowLimit.rowLimit;

        let rowLimitElem = this._viewDom.rowLimit;
        if (!rowLimitElem) {
            this._viewDom.rowLimit = rowLimitElem = this._xmlDoc.createElement(Tags.rowLimit);
        }

        if (rowLimitElem.firstChild) {
            rowLimitElem.firstChild.nodeValue = String(rowLimit.rowLimit);
        } else {
            let newText = this._xmlDoc.createTextNode(String(rowLimit.rowLimit));
            rowLimitElem.appendChild(newText);
        }

        if (typeof rowLimit.isPerPage === 'boolean') {
            CamlUtilities.updateBooleanAttr(rowLimitElem, Attrs.paged, rowLimit.isPerPage);
        }

        this.setIsDirty(true, ArrangeInfoType.rowLimit);
    }

    public updateAll(arrangeInfo: IViewArrangeInfo) {
        // other methods will call _ensureDom() if needed
        let { fieldNames, groupBy, sorts, filters } = arrangeInfo;
        if (fieldNames && fieldNames.length) {
            this.replaceFields(fieldNames);
        }
        if (groupBy) {
            this.updateGroupBy(groupBy);
        }
        if (sorts && sorts.length) {
            this.updateSort(sorts[0], { overwriteAll: true });
            for (let sort of sorts.slice(1)) {
                this.updateSort(sort);
            }
        }
        if (filters && filters.length && typeof filters[0] === 'string') {
            // TODO [elcraig]: enable IFilters too
            this.clearFilters();
            this.addFilters(<string[]>filters);
        }
    }

    public compareTo(view: IView): number {
        if (!view) {
            return 1;
        }

        // Powerapp views go after non-powerapp views
        if (this.viewType === ViewType.power && view.viewType !== ViewType.power) {
            return 1;
        } else if (this.viewType !== ViewType.power && view.viewType === ViewType.power) {
            return -1;
        }

        // Neither is a powerapp or both are. Compare titles.
        let t1 = (this.title || '').toLocaleLowerCase();
        let t2 = (view.title || '').toLocaleLowerCase();
        return t1 === t2 ? 0 : (t1 < t2 ? -1 : 1);
    }

    private _ensureDom() {
        if (this._baseViewXml && !this._viewDom) {
            this._isDirty = false;
            this._hasParseError = false;

            let qos = new QosEvent({ name: 'View.Parse' });
            try {
                // This will throw if certain invalid stuff is found (see doc comment).
                // It will also ensure that the ViewFields and Query tags exist.
                this._viewDom = CamlParsing.getViewDomParts(this._baseViewXml);
                this._xmlDoc = this._viewDom.xmlDoc;
                qos.end({ resultType: ResultTypeEnum.Success });
            } catch (ex) {
                this._viewDom = undefined;
                this._xmlDoc = undefined;
                this._hasParseError = true;
                qos.end({
                    resultType: ResultTypeEnum.Failure,
                    error: ex.message || JSON.stringify(ex)
                });
            }
        }
    }
}
