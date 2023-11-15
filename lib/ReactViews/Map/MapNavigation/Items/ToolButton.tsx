import { observer } from "mobx-react";
import Box from "../../../../Styled/Box";
import Icon from "../../../../Styled/Icon";
import MapIconButton from "../../../MapIconButton/MapIconButton";
import { ToolButtonController } from "../../../Tools/Tool";

interface ToolButtonProps {
  controller: ToolButtonController;
}

function ToolButton(props: ToolButtonProps) {
  const { controller } = props;

  return (
    <Box displayInlineBlock>
      <MapIconButton
        primary={controller.active}
        expandInPlace
        title={controller.title}
        onClick={() => controller.handleClick()}
        iconElement={() => <Icon glyph={controller.glyph} />}
        closeIconElement={() => <Icon glyph={Icon.GLYPHS.closeTool} />}
      >
        {controller.title}
      </MapIconButton>
    </Box>
  );
}

export default observer(ToolButton);
