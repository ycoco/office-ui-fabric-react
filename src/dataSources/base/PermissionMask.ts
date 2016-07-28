import { IDouble } from './../../interfaces/IDouble.ts';

/**
 * Use PermissionsMask to check for permissions.
 */
export class PermissionMask {
    /** Permission to create new list new items. */
    public static insertListItems: IDouble = { High: 0x0, Low: 0x2 };
    /** Permission to edit existing list new items. */
    public static editListItems: IDouble = { High: 0x0, Low: 0x4 };
    /** Permission to delete list items. */
    public static deleteListItems: IDouble = { High: 0x0, Low: 0x8 };
    /** Permission to approve list items. */
    public static approveItems: IDouble = { High: 0x0, Low: 0x10 };
    /** Permission to read list items. */
    public static openItems: IDouble = { High: 0x0, Low: 0x20 };
    /** Permission to view list item versions. */
    public static viewVersions: IDouble = { High: 0x0, Low: 0x40 };
    /** Permission to delete list item versions. */
    public static deleteVersions: IDouble = { High: 0x0, Low: 0x80 };
    /** Permission to cancel an existent list item checkout. */
    public static cancelCheckout: IDouble = { High: 0x0, Low: 0x100 };
    /** Permission to manage lists, change lists settings. */
    public static manageLists: IDouble = { High: 0x0, Low: 0x800 };
    /** Permission to view form pages. */
    public static viewFormPages: IDouble = { High: 0x0, Low: 0x1000 };
    /** Permission to view pages. */
    public static viewPages: IDouble = { High: 0x0, Low: 0x20000 };
    /** Permission to view layouts pages. */
    public static layoutsPage: IDouble = { High: 0x0, Low: 0x21000 };
    /** Permission to add and customize pages. */
    public static addAndCustomizePages: IDouble = { High: 0x0, Low: 0x40000 };
    /** Permission to apply themes to the web. */
    public static applyThemeAndBorder: IDouble = { High: 0x0, Low: 0x80000 };
    /** Permission to view the usage data. */
    public static viewUsageData: IDouble = { High: 0x0, Low: 0x200000 };
    /** Permission to manage subwebs, add and remove. */
    public static manageSubwebs: IDouble = { High: 0x0, Low: 0x800000 };
    /** Permission to manage permissions. */
    public static managePermissions: IDouble = { High: 0x0, Low: 0x2000000 };
    /** Permission to navigate folders. */
    public static browseDirectories: IDouble = { High: 0x0, Low: 0x4000000 };
    /** Permission to manage the current web. */
    public static manageWeb: IDouble = { High: 0x0, Low: 0x40000000 };
    /** Permission to use client integration. */
    public static useClientIntegration: IDouble = { High: 0x10, Low: 0x0 };
    /** Permission to manage alerts. */
    public static manageAlerts: IDouble = { High: 0x40, Low: 0x0 };
    /** Permission to create alerts. */
    public static createAlerts: IDouble = { High: 0x80, Low: 0x0 };
    /** Permission to enumerate permissions. */
    public static enumeratePermissions: IDouble = { High: 0x40000000, Low: 0x0 };

    // fullMask has all permissions, should be the last option in this list.
    /**
     * Full set of permissions.
     */
    public static fullMask: IDouble = { High: 0x7FFFFFFF, Low: 0xFFFFFFFF };

    /**
     * Returns true if the actual permissions include the requested permission,
     * false otherwise.
     */
    public static hasPermission(actualPerms: IDouble, requestedPerm: IDouble): boolean {
        return requestedPerm && actualPerms &&
        /* tslint:disable: no-bitwise */
            ((requestedPerm.Low & actualPerms.Low) === requestedPerm.Low) &&
            ((requestedPerm.High & actualPerms.High) === requestedPerm.High);
        /* tslint:enable: no-bitwise */
    }

    /**
     * Returns true if the actual permissions include any of the the requested permission,
     *  false otherwise.
     */
    public static hasAny(actualPerms: IDouble, requestedPerms: IDouble[]): boolean {
        return (requestedPerms || []).some((permission: IDouble) => {
            return PermissionMask.hasPermission(actualPerms, permission);
        });
    }
}

export default PermissionMask;
