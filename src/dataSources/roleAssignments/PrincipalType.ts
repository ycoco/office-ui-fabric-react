
/**
 * Specifies the type of a principal.
 */
enum PrincipalType {
    /**
     * Enumeration whose value specifies no principal type. Value = 0.
     */
    none = 0,

    /**
     * Enumeration whose value specifies a user as the principal type. Value = 1.
     */
    user = 1,

    /**
     * Enumeration whose value specifies a distribution list as the principal type. Value = 2.
     */
    distributionList = 2,

    /**
     * Enumeration whose value specifies a security group as the principal type. Value = 4.
     */
    securityGroup = 4,

    /**
     * Enumeration whose value specifies a group (2) as the principal type. Value = 8.
     */
    sharePointGroup = 8,

    /**
     * Enumeration whose value specifies all principal types. Value = 15.
     */
    all = 15
}

export default PrincipalType;