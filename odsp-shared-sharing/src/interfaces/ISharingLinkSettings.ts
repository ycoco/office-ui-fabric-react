import SharingAudience from './enums/SharingAudience';
import SharingLinkKind from './enums/SharingLinkKind';
import { IPerson } from '@ms/odsp-datasources/lib/PeoplePicker';

/**
 * This interface represents a collection of settings that are currently
 * selected in the sharing UI.
 */
interface ISharingLinkSettings {
    /* Determines whether or not the user can manage an edit link. */
    allowEditing: boolean;

    /* Determines which audience the sharing link belongs to. */
    audience: SharingAudience;

    /* The currently selected expiration date. */
    expiration: Date;

    /* Determines if the sharing link allows edit permissions. */
    isEdit: boolean;

    /* Determines the sharing link kind. */
    sharingLinkKind: SharingLinkKind;

    /* Collection of entities the user wants to share direct link with. */
    specificPeople: Array<IPerson>;
}

export default ISharingLinkSettings;