import * as React from 'react';
import { autobind } from 'office-ui-fabric-react';
import { Panel, PanelType } from 'office-ui-fabric-react/lib/Panel';
import { FilterSelect }  from '../../components/FilterSelect/index';
import { IFilterSectionInfo } from '@ms/odsp-datasources/lib/models/smartFilters/FilterSectionType';
import * as ViewHelpers from '@ms/odsp-datasources/lib/models/view/ViewHelpers';
import { IFilterSelectPanelProps } from './FilterSelectPanel.Props';

export interface IFilterSelectPanelState {
  isOpen: boolean;
}

export class FilterSelectPanel extends React.Component<IFilterSelectPanelProps, IFilterSelectPanelState> {
  constructor(props: IFilterSelectPanelProps) {
    super(props);
    this.state = {
      isOpen: true
    };
  }

  public componentWillReceiveProps(nextProps: IFilterSelectPanelProps) {
    this.setState({ isOpen: true });
  }

  public render(): React.ReactElement<IFilterSelectPanelProps> {
    const { dependencies, columnSchema, getFilterSuggestions }: IFilterSelectPanelProps = this.props;
    const { listContext, pageContext, dataSource, strings } = dependencies;

    const filterSelectDeps = {
      getIconUrlFromExtension: (extension: string): string => { return ''; },
      dataSource: dataSource,
      pageContext: pageContext,
      currentView: listContext.viewResult
    };
    const viewParamsString: string = ViewHelpers.getEffectiveFilterParams(listContext.filterParams, listContext.viewResult);

    return (
      <Panel
        isOpen={ this.state.isOpen }
        type={ PanelType.smallFixedFar }
        >
        <FilterSelect
          dependencies={ filterSelectDeps }
          strings={ strings }
          viewParamsString={ viewParamsString }
          columnSchema={ columnSchema }
          onComplete={ this._onComplete }
          getFilterSuggestions={ getFilterSuggestions }
        />
      </Panel>
    );
  }

  @autobind
  private _onComplete(filterSectionInfo: IFilterSectionInfo): {} {
    if (this.props.onComplete) {
      this.props.onComplete(filterSectionInfo);
    }
    this.setState({ isOpen: false });
    return {};
  }
}