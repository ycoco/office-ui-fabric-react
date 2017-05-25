// OneDrive:IgnoreCodeCoverage

import EventGroup from '@ms/odsp-utilities/lib/events/EventGroup';
import { ISpPageContext, isGroupWebContext } from '@ms/odsp-datasources/lib/interfaces/ISpPageContext';
import Promise from '@ms/odsp-utilities/lib/async/Promise';
import { AcronymAndColorDataSource, IAcronymColor } from '@ms/odsp-datasources/lib/AcronymAndColor';
import { autobind } from 'office-ui-fabric-react/lib/Utilities';
import { Group, GroupsProvider, IGroupsProvider, SourceType } from '@ms/odsp-datasources/lib/Groups';
import { IGroupCreationContext } from '@ms/odsp-datasources/lib/GroupSite';
import { GroupSiteProvider, IGroupSiteProvider } from '@ms/odsp-datasources/lib/GroupSite';
import { IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { ISiteSettingsPanelContainerStateManagerParams, ISiteSettingsPanelContainerState } from './SiteSettingsPanel.Props';
import { ISiteSettingsPanelProps } from '../../components/SiteSettingsPanel';
import { IWeb, WebDataSource } from '@ms/odsp-datasources/lib/Web';

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
  private _webDataSource: WebDataSource;

  constructor(params: ISiteSettingsPanelContainerStateManagerParams) {
    this._params = params;
    this._pageContext = params.pageContext;
    this._isGroup = isGroupWebContext(this._pageContext);
  }

  public componentDidMount() {
    const params = this._params;
    const promises = [];

    this._acronymDataSource = new AcronymAndColorDataSource(this._pageContext);
    let getAcronymDataPromise = this._acronymDataSource.getAcronymData(this._pageContext.webTitle);
    promises.push(getAcronymDataPromise);

    getAcronymDataPromise.done((value: IAcronymColor) => {
      this.setState({
        siteAcronym: value.acronym,
        siteLogoColor: this._isGroup ? this._pageContext.groupColor : value.color
      });
    });

    if (this._isGroup) {
      // If this is a group then attempt to get the group properties from GroupsProvider.
      // Initially this information may be cached or unavailable, so need to defer update
      // until groups properties come back from server.
      this._groupsProvider = new GroupsProvider({
        pageContext: params.pageContext
      });
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
                privacySelectedKey: group.isPublic ? PRIVACY_OPTION_PUBLIC : PRIVACY_OPTION_PRIVATE,
                siteLogoUrl: this._getSiteLogoUrl(group),
                hasPictureUrl: group.hasPictureUrl
              });

              success(group);
            }
          };

          // react to Group source data being updated
          this._eventGroup = new EventGroup(this);
          this._eventGroup.on(group, Group.onSourceChange, loadGroupProperties);
          group.load(true);
        });

      this._groupSiteProvider = new GroupSiteProvider({ pageContext: this._pageContext });
      let getGroupCreationContextPromise = this._groupSiteProvider.getGroupCreationContext();

      promises.push(groupPropertiesPromise);
      promises.push(getGroupCreationContextPromise);

      // need both group properties and creation context to construct the full classification state
      Promise.all([groupPropertiesPromise, getGroupCreationContextPromise] as any[]).done((values: [Group, IGroupCreationContext]) => {
        const group: Group = values[0];
        const creationContext: IGroupCreationContext = values[1];
        let selectedKey = undefined;

        let classificationOptions: IDropdownOption[] =
          // map classification options into dropdown options and mark as selected based on Group classification property
          (creationContext && creationContext.dataClassificationOptions) ?
            creationContext.dataClassificationOptions.map((classification: string) => {
              if (classification === group.classification) {
                selectedKey = classification;
              }

              return <IDropdownOption>{
                key: classification,
                text: classification
              };
            }) : [];

        // ensure there is always one option selected at all times
        if (selectedKey === undefined && classificationOptions.length > 0) {
          // no selection found so default to the first option
          selectedKey = classificationOptions[0].key;
        }

        this.setState({
          classificationOptions: classificationOptions,
          classificationSelectedKey: selectedKey,
          usageGuidelinesUrl: (creationContext && creationContext.usageGuidelineUrl) || undefined
        });
      });
    } else {
      this._webDataSource = new WebDataSource(this._pageContext);
      const getWebPropsPromise = this._webDataSource.getBasicWebProperties(true /*bypassCache*/);

      getWebPropsPromise.done((value: IWeb) => {
        this.setState({
          description: value.description,
          name: value.title
        });
      });

      promises.push(getWebPropsPromise);
    }

    // wait until all loading Promises are satisified, then disable the loading spinner
    Promise.all(promises).done(() => {
      this.setState({ isLoading: false });
    });
  }

  public componentWillUnmount() {
    if (this._eventGroup) {
      this._eventGroup.dispose();
      this._eventGroup = null;
    }
  }

  public getRenderProps(): ISiteSettingsPanelProps {
    const params = this._params;
    const state = params.siteSettingsPanelContainer.state;

    return {
      name: state ? state.name : '',
      description: state ? state.description : '',
      privacyOptions: state ? state.privacyOptions : [],
      privacySelectedKey: state ? state.privacySelectedKey : '',
      classificationOptions: state ? state.classificationOptions : [],
      classificationSelectedKey: state ? state.classificationSelectedKey : '',
      showLoadingSpinner: state && typeof state.isLoading === 'boolean' ? state.isLoading : true,
      showImageBrowser: params.enableImagePicker && state && state.hasPictureUrl,
      errorMessage: state ? state.errorMessage : undefined,
      groupDeleteErrorMessage: state ? state.groupDeleteErrorMessage : undefined,
      classicSiteSettingsUrl:
      (this._pageContext && this._pageContext.webAbsoluteUrl) ?
        `${this._pageContext.webAbsoluteUrl}/_layouts/15/settings.aspx` :
        undefined,
      usageGuidelinesUrl: state ? state.usageGuidelinesUrl : undefined,
      emptyImageUrl: params.emptyImageUrl,

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
        closeButton: params.strings.closeButton,
        closeButtonAriaLabel: params.strings.closeButtonAriaLabel,
        classicSiteSettingsHelpText: params.strings.classicSiteSettingsHelpText,
        classicSiteSettingsLinkText: params.strings.classicSiteSettingsLinkText,
        usageGuidelinesLinkText: params.strings.usageGuidelinesLinkText,
        deleteGroupLinkText: params.strings.deleteGroupLinkText,
        deleteGroupConfirmationDialogText: params.strings.deleteGroupConfirmationDialogText,
        deleteGroupConfirmationDialogTitle: params.strings.deleteGroupConfirmationDialogTitle,
        deleteGroupConfirmationDialogCheckbox: params.strings.deleteGroupConfirmationDialogCheckbox,
        deleteGroupConfirmationDialogButtonDelete: params.strings.deleteGroupConfirmationDialogButtonDelete,
        deleteGroupConfirmationDialogButtonCancel: params.strings.deleteGroupConfirmationDialogButtonCancel,
        changeImageButton: params.strings.changeImageButton,
        removeImageButton: params.strings.removeImageButton
      },

      onDeleteGroup: this._onDeleteGroup,
      onDeleteGroupDismiss: this._onDeleteGroupDismiss,
      onSave: this._onSave
    };
  }

  private setState(state: ISiteSettingsPanelContainerState) {
    this._params.siteSettingsPanelContainer.setState(state);
  }

  // TODO: Use SuiteNavDataSource to get this url after msilver moves the SuiteNavDataSource to odsp-datasources (currently in odsp-next)
  private _getSharePointHomePageUrl(): string {
      const layoutString = '/_layouts/15/sharepoint.aspx';
      const webAbsoluteUrl = this._pageContext.webAbsoluteUrl;
      const webServerRelativeUrl = this._pageContext.webServerRelativeUrl;

      if (webAbsoluteUrl && webServerRelativeUrl) {
          return webAbsoluteUrl.replace(webServerRelativeUrl, '') + layoutString;
      } else {
          return undefined;
      }
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
        text: this._params.strings.privacyOptionPrivate
      },
      {
        key: PRIVACY_OPTION_PUBLIC,
        text: this._params.strings.privacyOptionPublic
      }
    ];
  }

  @autobind
  private _onDeleteGroup() {
    if (this._isGroup) {
      // clear any error message from previous attempts
      this.setState({ groupDeleteErrorMessage: null });

      const group = this._groupsProvider.group;

      this._groupsProvider.deleteGroup(group)
        .then(() => {
          window.location.href = this._getSharePointHomePageUrl();
        }, (error: any) => {
          if (error.status === 404) {
            // 404 errors are expected in case site was already deleted out from under us
            window.location.href = this._getSharePointHomePageUrl();
          } else {
            this.setState({ groupDeleteErrorMessage: error.message.value });
            throw error;
          }
        });
    }
  }

  @autobind
  private _onDeleteGroupDismiss() {
    // clear any error message from previous attempts
    this.setState({ groupDeleteErrorMessage: null });
  }

  @autobind
  private _onSave(name: string, description: string, privacy: IDropdownOption, classification: IDropdownOption, imageFile?: File) {
    // clear any error message from previous attempts
    this.setState({ errorMessage: null });

    if (this._isGroup) {
      const group = this._groupsProvider.group;

      group.name = name;
      group.description = description;
      group.isPublic = (privacy.key === PRIVACY_OPTION_PUBLIC);
      if (classification) {
        group.classification = classification.text;
      }

      this._groupsProvider.saveGroupProperties(group)
        .then(() => {
          if (imageFile !== undefined) {
            // null is valid (sets empty image)
            return this._groupsProvider.setGroupImage(imageFile)
          }
          return Promise.wrap<void>();
        })
        .then(() => this._groupsProvider.syncGroupProperties(), (error: any) => {
          this.setState({ errorMessage: error.message.value });
          throw error;
        })
        .then(() => window.location.reload());
    } else {
      const newWebProperties: IWeb = {
        description: description,
        title: name
      };

      this._webDataSource.setBasicWebProperties(newWebProperties).then(() => window.location.reload());
    }
  }
}