// OneDrive:IgnoreCodeCoverage

import { Engagement as EngagementEvent } from '../logging/events/Engagement.event';

/**
 * @file Contains components to perform AB testing experiments.
 */

/**
 * Represents the context information used by an experiment.
 */
export interface IABContext {
    /** User login name, like "user@microsoft.com". */
    userLoginName: string;
     /** True when the user is external guest. */
    isExternalGuestUser?: boolean;
    /** True when the user is anonymous guest. */
    isAnonymousGuestUser?: boolean;
    /** Farm label, like US_16_Content. */
    farmLabel?: string;
    /** siteSubscriptionId that represents tenantId. */
    siteSubscriptionId?: string;
};

/**
 * Represents data that specifies the settings for an AB Experiment.
 * @example
 * // set the experiment data.
 * let newMenuExperimentData: IABExperimentData = { name: "NewMenu", 
 *                                          startDate: "11/17/2016", 
 *                                          segmentPopulation: 0.4, 
 *                                          targetType: TargetType.tenant
 *                                          };.
 */
export interface IABExperimentData {
    /**
     * The name of the experiment.
     * @type {string}
     */
    name: string;
    /**
     * The date when the AB Testing experiment will be created.
     * i.e. "10/12/2016"; used for tracking purposes.
     * @type {string}
     */
    startDate: string;
    /**
     * The percentage of population that will receive the experiment.
     * If not provided, it defaults to 0.5 (meaning 50%).
     * @type {number}
     */
    segmentPopulation?: number;
    /**
     * The type of target used for running the experiment: user, farm or tenant. 
     * @type {TargetType}
     */
    targetType?: TargetType;
};

/**
 * Enum for the types of targets that can be used to run an experiment. 
 * @enum {number}
 */
export enum TargetType {
    /** Value for user population. */
    user = 1,
    /** Value for tenant population.  */
    tenant = 2,
    /** Value for farm population. */
    farm = 3
}

/**
 * This class will be used for AB Testing type of experiments. 
 */
export class ABExperiment {
    private static _hostSettings: IABContext;
    private _experimentData: IABExperimentData;
    private _isOn: boolean;

    /**
     * @constructor
     * @param {IABExperimentData} experimentData The data for the experiment.
     * @example
     * // set the experiment data
     * let newMenuExperimentData: IABExperimentData = { name: "NewMenu", startDate: "11/17/2016", segmentPopulation: 0.4};
     * // create the experiment object
     * let newMenuExperiment: ABExperiment = new ABExperiment(newMenuExperimentData);
     */
    constructor(experimentData: IABExperimentData) {
        // set the _experimentData
        // if segementPopulation is not specified set it to half, 0.5
        // if targetType is not specified set it to user type
        this._experimentData = {
            name: experimentData.name,
            startDate: experimentData.startDate,
            segmentPopulation: (experimentData.segmentPopulation === undefined) ? 0.5 : experimentData.segmentPopulation,
            targetType: (experimentData.targetType === undefined) ? TargetType.user : experimentData.targetType
        };

        // set isOn to false, by default
        this._isOn = false;
        if (ABExperiment._hostSettings === null || ABExperiment._hostSettings === undefined) {
            // log that the App that wasnts to do experiments
            // does not have host settings and quit doing the experiment checks
            EngagementEvent.logData({ name: this._experimentData.name + ".Experiment.HostSettingsMissing" });
        } else {
            // set the isOn flag based on the target type
            // if it ever reaches the default then return false
            switch (this._experimentData.targetType) {
                case TargetType.user:
                    this._isOn = this._isUserExperimentOn();
                    break;
                case TargetType.tenant:
                    this._isOn = this._isTenantExperimentOn();
                    break;
                case TargetType.farm:
                    this._isOn = this._isFarmExperimentOn();
                    break;
            }
        }
    }

    /**
     * Initializes ABExperiment with the hostSettings.
     * @param {IABContext} hostSettings The host settings of the app where is experiment is running.
     */
    public static Init (hostSettings: IABContext): void {
        ABExperiment._hostSettings = hostSettings;
        ABExperiment._hostSettings = {
            userLoginName: hostSettings.userLoginName || 'missing_user',
            siteSubscriptionId: hostSettings.siteSubscriptionId || 'missing_tenant',
            farmLabel: hostSettings.farmLabel || 'missing_farm'
        };
    }

    /**
     * Returns the experiment data to be used for logging purposes.
     * @return {IABExperimentData}.
     */
    public GetExperimentData(): IABExperimentData {
        return this._experimentData;
    }

    /**
     * Checks if the current specified target is being selected to be part of the experiment.
     * @param {string} targetType is the type of target that the experiment will run on. It can be user, tenant, or farm.
     * @return {boolean}.
     */
    public IsExperimentOn(): boolean {
        return this._isOn;
    }

    /**
     * Checks if the current user is being selected to be part of the experiment.
     * @return {boolean}.
     */
    private _isUserExperimentOn(): boolean {
        // in case there are no host settings default to no experiments
        if (ABExperiment._hostSettings === null) {
            return false;
        }

        // build an uber token
        let targetToken = this._experimentData.name + '_' +
                        ABExperiment._hostSettings.userLoginName + '_' +
                        ABExperiment._hostSettings.siteSubscriptionId + '_' +
                        ABExperiment._hostSettings.farmLabel;
        return this._isExperimentOn(targetToken);
   }

    /**
     * Checks if the current tenant is being selected to be part of the experiment.
     * @return {boolean}.
     */
    private _isTenantExperimentOn(): boolean {
        // in case there are no settings default to no experiment path 
        if (ABExperiment._hostSettings === null) {
            return false;
        }
        // build an uber token 
        let targetToken = this._experimentData.name + '_' +
                        ABExperiment._hostSettings.siteSubscriptionId + '_' +
                        ABExperiment._hostSettings.farmLabel;
        return this._isExperimentOn(targetToken);
   }

    /**
     * Checks if the current farm is being selected to be part of the experiment.
     * @return {boolean}.
     */
    private _isFarmExperimentOn(): boolean {
        // in case there are no settings default to no experiment path 
        if (ABExperiment._hostSettings === null) {
            return false;
        }
       // build the token 
        let targetToken = this._experimentData.name + '_' +
                        ABExperiment._hostSettings.farmLabel;
        return this._isExperimentOn(targetToken);
   }

    /**
     * Returns true if the curent target type is being selected to be part of the experiment.
     * @param {string} targetToken this is the unique identfier for target.
     * @returns {boolean} true if the targetToken is in the segementPopulation defined for the experiment.
     */
    private _isExperimentOn (targetToken: string): boolean {
        if (targetToken === null) {
            return false;
        }

        // get the hash number for the specified targetToken
        let varHash = this._getHashNumber (targetToken);

        // it returns true if varHash is less than segementPopulation
        // same time, it logs experiment info
        if (varHash <= this._experimentData.segmentPopulation) {
            this._logData();
            return true;
        } else {
            this._logData();
            return false;
        }
    }

    /**
     * Returns an unique number based on the string provided.
     * @param {string} inputString this is the unique uber identfier for target.
     * @returns {number}.
     */
    private _getHashNumber (inputString: string): number {
        // in case there will be empty strings returns 1
        // this will take it to the experiment off path
        if (inputString.length === 0) {
            return 1;
        }

        let hash = 5381;
        for (var i = 0; i < inputString.length; ++i) {
            hash = ((hash << 5) + hash) + inputString.charCodeAt(i);
            hash = hash & hash;
        }

        hash = hash & 0xFFFF;
        return hash / 0xFFFF;
    };

    /**
     * Log the experiment data for teting purposes.
     */
    private _logData () {
        // prepare the extraData
        let extraData: any = { isOn: this._isOn,
                                startDate: this._experimentData.startDate,
                                isExternalGuestUser: ABExperiment._hostSettings.isExternalGuestUser,
                                isAnonymousGuestUser: ABExperiment._hostSettings.isAnonymousGuestUser,
                                farmLabel: ABExperiment._hostSettings.farmLabel,
                                targetType: this._experimentData.targetType
                            } ;
        // the tag will look like this <ScenarioName>.<experimentName>.Experiment
        EngagementEvent.logData({ name: this._experimentData.name + ".Experiment", extraData: extraData });
    }
}
