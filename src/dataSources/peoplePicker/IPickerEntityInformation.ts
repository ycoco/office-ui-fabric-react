import { IPerson } from './IPerson';

export interface IPickerEntityInformation {
    person: IPerson;
    totalMemberCount: number;
}

export interface IPickerProperties {
    AllowEmailAddresses: boolean;
    AllowOnlyEmailAddresses?: boolean;
    PrincipalAccountType?: number;
    PrincipalSource?: number;
    VisibleSuggestions?: number;
}