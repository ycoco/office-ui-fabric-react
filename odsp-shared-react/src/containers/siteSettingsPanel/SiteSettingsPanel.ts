// OneDrive:IgnoreCodeCoverage

import EventGroup from '@ms/odsp-utilities/lib/events/EventGroup';
import { ISpPageContext, isGroupWebContext, getServerUrl } from '@ms/odsp-datasources/lib/interfaces/ISpPageContext';
import Promise from '@ms/odsp-utilities/lib/async/Promise';
import { AcronymAndColorDataSource, IAcronymColor } from '@ms/odsp-datasources/lib/AcronymAndColor';
import { autobind } from 'office-ui-fabric-react/lib/Utilities';
import { Group, GroupsProvider, IGroupsProvider, SourceType } from '@ms/odsp-datasources/lib/Groups';
import { IGroupCreationContext } from '@ms/odsp-datasources/lib/GroupSite';
import { GroupSiteProvider, IGroupSiteProvider } from '@ms/odsp-datasources/lib/GroupSite';
import { IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { ISiteSettingsPanelContainerStateManagerParams, ISiteSettingsPanelContainerState } from './SiteSettingsPanel.Props';
import { SPListCollectionDataSource } from '@ms/odsp-datasources/lib/ListCollection';
import { ISiteSettingsPanelProps, ISiteSettingsPanelStrings, DepartmentDisplayType } from '../../components/SiteSettingsPanel';
import { ISpFile, IWeb, WebDataSource } from '@ms/odsp-datasources/lib/Web';
import { DepartmentDataSource, IDepartmentData } from '@ms/odsp-datasources/lib/Department';
import { createImageThumbnail } from '@ms/odsp-utilities/lib/images/ImageHelper';

const DEFAULT_LOGO_STRING: string = '_layouts/15/images/siteicon.png';
const PRIVACY_OPTION_PRIVATE = 'private';
const PRIVACY_OPTION_PUBLIC = 'public';

// align with Exchange mailbox user photo sizes, maximum is 648x648
const MAX_LOGO_WIDTH = 648;
const MAX_LOGO_HEIGHT = 648;

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
  private _spListCollectionDataSource: SPListCollectionDataSource;
  private _webDataSource: WebDataSource;
  private _departmentDataSource: DepartmentDataSource;
  private _initialDepartmentUrl: string;

  constructor(params: ISiteSettingsPanelContainerStateManagerParams) {
    this._params = params;
    this._pageContext = params.pageContext;
    this._isGroup = isGroupWebContext(this._pageContext);
  }

  public componentDidMount() {
    const params = this._params;
    const promises = [];

    this._spListCollectionDataSource = new SPListCollectionDataSource(this._pageContext);

    this._acronymDataSource = new AcronymAndColorDataSource(this._pageContext);
    let getAcronymDataPromise = this._acronymDataSource.getAcronymData(this._pageContext.webTitle);
    promises.push(getAcronymDataPromise);

    getAcronymDataPromise.done((value: IAcronymColor) => {
      this.setState({
        siteAcronym: value.acronym,
        siteLogoColor: this._isGroup ? this._pageContext.groupColor : value.color
      });
    });

    if (params.departmentDisplayType) {
      this._departmentDataSource = new DepartmentDataSource(this._pageContext);
      let departmentPromise = this._departmentDataSource.getDepartmentData();
      promises.push(departmentPromise);
      departmentPromise.done((data: IDepartmentData) => {
        if (data && data.url) {
          this._initialDepartmentUrl = data.url;
          this.setState({
            departmentUrl: data.url
          });
        }
      });
    }

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
          name: value.title,
          siteLogoUrl: value.siteLogoUrl,
          hasPictureUrl: true
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
    const state = params.siteSettingsPanelContainer.state || {};

    return {
      name: state.name || '',
      description: state.description || '',
      privacyOptions: state.privacyOptions || [],
      privacySelectedKey: state.privacySelectedKey || '',
      classificationOptions: state.classificationOptions || [],
      classificationSelectedKey: state.classificationSelectedKey || '',
      showLoadingSpinner: typeof state.isLoading === 'boolean' ? state.isLoading : true,
      showImageBrowser: params.enableImagePicker && state.hasPictureUrl,
      departmentDisplayType: params.departmentDisplayType,
      enableDelete: params.enableDelete,
      errorMessage: state.errorMessage,
      groupDeleteErrorMessage: state.groupDeleteErrorMessage,
      classicSiteSettingsUrl:
      (this._pageContext && this._pageContext.webAbsoluteUrl) ?
        `${this._pageContext.webAbsoluteUrl}/_layouts/15/settings.aspx` :
        undefined,
      usageGuidelinesUrl: state.usageGuidelinesUrl,
      emptyImageUrl: params.emptyImageUrl,
      departmentUrl: state.departmentUrl,

      siteLogo: {
        imageUrl: state.siteLogoUrl,
        acronym: state.siteAcronym,
        backgroundColor: state.siteLogoColor
      },

      strings: {
        // ISiteSettingsContainerStateManagerStrings has a couple extra strings, which shouldn't matter
        ...<ISiteSettingsPanelStrings>(params.strings)
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
    const deletePromise = this._isGroup ?
      this._groupsProvider.deleteGroup(this._groupsProvider.group) :
      this._webDataSource.delete();

    // clear any error message from previous attempts
    this.setState({ groupDeleteErrorMessage: null });

    deletePromise
      .then(() => {
        window.location.href = this._getSharePointHomePageUrl();
      }, (error: any) => {
        if (error.status === 404) {
          // 404 errors are expected in case site was already deleted out from under us
          window.location.href = this._getSharePointHomePageUrl();
        } else {
          this.setState({ groupDeleteErrorMessage: this._getErrorString(error) });
          throw error;
        }
      });
  }

  @autobind
  private _onDeleteGroupDismiss() {
    // clear any error message from previous attempts
    this.setState({ groupDeleteErrorMessage: null });
  }

  @autobind
  private _onSave(name: string, description: string, privacy: IDropdownOption, classification: IDropdownOption, imageFile?: File, departmentUrl?: string) {
    // clear any error message from previous attempts
    this.setState({ errorMessage: null });

    let shouldSaveDepartment = false;
    if (this._params.departmentDisplayType === DepartmentDisplayType.enabled) {
      // We should update the department if:
      // - there was previously a value and now there's not
      // - there's now a value, and it doesn't match the previous value (or was previously unset)
      departmentUrl = departmentUrl || '';
      let initialDepartmentUrl = this._initialDepartmentUrl;
      let shouldUnsetDepartment = initialDepartmentUrl && !departmentUrl;
      let shouldSetDepartment = departmentUrl && initialDepartmentUrl !== departmentUrl;
      shouldSaveDepartment = shouldUnsetDepartment || shouldSetDepartment;
    }

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
        .then(() => shouldSaveDepartment && this._departmentDataSource.setDepartmentByUrl(departmentUrl))
        .then(() => this._groupsProvider.syncGroupProperties(), (error: any) => {
          this.setState({ errorMessage: this._getErrorString(error) });
          throw error;
        })
        .then(() => window.location.reload());
    } else { // Site is not a Group site
      const newWebProperties: IWeb = {
        description: description,
        title: name
      };

      // if we're not setting a new logo then the properties are immediately available, otherwise will need
      // to defer setting properties until the logo upload is complete and the logo URL property is computed
      let getWebPropsPromise;

      if (imageFile) {
        // scale user image to maximum dimensions, then upload to site assets, then return the newly
        // uploaded file URL in the resulting web properties
        getWebPropsPromise =
          createImageThumbnail(imageFile, MAX_LOGO_WIDTH, MAX_LOGO_HEIGHT)
            .then((scaledImageBlob: Blob) => this._uploadSiteLogo('__sitelogo__' + imageFile.name, scaledImageBlob))
            .then((siteLogoFile: ISpFile) => {
              // append newly uploaded logo to web properties as an absolute URL
              newWebProperties.siteLogoUrl = getServerUrl(this._pageContext) + siteLogoFile.serverRelativeUrl;

              return Promise.wrap(newWebProperties);
            }, (error: any) => {
              // error caught while uploading new site logo
              this.setState({ errorMessage: this._getErrorString(error) });
              throw error;
            });
      } else {
        getWebPropsPromise = Promise.wrap(newWebProperties);
      }

      // once new properties values are resolved try to set them and then reload
      getWebPropsPromise
        .then((webProps) => this._webDataSource.setBasicWebProperties(webProps))
        .then(() => shouldSaveDepartment && this._departmentDataSource.setDepartmentByUrl(departmentUrl))
        .then(() => window.location.reload(), (error: any) => {
          // error caught while setting web properties
          this.setState({ errorMessage: this._getErrorString(error) });
          throw error;
        });
    }
  }

  private _getErrorString(error: any): string {
    // safely get error message if available
    if (error && error.message) {
      return error.message.value;
    }
    return undefined;
  }

  /**
   * Uploads the specified file to the web's "Site Assets" library, then returns the newly added ISpFile
   * @param imageFile Image blob to upload
   */
  private _uploadSiteLogo(imageFileName: string, imageBlob: Blob): Promise<ISpFile> {
    return this._spListCollectionDataSource.ensureSiteAssetsLibrary()
      .then((siteAssetList) =>
        this._webDataSource.addFileToWebList(siteAssetList.id, imageFileName, imageBlob, true /*overWrite*/)
      );
  }
}