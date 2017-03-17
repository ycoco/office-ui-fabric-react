import IDouble from '../../interfaces/IDouble';
import Identity from './Identity';

export class PermissionMask {
    public static insertListItems: IDouble = { High: 0x0, Low: 0x2 };
    public static editListItems: IDouble = { High: 0x0, Low: 0x4 };
    public static deleteListItems: IDouble = { High: 0x0, Low: 0x8 };
    public static approveItems: IDouble = { High: 0x0, Low: 0x10 };
    public static openItems: IDouble = { High: 0x0, Low: 0x20 };
    public static viewVersions: IDouble = { High: 0x0, Low: 0x40 };
    public static deleteVersions: IDouble = { High: 0x0, Low: 0x80 };
    public static cancelCheckout: IDouble = { High: 0x0, Low: 0x100 };
    public static manageLists: IDouble = { High: 0x0, Low: 0x800 };
    public static viewFormPages: IDouble = { High: 0x0, Low: 0x1000 };
    public static viewPages: IDouble = { High: 0x0, Low: 0x20000 };
    public static layoutsPage: IDouble = { High: 0x0, Low: 0x21000 };
    public static addAndCustomizePages: IDouble = { High: 0x0, Low: 0x40000 };
    public static applyThemeAndBorder: IDouble = { High: 0x0, Low: 0x80000 };
    public static viewUsageData: IDouble = { High: 0x0, Low: 0x200000 };
    public static manageSubwebs: IDouble = { High: 0x0, Low: 0x800000 };
    public static managePermissions: IDouble = { High: 0x0, Low: 0x2000000 };
    public static browseDirectories: IDouble = { High: 0x0, Low: 0x4000000 };
    public static manageWeb: IDouble = { High: 0x0, Low: 0x40000000 };
    public static useClientIntegration: IDouble = { High: 0x10, Low: 0x0 };
    public static manageAlerts: IDouble = { High: 0x40, Low: 0x0 };
    public static createAlerts: IDouble = { High: 0x80, Low: 0x0 };
    public static enumeratePermissions: IDouble = { High: 0x40000000, Low: 0x0 };
    // fullMask has all permissions, should be the last option in this list.
    public static fullMask: IDouble = { High: 0x7FFFFFFF, Low: 0xFFFFFFFF };

    public static hasItemPermission(item: { permissions?: IDouble }, permission: IDouble): boolean {
        return item && item.permissions && PermissionMask.hasPermission(item.permissions, permission);
    }

    public static hasPermission(actualPerms: IDouble, requestedPerm: IDouble): boolean {
        // tslint:disable:no-bitwise
        return requestedPerm && actualPerms &&
            ((requestedPerm.Low & actualPerms.Low) === requestedPerm.Low) &&
            ((requestedPerm.High & actualPerms.High) === requestedPerm.High);
        // tslint:enable:no-bitwise
    }

    public static hasAny(actualPerms: IDouble, requestedPerms: IDouble[]): boolean {
        return (requestedPerms || []).some((permission: IDouble) => {
            return PermissionMask.hasPermission(actualPerms, permission);
        });
    }

    public static hasIdentityPermission(identity: Identity, permission: IDouble): boolean {
        return permission && identity.webPermMasks
            && PermissionMask.hasPermission(identity.webPermMasks, permission);
    }
}

export default PermissionMask;