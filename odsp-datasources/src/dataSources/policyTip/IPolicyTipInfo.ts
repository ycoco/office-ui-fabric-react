// These enums need to be kept in sync with those defined in SPOREL files:
// sts\stsom\Core\SPDlpPolicyTip.cs
// sts\template\jscript\modules\DLP\Dlp.jss
export const enum RuleOverrideOptions {
    none = 0,
    allow = 1,
    allowWithJustification = 2
}

// These enums need to be kept in sync with those defined in SPOREL files:
// sts\stsom\Core\SPDlpPolicyTip.cs
// sts\template\jscript\modules\DLP\Dlp.jss
export const enum PolicyTipUserActionResult {
    none = 0,
    falsePositiveReported = 1,
    overridden = 2,
    falsePositiveReportedAndOverridden = 3
}

// These enums need to be kept in sync with those defined in SPOREL files:
// sts\stsom\Core\SPDlpPolicyTip.cs
// sts\template\jscript\modules\DLP\Dlp.jss
export const enum PolicyTipUserAction {
    override = 0,
    reportFalsePositive = 1
}

export interface IPolicyTipInfo {
    /** Why is the policy tip showing up? (first paragraph in the dialog) */
    explanationText: string;

    /** URL for policy info */
    policyInfoUrl: string;

    /** Descriptions of the violations */
    issueDescriptions: string[];

    /** Last time the file was scanned */
    lastScanned: Date;

    /** Type of action the user may take to override the policy */
    overrideOption: RuleOverrideOptions;
}