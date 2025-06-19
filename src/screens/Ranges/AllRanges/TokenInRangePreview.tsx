import Card from "@src/components/Card";
import { Column, Row } from "@src/components/Flex";
import SizedBox from "@src/components/SizedBox";
import ArrowWithSuperText from "./ArrowWithSuperText";
import Text from "@src/components/Text";
import styled from "@emotion/styled";
import { RangeAsset } from "@src/entities/Range";
import Img from "@src/components/Img";
import { TOKENS_BY_ASSET_ID } from "@src/constants";
import Tooltip from "@src/components/Tooltip";
import { useTheme } from "@emotion/react";

interface IParams {
  asset: RangeAsset;
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
        return theme.colors.primary100;
      case "secondary":
        return theme.colors.primary50;
      case "error":
        return theme.colors.error100;
      default:
        return theme.colors.primary50;
    }
  }};
`

const TokenInRangePreview = ({ asset, isBase, ...rest }: IParams & React.HTMLAttributes<HTMLDivElement>) => {
  const theme = useTheme();
  if (isBase) {
    return (
      <LocalCard kind="primary" {...rest}>
        <Text>{asset.name}</Text>
        <SizedBox height={12} />
        <Text type="secondary" size="small" weight={500}>Base</Text>
      </LocalCard>
    )
  }

  const isPriceValid = (asset.currentPrice.lte(asset.maxPrice) && asset.currentPrice.gte(asset.minPrice));

  return (
    <LocalCard kind={isPriceValid ? "secondary" : "error"} {...rest}>
      <Text type={isPriceValid ? "primary" : "error"}>{asset.name}</Text>
      <SizedBox height={12} />
      <Row alignItems="center">
        <Text type={isPriceValid ? "secondary" : "error"} size="small" weight={500}>{asset.minPrice.toSmallFormat()}</Text>
        <SizedBox width={4} />
        <ArrowWithSuperText color={ isPriceValid ? theme.colors.primary650 : theme.colors.error500 }>
          <Text type={isPriceValid ? "secondary" : "error"} size="small" weight={500}>{asset.currentPrice.toSmallFormat()}</Text>
        </ArrowWithSuperText>
        <SizedBox width={4} />
        <Text type={isPriceValid ? "secondary" : "error"} size="small" weight={500}>{asset.maxPrice.toSmallFormat()}</Text>
      </Row>
    </LocalCard>
  )
}

interface IWrapperParams {
  asset: RangeAsset;
  baseToken?: RangeAsset;
}

const TokenInRangePreviewWrapper = ({ asset, baseToken, ...rest }: IWrapperParams & React.HTMLAttributes<HTMLDivElement>) => {
  const isBase = asset.assetId === baseToken?.assetId;
  return isBase ? (
    <TokenInRangePreview asset={asset} isBase={true} {...rest} />
  ) : (
    <Tooltip config={{ placement: "top" }} content={(
      <Column>
        <Row alignItems="center">
          <Img src={TOKENS_BY_ASSET_ID[asset.assetId]?.logo} alt={asset.name} width="20px" height="20px" style={{ borderRadius: "10px" }} />
          <SizedBox width={6} />
          <Text>{asset.name}</Text>
        </Row>
        <SizedBox height={8} />
        <Row>
          <Text type="secondary" size="small" weight={500} nowrap>Current Price:</Text>
          <SizedBox width={4} />
          <Text size="small" fitContent weight={500} nowrap>{asset.currentPrice.toSmallFormat()} {baseToken?.name}</Text>
        </Row>
        <Row alignItems="center">
          <Text type="secondary" size="small" weight={500} nowrap>Range:</Text>
          <SizedBox width={40} />
          <Text size="small" weight={500} nowrap>{asset.minPrice.toSmallFormat()} {baseToken?.name} <div style={{ display: "inline", fontSize: "1.4rem" }}>⟷</div> {asset.maxPrice.toSmallFormat()} {baseToken?.name}</Text>
        </Row>
      </Column>
    )}>
      <TokenInRangePreview asset={asset} isBase={false} {...rest} />
    </Tooltip>
  );
}

export default TokenInRangePreviewWrapper;
