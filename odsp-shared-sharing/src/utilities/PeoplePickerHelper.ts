import { IShareStrings } from '../interfaces/SharingInterfaces';
import { IPerson, EntityType } from '@ms/odsp-datasources/lib/PeoplePicker';
import StringHelper = require('@ms/odsp-utilities/lib/string/StringHelper');

export function getExternalPeopleCount(selectedItems: Array<IPerson>): number {
    if (!selectedItems || selectedItems.length === 0) {
        return 0;
    }

    const externalPeople = selectedItems.filter((item: IPerson) => {
        return item.entityType === EntityType.externalUser;
    });

    return externalPeople.length;
}

export function getOversharingExternalsWarning(selectedItems: Array<IPerson>, strings: IShareStrings): string {
    const externalPeople = selectedItems.filter((item: IPerson) => {
        return item.entityType === EntityType.externalUser;
    });
    const numberOfPeople = externalPeople.length;
    const names: Array<string> = externalPeople.map((persona: IPerson) => {
        return persona.name;
    });

    if (numberOfPeople === 2) {
        const result = names.join(', ');
        const oxfordComma: number = result.lastIndexOf(',');
        return `${result.substring(0, oxfordComma)} ${strings.and} ${result.substring(oxfordComma + 1)} ${strings.outsideOfYourOrgPlural}`;
    } else if (numberOfPeople > 2) {
        const result = names.join(', ');
        const oxfordComma: number = result.lastIndexOf(',');
        return `${result.substring(0, oxfordComma + 1)} ${strings.and} ${result.substring(oxfordComma + 1)} ${strings.outsideOfYourOrgPlural}`;
    } else if (numberOfPeople === 1) {
        return `${names[0]} ${strings.outsideOfYourOrgSingular}`;
    } else {
        return '';
    }
}

export function getOversharingGroupsWarning(selectedItems: Array<IPerson>, strings: IShareStrings): string {
    const groups = selectedItems.filter((item: IPerson) => {
        return item.entityType === EntityType.group;
    });
    const numberOfGroups = groups.length;

    if (numberOfGroups === 1) {
        return strings.oneGroupInvited;
    } else if (numberOfGroups > 1) {
        return StringHelper.format(strings.multipleGroupsInvited, numberOfGroups);
    } else {
        return '';
    }
}