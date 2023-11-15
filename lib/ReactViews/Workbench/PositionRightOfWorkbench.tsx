import { observer } from "mobx-react";
import { ReactNode } from "react";
import styled from "styled-components";
import ViewState from "../../ReactViewModels/ViewState";

type PositionRightOfWorkbenchProps = {
  viewState: ViewState;
  className?: string;
  children: ReactNode;
};

/**
 * A component that responsively positions its children right of the workbench.
 *
 * If the workbench is hidden it will smoothly transition the children to the left edge
 * of the screen. By default the container is position 120px from the top but
 * this can be overriden by further styling the component, eg:
 *
 *    const BottomLeft = styled(PositionRightOfWorkbenchProps)`
 *       top: unset;
 *       bottom: 90px;
 *    `;
 *
 */
const PositionRightOfWorkbench = observer(function PositionRightOfWorkbench(
  props: PositionRightOfWorkbenchProps
) {
  return (
    <Container
      className={props.className}
      isMapFullScreen={props.viewState.isMapFullScreen}
    >
      {props.children}
    </Container>
  );
});

const Container = styled.div<{ isMapFullScreen: boolean }>`
  position: absolute;
  top: 120px;
  left: 0;
  right: unset;
  bottom: unset;
  margin-left: ${(props) =>
    props.isMapFullScreen ? 16 : parseInt(props.theme.workbenchWidth) + 16}px};
  transition: margin-left 0.25s;
`;

export default PositionRightOfWorkbench;
