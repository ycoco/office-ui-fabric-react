// OneDrive:IgnoreCodeCoverage

import { ISiteSettingsPanelProps } from '../../components/SiteSettingsPanel';
import {
  ISiteSettingsPanelContainerState,
  ISiteSettingsPanelContainerStateManagerParams
} from './SiteSettingsPanel.Props';
import { IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import EventGroup from '@ms/odsp-utilities/lib/events/EventGroup';
import ISpPageContext from '@ms/odsp-datasources/lib/interfaces/ISpPageContext';
import Group, { SourceType } from '@ms/odsp-datasources/lib/models/groups/Group';
import GroupsProvider, { IGroupsProvider } from '@ms/odsp-datasources/lib/providers/groups/GroupsProvider';

const PRIVACY_OPTION_PRIVATE = 'private';
const PRIVACY_OPTION_PUBLIC = 'public';

/**
 * This class manages the state of the SiteSettingsPanel component.
 */
export class SiteSettingsPanelContainerStateManager {
  private _pageContext: ISpPageContext;
  private _eventGroup: EventGroup;
  private _params: ISiteSettingsPanelContainerStateManagerParams;
  private _isGroup: boolean;
  private _groupsProvider: IGroupsProvider;

  constructor(params: ISiteSettingsPanelContainerStateManagerParams) {
    this._params = params;
    this._pageContext = params.pageContext;
    this._isGroup = !!this._pageContext.groupId;
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
      const group = this._groupsProvider.group;

      let loadGroupProperties = (source: SourceType) => {
        if (source !== SourceType.None) {
          // either Group source is Server or Cached...
          this.setState({
            // TODO: Set logo image (group.pictureUrl)
            name: group.name,
            description: group.description,
            privacyOptions: this._getPrivacyOptions(group),
            classificationOptions: this._getClassificationOptions(group)
          });
        }
      };

      // react to Group source data being updated
      this._eventGroup = new EventGroup(this);
      this._eventGroup.on(group, 'source', loadGroupProperties);
      loadGroupProperties(group.source);
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

      strings: {
        title: params.strings.title,
        nameLabel: params.strings.nameLabel,
        descriptionLabel: params.strings.descriptionLabel,
        privacyLabel: params.strings.privacyLabel,
        classificationLabel: params.strings.classificationLabel,
        saveButton: params.strings.saveButton,
        closeButton: params.strings.closeButton
      },

      onSave: this._onSave.bind(this)
    };
  }

  private setState(state: ISiteSettingsPanelContainerState) {
    this._params.siteSettingsPanel.setState(state);
  }

  private _getClassificationOptions(group: Group): IDropdownOption[] {
    return [
      // TODO: Placeholder, actually fetch available classifications
      { key: 0, text: 'LBI', isSelected: true },
      { key: 1, text: 'MBI' },
      { key: 2, text: 'HBI' }
    ];
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

  private _onSave(name: string, description: string, privacy: IDropdownOption, classification: IDropdownOption) {
    if (this._isGroup) {
      const group = this._groupsProvider.group;

      // TODO: Actually persist change via updateGroup() on GroupSiteManager
      group.name = name;
      group.description = description;
      group.isPublic = (privacy.key === PRIVACY_OPTION_PUBLIC);
      group.classification = classification.text;
      // group.save();
    } else {
      // TODO: Save changed properties to SPWeb
    }
  }
}