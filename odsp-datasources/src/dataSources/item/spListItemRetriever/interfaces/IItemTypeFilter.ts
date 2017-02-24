/** Refactor code to use a more generic additionalFilterViewXml field that gets OR into the rest of the <Where> clause.
 * We should not need this interface in odsp-datasources.
 * Currently copied over from odsp-next/../models/item/IItemTypeFilter.
 */

/**
 * Represents possible canonical filters on item types.
 * There is no requirement that filters be mututally exclusive.
 */
export enum ItemTypeFilter {
    /**
     * This is here to park the default value.
     */
    any = 0,
    /**
     * Represents any item to be treated as a file.
     */
    file = 1,
    /**
     * Represents any item to be treated as a folder.
     * Should exclude OneNote items since they cannot be traversed in OneDrive.
     */
    folder = 2,
    /**
     * Should include any item presentable as media.
     */
    media = 3,
    /**
     * Should include any item with photo metadata.
     */
    photo = 4,
    /**
     * Should include any item playable as video.
     */
    video = 5,
    /**
     * Should include any item with document content.
     * Note that this need not be restricted to Office documents.
     */
    document = 6,
    /**
     * Should include any item playable as audio.
     */
    audio = 7,
    /**
     * Should include any word file like docx,doc,odf etc.
     */
    word = 8,
    /**
     * Should include any powerpoint file like pptx,ppt,odp etc.
     */
    powerpoint = 9,
    /**
     * Should include any excel file like xls,xlsx,ods etc.
     */
    excel = 10,
    /**
     * Should include any onenote file like one
     */
    onenote = 11,
    /**
     * Should include any zip file like zip, 7z, gz, gzip, rar etc.
     */
    zip = 12,
    /**
     * Should include pdf files
     */
    pdf = 13,
    /**
     * Should include any text file like txt, log
     */
    text = 14
}

export type IItemTypeFilterInput = string | ItemTypeFilter;

/**
 * Represents the specification for an item type filter to be applied for a request.
 * @example
 *  let typeFilter: IItemTypeFilter = {
 *      filters: [ItemTypeFilter.folder, ItemTypeFilter.photo, ItemTypeFilter.video]
 *  };
 * @example
 *  let typeFilter: IItemTypeFilter = {
 *      filters: [ItemTypeFilter.folder, '.docx', '.xlsx', '.pptx']
 *  };
 */
export interface IItemTypeFilter {
    /**
     * A list of item types to be included by the filter.
     * ItemTypeFilter values are treated as type filters and string values are treated as extension filters.
     * Extension filters must begin with '.'.
     */
    filters: IItemTypeFilterInput[];
}

export default IItemTypeFilter;
