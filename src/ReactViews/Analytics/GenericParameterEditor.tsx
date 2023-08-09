import React from "react";

import Styles from "./parameter-editors.scss";
import FunctionParameter from "../../Models/FunctionParameters/FunctionParameter";
import { action, makeObservable } from "mobx";
import { observer } from "mobx-react";
import CommonStrata from "../../Models/Definition/CommonStrata";

@observer
export default class GenericParameterEditor extends React.Component<{
  parameter: FunctionParameter;
}> {
  constructor(props: { parameter: FunctionParameter }) {
    super(props);
    makeObservable(this);
  }

  @action
  onChange(e: React.ChangeEvent<HTMLInputElement>) {
    this.props.parameter.setValue(CommonStrata.user, e.target.value);
  }

  override render() {
    const value = (this.props.parameter.value || "") as string;
    return (
      <input
        className={Styles.field}
        type="text"
        onChange={this.onChange.bind(this)}
        value={value}
      />
    );
  }
}