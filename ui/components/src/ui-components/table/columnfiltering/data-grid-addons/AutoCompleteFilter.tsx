/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

/*---------------------------------------------------------------------------------------------
* This code has been adapted from
* [react-data-grid-addons](https://github.com/adazzle/react-data-grid/tree/master/packages/react-data-grid-addons).
*--------------------------------------------------------------------------------------------*/

import "react-select/dist/react-select.css";
import * as _ from "lodash";
import React from "react";
import Select from "react-select";
import { UiComponents } from "../../../UiComponents";
import { ReactDataGridColumn } from "../../component/TableColumn";
import { TableDistinctValue } from "../../TableDataProvider";

/** @internal */
export interface AutoCompleteFilterProps {
  onChange: (args: { filterTerm: any; column: ReactDataGridColumn; }) => void;
  column: ReactDataGridColumn;
  getValidFilterValues: (key: string) => any[];
  multiSelection?: boolean;
  placeholder?: string;
}

interface AutoCompleteFilterState {
  options: TableDistinctValue[];
  filters?: any;
}

/** @internal */
/* istanbul ignore next */
export class AutoCompleteFilter extends React.Component<AutoCompleteFilterProps, AutoCompleteFilterState> {
  private _placeholder = UiComponents.translate("button.label.search");

  constructor(props: AutoCompleteFilterProps) {
    super(props);

    this.state = {
      options: this._getOptions(),
    };
  }

  public componentDidUpdate(props: AutoCompleteFilterProps) {
    const options = this._getOptions(props);
    if (!_.isEqual(options, this.state.options))
      this.setState({ options });
  }

  private _getOptions = (newProps?: AutoCompleteFilterProps): TableDistinctValue[] => {
    const props = newProps || this.props;
    let options = props.getValidFilterValues(props.column.key);
    options = options.map((o: any) => {
      if (typeof o === "string") {
        return { value: o, label: o };
      }
      return o;
    });
    return options;
  }

  private _handleChange = (value: any): void => {
    const filters = value;
    this.setState({ filters });
    this.props.onChange({ filterTerm: filters, column: this.props.column });
  }

  public render() {
    return (
      <Select
        autosize={false}
        name={`filter-${this.props.column.key}`}
        options={this.state.options}
        placeholder={this.props.placeholder || this._placeholder}
        onChange={this._handleChange}
        escapeClearsValue={true}
        multi={this.props.multiSelection !== undefined && this.props.multiSelection !== null ? this.props.multiSelection : true}
        value={this.state.filters} />
    );
  }
}
