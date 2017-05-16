import { IPolicyTipInfo, PolicyTipUserActionResult } from '@ms/odsp-datasources/lib/PolicyTip';

interface IPolicyTipInformation {
    info: IPolicyTipInfo;
    actionResult: PolicyTipUserActionResult;
}

export default IPolicyTipInformation;