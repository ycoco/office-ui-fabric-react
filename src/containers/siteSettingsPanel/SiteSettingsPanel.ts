// OneDrive:IgnoreCodeCoverage

import EventGroup from '@ms/odsp-utilities/lib/events/EventGroup';
import GroupService from '@ms/odsp-datasources/lib/dataSources/groups/GroupService';
import ISpPageContext from '@ms/odsp-datasources/lib/interfaces/ISpPageContext';
import Promise from '@ms/odsp-utilities/lib/async/Promise';
import { AcronymAndColorDataSource, IAcronymColor } from '@ms/odsp-datasources/lib/AcronymAndColor';
import { autobind } from 'office-ui-fabric-react/lib/utilities/autobind';
import { Group, GroupsProvider, IGroupsProvider, SourceType } from '@ms/odsp-datasources/lib/Groups';
import { GroupSiteProvider, IGroupSiteProvider } from '@ms/odsp-datasources/lib/GroupSite';
import { IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { ISiteSettingsPanelContainerStateManagerParams, ISiteSettingsPanelContainerState } from './SiteSettingsPanel.Props';
import { ISiteSettingsPanelProps } from '../../components/SiteSettingsPanel';

const DEFAULT_LOGO_STRING: string = '_layouts/15/images/siteicon.png';
const PRIVACY_OPTION_PRIVATE = 'private';
const PRIVACY_OPTION_PUBLIC = 'public';

/**
 * This class manages the state of the SiteSettingsPanel component.
 */
export class SiteSettingsPanelContainerStateManager {
  private _acronymDataSource: AcronymAndColorDataSource;
  private _pageContext: ISpPageContext;
  private _eventGroup: EventGroup;
  private _params: ISiteSettingsPanelContainerStateManagerParams;
  private _isGroup: boolean;
  private _groupsProvider: IGroupsProvider;
  private _groupSiteProvider: IGroupSiteProvider;
  private _groupService: GroupService;

  constructor(params: ISiteSettingsPanelContainerStateManagerParams) {
    this._params = params;
    this._pageContext = params.pageContext;
    this._isGroup = !!this._pageContext.groupId;

    this.setState({
      isLoading: true
    });
  }

  public componentDidMount() {
    const params = this._params;

    if (this._isGroup) {
      // If this is a group then attempt to get the group properties from GroupsProvider.
      // Initially this information may be cached or unavailable, so need to defer update
      // until groups properties come back from server.
      this._groupsProvider = new GroupsProvider({
        pageContext: params.pageContext
      });
      this._groupService = new GroupService(params.pageContext);
      const group = this._groupsProvider.group;

      // wrap group properties source event as a Promise
      let groupPropertiesPromise = new Promise<Group>(
        (success: (result: Group) => void, failure: () => void) => {
          let loadGroupProperties = (source: SourceType) => {
            if (source === SourceType.Server) {
              // only display fresh data from Server
              this.setState({
                name: group.name,
                description: group.description,
                privacyOptions: this._getPrivacyOptions(group),
                siteLogoUrl: this._getSiteLogoUrl(group)
              });

              success(group);
            }
          };

          // react to Group source data being updated
          this._eventGroup = new EventGroup(this);
          this._eventGroup.on(group, 'source', loadGroupProperties);
          loadGroupProperties(group.source);
      });

      this._acronymDataSource = new AcronymAndColorDataSource(this._pageContext);
      let getAcronymDataPromise = this._acronymDataSource.getAcronymData(this._pageContext.webTitle);

      getAcronymDataPromise.done((value: IAcronymColor) => {
        this.setState({
          siteAcronym: value.acronym,
          siteLogoColor: value.color
        });
      });

      this._groupSiteProvider = new GroupSiteProvider({ pageContext: this._pageContext });
      let getGroupCreationContextPromise = this._groupSiteProvider.getGroupCreationContext();

      // need both group properties and creation context to construct the full classification state
      Promise.all([groupPropertiesPromise, getGroupCreationContextPromise]).done((values: any[]) => {
        const group = values[0] as Group;
        const creationContext = values[1];

        let classificationOptions =
          // map classification options into dropdown options and mark as selected based on Group classification property
          (creationContext && creationContext.DataClassificationOptions && creationContext.DataClassificationOptions.results) ?
            creationContext.DataClassificationOptions.results.map((classification: string, index: number) => {
            return <IDropdownOption>{
              key: index,
              text: classification,
              isSelected: (classification === group.classification) };
          }) : [];

        this.setState({ classificationOptions: classificationOptions });
      });

      // wait until all loading Promises are satisified, then disable the loading spinner
      Promise.all([groupPropertiesPromise, getAcronymDataPromise, getGroupCreationContextPromise]).done(() => {
        this.setState({ isLoading: false });
      });
    } else {
      // TODO: Load properties from SPWeb
    }
  }

  public componentWillUnmount() {
    if (this._eventGroup) {
      this._eventGroup.dispose();
      this._eventGroup = null;
    }
  }

  public getRenderProps(): ISiteSettingsPanelProps {
    const params = this._params;
    const state = params.siteSettingsPanel.state;

    return {
      name: state ? state.name : '',
      description: state ? state.description : '',
      privacyOptions: state ? state.privacyOptions : [],
      classificationOptions: state ? state.classificationOptions : [],
      showLoadingSpinner: state && typeof state.isLoading === 'boolean' ? state.isLoading : true,
      errorMessage: state ? state.errorMessage : undefined,

      siteLogo: {
        imageUrl: state ? state.siteLogoUrl : undefined,
        acronym: state ? state.siteAcronym : undefined,
        backgroundColor: state ? state.siteLogoColor : undefined
      },

      strings: {
        title: params.strings.title,
        nameLabel: params.strings.nameLabel,
        descriptionLabel: params.strings.descriptionLabel,
        privacyLabel: params.strings.privacyLabel,
        classificationLabel: params.strings.classificationLabel,
        saveButton: params.strings.saveButton,
        closeButton: params.strings.closeButton
      },

      onSave: this._onSave
    };
  }

  private setState(state: ISiteSettingsPanelContainerState) {
    this._params.siteSettingsPanel.setState(state);
  }

  private _getSiteLogoUrl(group: Group) {
    let logoUrl = this._pageContext.webLogoUrl;

    // try to use team site logo, if set to default then use the group picture
    if (logoUrl === DEFAULT_LOGO_STRING) {
      logoUrl = group.pictureUrl;
    }

    return logoUrl;
  }

  private _getPrivacyOptions(group: Group): IDropdownOption[] {
    return [
      {
        key: PRIVACY_OPTION_PRIVATE,
        text: this._params.strings.privacyOptionPrivate,
        isSelected: !group.isPublic
      },
      {
        key: PRIVACY_OPTION_PUBLIC,
        text: this._params.strings.privacyOptionPublic,
        isSelected: group.isPublic
      }
    ];
  }

  @autobind
  private _onSave(name: string, description: string, privacy: IDropdownOption, classification: IDropdownOption) {
    // clear any error message from previous attempts
    this.setState({ errorMessage: null });

    if (this._isGroup) {
      const group = this._groupsProvider.group;

      group.name = name;
      group.description = description;
      group.isPublic = (privacy.key === PRIVACY_OPTION_PUBLIC);
      group.classification = classification.text;

      this._groupsProvider.saveGroupProperties(group)
        .then(() => this._groupService.syncGroupProperties(), (error: any) => {
          this.setState({ errorMessage: error.message.value });
          throw error;
        })
        .then(() => window.location.reload());
    } else {
      // TODO: Save changed properties to SPWeb
    }
  }
}