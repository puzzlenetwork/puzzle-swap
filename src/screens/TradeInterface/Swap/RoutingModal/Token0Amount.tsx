import styled from "@emotion/styled";
import React from "react";
import SquareTokenIcon from "@components/SquareTokenIcon";
import SizedBox from "@components/SizedBox";
import { Column } from "@src/components/Flex";
import { ReactComponent as Arrow } from "@src/assets/icons/blackRightArrow.svg";
import tokenLogos from "@src/constants/tokenLogos";
import FilledText from "./FilledText";

interface IProps {
  imgSrc?: string;
  percent?: string;
  displayPercent?: boolean;
}

const Root = styled.div`
  display: flex;
  align-items: center;
  width: fit-content;
  flex-direction: row;
`;
const Token0Amount: React.FC<IProps> = ({
  percent,
  imgSrc,
  displayPercent,
}) => {
  return (
    <Root>
      <Column justifyContent="center" alignItems="center">
        <SquareTokenIcon
          size="small"
          alt="icon"
          src={imgSrc ?? tokenLogos.UNKNOWN}
        />
        {displayPercent && (
          <>
            <SizedBox height={8} />
            <FilledText style={{ width: 60 }}>{percent} %</FilledText>
          </>
        )}
      </Column>
      <SizedBox width={21} />
      <Arrow style={{ fill: "black" }} />
    </Root>
  );
};
export default Token0Amount;
