import Card from "@src/components/Card";
import { Column, Row } from "@src/components/Flex";
import SizedBox from "@src/components/SizedBox";
import ArrowWithSuperText from "@components/ArrowWithSuperText";
import Text from "@src/components/Text";
import styled from "@emotion/styled";
import Img from "@src/components/Img";
import { TOKENS_BY_ASSET_ID } from "@src/constants";
import Tooltip from "@src/components/Tooltip";
import { useTheme } from "@emotion/react";
import { observer } from "mobx-react-lite";
import { IRangeToken } from "../../CreateRangeVm";
import BN from "@src/utils/BN";

interface IParams {
  asset: IRangeToken;
  isBase?: boolean;
}

type TCardType = "primary" | "secondary" | "error";

const LocalCard = styled(Card)<{ kind?: TCardType }>`
  border: none;
  width: fit-content;
  padding: 12px 8px !important;
  border-radius: 6px;
  background: ${({ theme, kind }) => {
    switch (kind) {
      case "primary":
        return theme.colors.primary200;
      case "secondary":
        return theme.colors.primary100;
      case "error":
        return theme.colors.error100;
      default:
        return theme.colors.primary50;
    }
  }};
`;

const TokenInRangePreview = ({ asset, isBase, ...rest }: IParams & React.HTMLAttributes<HTMLDivElement>) => {
  const theme = useTheme();
  if (isBase) {
    return (
      <LocalCard kind="primary" {...rest}>
        <Row>
          <Text ellipsis={70}>{asset.asset.symbol}</Text>
          <SizedBox width={8} />
          <Text fitContent style={{ marginLeft: "auto" }}>
            {asset.share.div(10).toNumber()}%
          </Text>
        </Row>
        <SizedBox height={12} />
        <Text type="secondary" size="small" weight={500}>
          Base
        </Text>
      </LocalCard>
    );
  }

  const isPriceValid = asset.initialPrice?.lte(asset.maxPrice ?? 0) && asset.initialPrice?.gte(asset.minPrice ?? 0);

  return (
    <LocalCard kind={isPriceValid ? "secondary" : "error"} {...rest}>
      <Row>
        <Text type={isPriceValid ? "primary" : "error"} ellipsis={70}>
          {asset.asset.symbol}
        </Text>
        <SizedBox width={8} />
        <Text type={isPriceValid ? "primary" : "error"} fitContent style={{ marginLeft: "auto" }}>
          {asset.share.div(10).toNumber()}%
        </Text>
      </Row>
      <SizedBox height={12} />
      <Row alignItems="center">
        <Text type={isPriceValid ? "secondary" : "error"} size="small" weight={500}>{`${BN.formatUnits(
          asset.minPrice ?? 0,
          asset.asset.decimals
        ).toSmallFormat()}`}</Text>
        <SizedBox width={4} />
        <ArrowWithSuperText color={isPriceValid ? theme.colors.primary650 : theme.colors.error500}>
          <Text type={isPriceValid ? "secondary" : "error"} size="small" weight={500}>{`${BN.formatUnits(
            asset.initialPrice ?? 0,
            asset.asset.decimals
          ).toSmallFormat()}`}</Text>
        </ArrowWithSuperText>
        <SizedBox width={4} />
        <Text type={isPriceValid ? "secondary" : "error"} size="small" weight={500}>{`${BN.formatUnits(
          asset.maxPrice ?? 0,
          asset.asset.decimals
        ).toSmallFormat()}`}</Text>
      </Row>
    </LocalCard>
  );
};

interface IWrapperParams {
  asset: IRangeToken;
  isBaseToken?: boolean;
}

const TokenInRangePreviewWrapper = ({
  asset,
  isBaseToken,
  ...rest
}: IWrapperParams & React.HTMLAttributes<HTMLDivElement>) => {
  return isBaseToken ? (
    <TokenInRangePreview asset={asset} isBase={true} {...rest} />
  ) : (
    <Tooltip
      config={{ placement: "top" }}
      content={
        <Column>
          <Row alignItems="center">
            <Img
              src={TOKENS_BY_ASSET_ID[asset.asset.assetId]?.logo}
              alt={asset.asset.name}
              width="20px"
              height="20px"
              style={{ borderRadius: "10px" }}
            />
            <SizedBox width={6} />
            <Text>{asset.asset.name}</Text>
          </Row>
          <SizedBox height={8} />
          <Row>
            <Text type="secondary" size="small" weight={500} nowrap>
              Share in range:
            </Text>
            <SizedBox width={4} />
            <Text size="small" fitContent weight={500} nowrap>{`${asset.share.div(10).toNumber()}%`}</Text>
          </Row>
          <SizedBox height={4} />
          <Row>
            <Text type="secondary" size="small" weight={500} nowrap>
              Current Price:
            </Text>
            <SizedBox width={4} />
            <Text size="small" fitContent weight={500} nowrap>{`${BN.formatUnits(
              asset.initialPrice ?? 0,
              asset.asset.decimals
            ).toSmallFormat()}`}</Text>
          </Row>
          <Row alignItems="center">
            <Text type="secondary" size="small" weight={500} nowrap>
              Range:
            </Text>
            <SizedBox width={40} />
            <Text size="small" weight={500} nowrap>
              {`${BN.formatUnits(asset.minPrice ?? 0, asset.asset.decimals).toSmallFormat()}`}{" "}
              <div style={{ display: "inline", fontSize: "1.4rem" }}>⟷</div>{" "}
              {`${BN.formatUnits(asset.maxPrice ?? 0, asset.asset.decimals).toSmallFormat()}`}
            </Text>
          </Row>
        </Column>
      }
    >
      <TokenInRangePreview asset={asset} isBase={false} {...rest} />
    </Tooltip>
  );
};

export default observer(TokenInRangePreviewWrapper);
