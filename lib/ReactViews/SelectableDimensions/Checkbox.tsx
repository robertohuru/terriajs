import { runInAction } from "mobx";
import { useTranslation } from "react-i18next";
import CommonStrata from "../../Models/Definition/CommonStrata";
import { SelectableDimensionCheckbox as SelectableDimensionCheckboxModel } from "../../Models/SelectableDimensions/SelectableDimensions";
import Checkbox from "../../Styled/Checkbox";
import Text from "../../Styled/Text";
import { SelectableDimensionsProps as Dimension } from "./SelectableDimensionsProps";

export function SelectableDimensionCheckbox({
  id,
  dim
}: Dimension<SelectableDimensionCheckboxModel>) {
  const { t } = useTranslation();
  return (
    <Checkbox
      name={id}
      isChecked={dim.selectedId === "true"}
      onChange={(evt) =>
        runInAction(() =>
          dim.setDimensionValue(
            CommonStrata.user,
            evt.target.checked ? "true" : "false"
          )
        )
      }
    >
      <Text>
        {dim.options?.find((opt) => opt.id === dim.selectedId)?.name ??
          (dim.selectedId === "true"
            ? t("selectableDimensions.enabled")
            : t("selectableDimensions.disabled"))}
      </Text>
    </Checkbox>
  );
}
