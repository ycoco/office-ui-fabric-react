import * as SmartFiltersHelper from './SmartFiltersHelper';
import { ColumnFieldType } from '@ms/odsp-datasources/lib/SPListItemProcessor';
import { FilterSectionType, DateTimeSliderValue, IFilterSectionInfo, IDateTimeFilterSectionInfo } from '@ms/odsp-datasources/lib/models/smartFilters/FilterSectionType';
import { expect } from 'chai';
import Features from '@ms/odsp-utilities/lib/features/Features';

const RenderHierarchyInFiltersPane = { ODB: 108 };

describe('SmartFiltersHelper', () => {
    let dependencies: SmartFiltersHelper.ISmartFilterDependencies;
    let strings: SmartFiltersHelper.ISmartFilterStrings;
    let columnInfoHash = JSON.parse(`{"DocIcon":{"fieldType":15,"uniqueValueCount":6,"totalCount":22,"displayName":"","isRequired":false,"priority":0,"isSelected":true, "columnDefinition": {"id": "1", "serverFieldType": "1"}},
"LinkFilename":{"fieldType":11,"uniqueValueCount":0,"totalCount":0,"displayName":"Name","isRequired":false,"priority":0, "columnDefinition": {"id": "2", "serverFieldType": "2"}},
"_calloutInvoker":{"fieldType":16,"uniqueValueCount":0,"totalCount":0,"displayName":"","isRequired":false,"priority":0, "columnDefinition": {"id": "3", "serverFieldType": "3"}},
"Modified":{"fieldType":5,"uniqueValueCount":17,"totalCount":22,"displayName":"Modified","isRequired":false,"priority":2,"isSelected":true, "columnDefinition": {"id": "4", "serverFieldType": "4"}},
"Editor":{"fieldType":3,"uniqueValueCount":2,"totalCount":22,"displayName":"Modified By", "isRequired":false,"priority":0,"isSelected":true, "columnDefinition": {"id": "5", "serverFieldType": "5"}},
"requirenum":{"fieldType":8,"uniqueValueCount":6,"totalCount":22,"displayName":"requirenum","isRequired":true,"priority":4, "columnDefinition": {"id": "6", "serverFieldType": "6"}},
"choice":{"fieldType":33,"uniqueValueCount":4,"totalCount":22,"displayName":"choice","isRequired":false,"priority":3, "columnDefinition": {"id": "7", "serverFieldType": "7"}},
"requirechoice":{"fieldType":33,"uniqueValueCount":3,"totalCount":22,"displayName":"requirechoice","isRequired":true,"priority":6, "columnDefinition": {"id": "8", "serverFieldType": "8"}},
"required":{"fieldType":8,"uniqueValueCount":5,"totalCount":22,"displayName":"required","isRequired":true,"priority":4, "columnDefinition": {"id": "9", "serverFieldType": "9"}},
"_STS_x0020_Hashtags":{"fieldType":20,"uniqueValueCount":0,"totalCount":0,"displayName":"Hashtags","isRequired":false,"priority":0, "columnDefinition": {"id": "10", "serverFieldType": "10"}},
"quoteChoice":{"fieldType":33,"uniqueValueCount":5,"totalCount":22,"displayName":"quoteChoice","isRequired":false,"priority":3, "columnDefinition": {"id": "11", "serverFieldType": "11"}}}`);
    let fieldOptionsHash = JSON.parse(`{"DocIcon":{"Other":{"count":3,"option":{"key":"Other","checked":false,"values":[""],"label":"Other"}},"txt":{"count":7,"option":{"key":"txt","checked":false,"values":["txt"],"label":"txt"}},"Word":{"count":8,"option":{"key":"Word","checked":false,"values":["doc","docm","docx","dot","dotm","dotx","odt"],"label":"Word"}},"PowerPoint":{"count":2,"option":{"key":"PowerPoint","checked":false,"values":["odp","pot","potm","potx","ppa","ppam","pps","ppsm","ppsx","ppt","pptm","pptx"],"label":"PowerPoint"}},"log":{"count":1,"option":{"key":"log","checked":false,"values":["log"],"label":"log"}},"url":{"count":1,"option":{"key":"url","checked":false,"values":["url"],"label":"url"}}},

"Modified":{"12/13/2016 10:22 AM":{"count":1,"option":{"key":"12/13/2016 10:22 AM","checked":false,"values":["12/13/2016 10:22 AM"],"label":"12/13/2016 10:22 AM"}},"12/7/2016 2:48 PM":{"count":1,"option":{"key":"12/7/2016 2:48 PM","checked":false,"values":["12/7/2016 2:48 PM"],"label":"12/7/2016 2:48 PM"}},"11/16/2016 3:47 PM":{"count":1,"option":{"key":"11/16/2016 3:47 PM","checked":false,"values":["11/16/2016 3:47 PM"],"label":"11/16/2016 3:47 PM"}},"1/18/2017 3:43 PM":{"count":1,"option":{"key":"1/18/2017 3:43 PM","checked":false,"values":["1/18/2017 3:43 PM"],"label":"1/18/2017 3:43 PM"}},"1/18/2017 3:34 PM":{"count":1,"option":{"key":"1/18/2017 3:34 PM","checked":false,"values":["1/18/2017 3:34 PM"],"label":"1/18/2017 3:34 PM"}},"1/18/2017 3:08 PM":{"count":2,"option":{"key":"1/18/2017 3:08 PM","checked":false,"values":["1/18/2017 3:08 PM"],"label":"1/18/2017 3:08 PM"}},"1/9/2017 10:26 AM":{"count":3,"option":{"key":"1/9/2017 10:26 AM","checked":false,"values":["1/9/2017 10:26 AM"],"label":"1/9/2017 10:26 AM"}},"1/9/2017 10:25 AM":{"count":2,"option":{"key":"1/9/2017 10:25 AM","checked":false,"values":["1/9/2017 10:25 AM"],"label":"1/9/2017 10:25 AM"}},"12/7/2016 7:56 PM":{"count":1,"option":{"key":"12/7/2016 7:56 PM","checked":false,"values":["12/7/2016 7:56 PM"],"label":"12/7/2016 7:56 PM"}},"12/7/2016 3:16 PM":{"count":2,"option":{"key":"12/7/2016 3:16 PM","checked":false,"values":["12/7/2016 3:16 PM"],"label":"12/7/2016 3:16 PM"}},"11/18/2016 10:26 AM":{"count":1,"option":{"key":"11/18/2016 10:26 AM","checked":false,"values":["11/18/2016 10:26 AM"],"label":"11/18/2016 10:26 AM"}},"11/14/2016 3:09 PM":{"count":1,"option":{"key":"11/14/2016 3:09 PM","checked":false,"values":["11/14/2016 3:09 PM"],"label":"11/14/2016 3:09 PM"}},"11/11/2016 12:13 PM":{"count":1,"option":{"key":"11/11/2016 12:13 PM","checked":false,"values":["11/11/2016 12:13 PM"],"label":"11/11/2016 12:13 PM"}},"11/11/2016 12:09 PM":{"count":1,"option":{"key":"11/11/2016 12:09 PM","checked":false,"values":["11/11/2016 12:09 PM"],"label":"11/11/2016 12:09 PM"}},"11/8/2016 1:30 PM":{"count":1,"option":{"key":"11/8/2016 1:30 PM","checked":false,"values":["11/8/2016 1:30 PM"],"label":"11/8/2016 1:30 PM"}},"10/26/2016 5:50 PM":{"count":1,"option":{"key":"10/26/2016 5:50 PM","checked":false,"values":["10/26/2016 5:50 PM"],"label":"10/26/2016 5:50 PM"}},"10/26/2016 5:49 PM":{"count":1,"option":{"key":"10/26/2016 5:49 PM","checked":false,"values":["10/26/2016 5:49 PM"],"label":"10/26/2016 5:49 PM"}}},

"Editor":{"Yimin Wu":{"count":18,"option":{"key":"Yimin Wu","values":["Yimin Wu"],"label":"Yimin Wu"}},"Zhi Liu":{"count":4,"option":{"key":"Zhi Liu","values":["Zhi Liu"],"label":"Zhi Liu"}}},

"requirenum":{"0":{"count":13,"option":{"key":"0","checked":false,"values":["0"],"label":"0"}},"1":{"count":3,"option":{"key":"1","checked":false,"values":["1"],"label":"1"}},"3":{"count":1,"option":{"key":"3","checked":false,"values":["3"],"label":"3"}},"4":{"count":1,"option":{"key":"4","checked":false,"values":["4"],"label":"4"}},"32":{"count":1,"option":{"key":"32","checked":false,"values":["32"],"label":"32"}},"(Empty)":{"count":3,"option":{"key":"(Empty)","checked":false,"values":[""],"label":"(Empty)"}}},

"choice":{"(Empty)":{"count":3,"option":{"key":"(Empty)","checked":false,"values":[""],"label":"(Empty)"}},"A":{"count":17,"option":{"key":"A","checked":false,"values":["A"],"label":"A"}},"red":{"count":1,"option":{"key":"red","checked":false,"values":["red"],"label":"red"}},"white":{"count":1,"option":{"key":"white","checked":false,"values":["white"],"label":"white"}}},

"requirechoice":{"(Empty)":{"count":3,"option":{"key":"(Empty)","checked":false,"values":[""],"label":"(Empty)"}},"red":{"count":17,"option":{"key":"red","checked":false,"values":["red"],"label":"red"}},"blue":{"count":2,"option":{"key":"blue","checked":false,"values":["blue"],"label":"blue"}}},

"required":{"1":{"count":2,"option":{"key":"1","checked":false,"values":["1"],"label":"1"}},"2":{"count":2,"option":{"key":"2","checked":false,"values":["2"],"label":"2"}},"3":{"count":1,"option":{"key":"3","checked":false,"values":["3"],"label":"3"}},"343":{"count":1,"option":{"key":"343","checked":false,"values":["343"],"label":"343"}},"(Empty)":{"count":16,"option":{"key":"(Empty)","checked":false,"values":[""],"label":"(Empty)"}}},

"quoteChoice":{"(Empty)":{"count":13,"option":{"key":"(Empty)","checked":false,"values":[""],"label":"(Empty)"}},"6F's - 5S":{"count":5,"option":{"key":"6F's - 5S","checked":false,"values":["6F's - 5S"],"label":"6F's - 5S"}},"6F's - SMED":{"count":1,"option":{"key":"6F's - SMED","checked":false,"values":["6F's - SMED"],"label":"6F's - SMED"}},"6F's - PMS 6F's - Leadership":{"count":2,"option":{"key":"6F's - PMS 6F's - Leadership","checked":false,"values":["6F's - PMS 6F's - Leadership"],"label":"6F's - PMS 6F's - Leadership"}},"6F's - Autonomous Maintenance":{"count":1,"option":{"key":"6F's - Autonomous Maintenance","checked":false,"values":["6F's - Autonomous Maintenance"],"label":"6F's - Autonomous Maintenance"}}}}`);

    beforeEach(() => {
        dependencies = {
            getIconUrlFromExtension: (extension: string) => { return extension; }
        };
        strings = {
            OtherFileTypeOption: 'Other',
            EmptyFilterOptionLabel: '(Empty)',
            FileTypeFilterSectionTitle: 'Type'
        };
    });

    describe('#getFilterOption', () => {
        it('can get filter option for FileIcon type', () => {
            let wordOption = SmartFiltersHelper.getFilterOptionCore(dependencies, strings, ColumnFieldType.FileIcon, 'doc', 'doc', true);
            let powerPointOption = SmartFiltersHelper.getFilterOptionCore(dependencies, strings, ColumnFieldType.FileIcon, 'ppt', 'ppt', true);
            let emptyIconOption = SmartFiltersHelper.getFilterOptionCore(dependencies, strings, ColumnFieldType.FileIcon, '', '', true);
            expect(wordOption.label).to.equal('Word');
            expect(powerPointOption.label).to.equal('PowerPoint');
            expect(emptyIconOption.label).to.equal('Other');
        });

        it('can get filter option for empty filter value', () => {
            let emptyChoiceOption = SmartFiltersHelper.getFilterOptionCore(dependencies, strings, ColumnFieldType.Choice, '', '', true);
            expect(emptyChoiceOption.label).to.equal('(Empty)');
        });
    });

    describe('#getSectionType', () => {
        it('can get filter section type based on field type', () => {
            expect(SmartFiltersHelper.getSectionType(ColumnFieldType.User, 'user')).to.equal(FilterSectionType.user);
            expect(SmartFiltersHelper.getSectionType(ColumnFieldType.DateTime, 'modified')).to.equal(FilterSectionType.date);
            expect(SmartFiltersHelper.getSectionType(ColumnFieldType.FileIcon, '')).to.equal(FilterSectionType.fileType);
            expect(SmartFiltersHelper.getSectionType(ColumnFieldType.Choice, 'choice')).to.equal(FilterSectionType.choice);
            if (Features.isFeatureEnabled(RenderHierarchyInFiltersPane)) {
                expect(SmartFiltersHelper.getSectionType(ColumnFieldType.Taxonomy, 'term')).to.equal(FilterSectionType.hierarchy);
                expect(SmartFiltersHelper.getSectionType(ColumnFieldType.Taxonomy, 'TaxKeyword')).to.equal(FilterSectionType.choice);
            } else {
                expect(SmartFiltersHelper.getSectionType(ColumnFieldType.Taxonomy, 'term')).to.equal(FilterSectionType.choice);
            }
        });
    });

    describe('#getNewDateTimeFilterSectionInfo', () => {
        it('can get datetime filter section info', () => {
            let columnInfo = columnInfoHash['Modified'];
            let sectionInfo = SmartFiltersHelper.getNewDateTimeFilterSectionInfo('Modified', '1', columnInfo.fieldType, columnInfo.displayName, fieldOptionsHash['Modified']);
            expect(sectionInfo.type).to.equal(FilterSectionType.date);
            expect(sectionInfo.maxValue).to.equal(DateTimeSliderValue.today);
            expect(sectionInfo.value).to.equal(DateTimeSliderValue.none);
        });
    });

    describe('#normalizeFilterDisplayString', () => {
        it('can normalize number/rating filter display string', () => {
            expect(SmartFiltersHelper.normalizeFilterDisplayString(ColumnFieldType.Number, '1.00000')).to.equal('1');
            expect(SmartFiltersHelper.normalizeFilterDisplayString(ColumnFieldType.Number, '2.0000')).to.equal('2');
            expect(SmartFiltersHelper.normalizeFilterDisplayString(ColumnFieldType.AverageRating, '3.50000')).to.equal('3.50');
            expect(SmartFiltersHelper.normalizeFilterDisplayString(ColumnFieldType.AverageRating, 'other3.000')).to.equal('other3.000');
            expect(SmartFiltersHelper.normalizeFilterDisplayString(ColumnFieldType.DateTime, '2016-11-12')).to.equal('11/12/2016');
            expect(SmartFiltersHelper.normalizeFilterDisplayString(ColumnFieldType.DateTime, '2016-01-02')).to.equal('1/2/2016');
        });
    });

    describe('#normalizeFilterValue', () => {
        it('can normalize currency filter value', () => {
            expect(SmartFiltersHelper.normalizeFilterValue(ColumnFieldType.Currency, '$12,000.00000')).to.equal('12000.00000');
        });
    });

    describe('#addOrUpdateSectionInfo', () => {
        it('can add or update sectionInfo array using new sectionInfo', () => {
            let sectionInfos: IFilterSectionInfo[] = [
                {
                    fieldName: 'DocIcon', fieldId: '1', fieldType: ColumnFieldType.FileIcon, type: FilterSectionType.fileType, serverFieldType: 'Computed',
                    options: [
                        { key: 'txt', checked: false, values: ['txt'], label: 'txt' },
                        { key: 'url', checked: false, values: ['url'], label: 'url' }
                    ]
                }
            ];

            let newFileTypeSectionInfo: IFilterSectionInfo = {
                fieldName: 'DocIcon', fieldId: '1', fieldType: ColumnFieldType.FileIcon, type: FilterSectionType.fileType, serverFieldType: 'Computed',
                options: [
                    { key: 'txt', checked: true, values: ['txt'], label: 'txt' },
                    { key: 'other', checked: true, values: [''], label: 'other' }
                ]
            };

            SmartFiltersHelper.addOrUpdateSectionInfo(sectionInfos, newFileTypeSectionInfo, 5);
            expect(sectionInfos.length).to.equal(1);
            expect(sectionInfos[0].options.length).to.equal(3);
            for (let option of sectionInfos[0].options) {
                if (option.key === 'url') {
                    expect(option.checked).to.equal(false);
                } else {
                    expect(option.checked).to.equal(true);
                }
            }

            let newChoiceSectionInfo: IFilterSectionInfo = {
                fieldName: 'choice', fieldId: '1', fieldType: ColumnFieldType.Choice, type: FilterSectionType.choice, serverFieldType: 'Choice',
                options: [
                    { key: 'txt', checked: true, values: ['txt'], label: 'txt' },
                    { key: 'other', checked: false, values: [''], label: 'other' }
                ]
            };

            SmartFiltersHelper.addOrUpdateSectionInfo(sectionInfos, newChoiceSectionInfo, 5);
            expect(sectionInfos.length).to.equal(2);
        });
    });

    describe('#updateSectionInfos', () => {
        it('can update section info using filters', () => {
            let sectionInfos: IFilterSectionInfo[] = [
                {
                    fieldName: 'DocIcon', fieldId: '1', fieldType: ColumnFieldType.FileIcon, type: FilterSectionType.fileType, serverFieldType: 'Computed',
                    options: [
                        { key: 'txt', checked: false, values: ['txt'], label: 'txt' },
                        { key: 'url', checked: false, values: ['url'], label: 'url' }
                    ]
                },
                {
                    fieldName: 'number', fieldId: '1', fieldType: ColumnFieldType.Number, type: FilterSectionType.choice, serverFieldType: 'Number',
                    options: [
                        { key: '1', checked: false, values: ['1.000'], label: '1' },
                        { key: '2', checked: false, values: ['2.000'], label: '2' }
                    ]
                }
            ];

            SmartFiltersHelper.updateSectionInfosCore(dependencies, strings, sectionInfos, [{ fieldName: 'choice', values: ['blue'], operator: 'In' }], columnInfoHash, fieldOptionsHash);
            expect(sectionInfos.length).to.equal(3);

            SmartFiltersHelper.updateSectionInfosCore(dependencies, strings, sectionInfos, [{ fieldName: 'DocIcon', values: ['txt'], operator: 'In' }], columnInfoHash, fieldOptionsHash);
            SmartFiltersHelper.updateSectionInfosCore(dependencies, strings, sectionInfos, [{ fieldName: 'number', values: ['1.0'], operator: 'In' }], columnInfoHash, fieldOptionsHash);
            for (let sectionInfo of sectionInfos) {
                if (sectionInfo.fieldName === 'DocIcon') {
                    for (let option of sectionInfo.options) {
                        if (option.key === 'txt') {
                            expect(option.checked).to.equal(true);
                        } else {
                            expect(option.checked).to.equal(false);
                        }
                    }
                } else if (sectionInfo.fieldName === 'choice') {
                    for (let option of sectionInfo.options) {
                        if (option.key === 'blue') {
                            expect(option.checked).to.equal(true);
                        }
                    }
                } else if (sectionInfo.fieldName === 'number') {
                    for (let option of sectionInfo.options) {
                        if (option.key === '1') {
                            expect(option.checked).to.equal(true);
                        }
                    }
                }
            }

            SmartFiltersHelper.updateSectionInfosCore(dependencies, strings, sectionInfos, [{ fieldName: 'Modified', values: ['[Today]'], operator: 'Geq' }], columnInfoHash, fieldOptionsHash);
            expect(sectionInfos.length).to.equal(4);

            SmartFiltersHelper.updateSectionInfosCore(dependencies, strings, sectionInfos, [{ fieldName: 'Modified', values: ['[Today]-1'], operator: 'Geq' }], columnInfoHash, fieldOptionsHash);
            for (let sectionInfo of sectionInfos) {
                if (sectionInfo.fieldName === 'Modified') {
                    (sectionInfo as IDateTimeFilterSectionInfo).value = DateTimeSliderValue.yesterday;
                }
            }

            SmartFiltersHelper.updateSectionInfosCore(dependencies, strings, sectionInfos, [{ fieldName: 'Modified', values: ['12/13/2015'], operator: 'Eq' }], columnInfoHash, fieldOptionsHash);
            for (let sectionInfo of sectionInfos) {
                if (sectionInfo.fieldName === 'Modified') {
                    (sectionInfo as IDateTimeFilterSectionInfo).value = DateTimeSliderValue.none;
                }
            }
        });
    });
});
