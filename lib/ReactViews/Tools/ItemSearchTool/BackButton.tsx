import * as React from "react";
import { useTheme } from "styled-components";
import { BoxSpan } from "../../../Styled/Box";
import Button from "../../../Styled/Button";
import { GLYPHS, StyledIcon } from "../../../Styled/Icon";
import { TextSpan } from "../../../Styled/Text";

const BackButton: React.FC<{ onClick: () => void }> = ({
  children,
  onClick
}) => {
  const theme = useTheme();
  return (
    <Button
      css={`
        color: ${theme.textLight};
        border-color: ${theme.textLight};
        margin: 2em 0 1em 0;
      `}
      transparentBg
      onClick={onClick}
    >
      <BoxSpan centered>
        <StyledIcon
          css="transform:rotate(90deg);"
          light
          styledWidth="16px"
          glyph={GLYPHS.arrowDown}
        />
        <TextSpan noFontSize>{children}</TextSpan>
      </BoxSpan>
    </Button>
  );
};

export default BackButton;
