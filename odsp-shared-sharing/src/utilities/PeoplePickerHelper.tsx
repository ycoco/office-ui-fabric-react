import { IShareStrings, SharingLinkKind } from '../interfaces/SharingInterfaces';
import { IPerson, EntityType } from '@ms/odsp-datasources/lib/PeoplePicker';
import StringHelper = require('@ms/odsp-utilities/lib/string/StringHelper');
import * as React from 'react';
import { Link } from 'office-ui-fabric-react/lib/Link';

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

export function getOversharingGroupsWarning(selectedItems: Array<IPerson>, groupsMemberCount: number, strings: IShareStrings): string {
    const groups = selectedItems.filter((item: IPerson) => {
        return item.entityType === EntityType.group;
    });
    const numberOfGroups = groups.length;

    let warningText = '';
    if (numberOfGroups === 1) {
        warningText = strings.oneGroupInvited;
    } else if (numberOfGroups > 1) {
        warningText = StringHelper.format(strings.multipleGroupsInvited, numberOfGroups);
    }

    if (groupsMemberCount >= 1000) {
        warningText += ` ${strings.groupsMemberCountLargeLabel}`;
    } else if (groupsMemberCount >= 25) {
        warningText += ` ${StringHelper.format(strings.groupsMemberCountLabel, groupsMemberCount)}`;
    }

    return warningText;
}

export interface IPickerErrorProps {
    selectedItems: Array<IPerson>;
    sharingLinkKind: SharingLinkKind;
    canAddExternalPrincipal: boolean;
    hasDlpPolicyTip: boolean;
    viewPolicyTipCallback: () => void;
    strings: IShareStrings;
    permissionsMap?: { [index: string]: boolean };
}

export function renderPickerError(props: IPickerErrorProps): JSX.Element {
    const {
        selectedItems,
        sharingLinkKind,
        canAddExternalPrincipal,
        hasDlpPolicyTip,
        viewPolicyTipCallback,
        strings,
        permissionsMap
    } = props;

    /**
     * If we have a permissionsMap and a canonical is being shared, we need to
     * check if desired recipients actually have permission to access the item.
     */
    if (permissionsMap && sharingLinkKind === SharingLinkKind.direct) {
        let usersWithoutPermissions = 0;
        for (const email in permissionsMap) {
            if (permissionsMap[email] === false) {
                usersWithoutPermissions++;
            }
        }

        if (usersWithoutPermissions === 1) {
            return <span>{ strings.insufficientPermissionsError }</span>;
        } else if (usersWithoutPermissions > 1) {
            return <span>{ strings.insufficientPermissionsErrorPlural }</span>;
        }
    }

    for (const selectedItem of selectedItems) {
        // Other errors are specific to external users.
        if (selectedItem.isExternal) {
            if (sharingLinkKind === SharingLinkKind.organizationEdit || sharingLinkKind === SharingLinkKind.organizationView) {
                return <span>{ strings.peoplePickerErrorCsl }</span>;
            } else if (!canAddExternalPrincipal) {
                if (hasDlpPolicyTip) {
                    return (
                        <div>
                            <span>{ strings.ptErrorMessage } </span>
                            <Link onClick={ viewPolicyTipCallback }>
                                { strings.ptViewPolicyTipLabel }
                            </Link>
                        </div>
                    );
                } else {
                    return <span>{ strings.peoplePickerErrorExternal }</span>;
                }
            }
        }
    }

    return null;
}