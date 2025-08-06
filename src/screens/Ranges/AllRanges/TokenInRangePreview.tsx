import Card from "@components/Card";
import { Column, Row } from "@components/Flex";
import SizedBox from "@components/SizedBox";
import ArrowWithSuperText from "@components/ArrowWithSuperText";
import Text from "@components/Text";
import styled from "@emotion/styled";
import { RangeAsset } from "@src/entities/Range";
import Img from "@components/Img";
import { TOKENS_BY_ASSET_ID } from "@src/constants";
import Tooltip from "@components/Tooltip";
import { useTheme } from "@emotion/react";
import { observer } from "mobx-react-lite";

interface IParams {
  asset: RangeAsset;
  isBase?: boolean;
  showInUsd?: boolean;
}

type TCardType = "primary" | "secondary" | "error";

export const TokenCard = styled(Card)<{ kind?: TCardType }>`
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
`

const TokenInRangePreview = ({ asset, isBase, showInUsd, ...rest }: IParams & React.HTMLAttributes<HTMLDivElement>) => {
  const theme = useTheme();
  if (isBase) {
    return (
      <TokenCard kind="primary" {...rest}>
        <Row>
          <Text>{asset.name}</Text>
          <SizedBox width={12}/>
          <Text fitContent>{asset.share.toNumber()}%</Text>
        </Row>
        <SizedBox height={12} />
        <Text type="secondary" size="small" weight={500}>Base</Text>
      </TokenCard>
    )
  }

  const isPriceValid = (asset.currentPrice.lte(asset.maxPrice) && asset.currentPrice.gte(asset.minPrice));

  const minPrice = (
    showInUsd
      ? `$${asset.minPriceUsd.toSmallFormat()}`
      : `${asset.minPrice.toSmallFormat()}`
  );
  const currentPrice = (
    showInUsd
      ? `$${asset.currentPriceUsd.toSmallFormat()}`
      : `${asset.currentPrice.toSmallFormat()}`
  );
  const maxPrice = (
    showInUsd
      ? (asset.maxPriceUsd.isFinite() ? `$${asset.maxPriceUsd.toSmallFormat()}` : "∞")
      : (asset.maxPrice.isFinite() ? `${asset.maxPrice.toSmallFormat()}` : "∞")
  );

  return (
    <TokenCard kind={isPriceValid ? "secondary" : "error"} {...rest}>
      <Row>
        <Text type={isPriceValid ? "primary" : "error"}>{asset.name}</Text>
        <SizedBox width={12}/>
        <Text type={isPriceValid ? "primary" : "error"} fitContent>{asset.share.toNumber()}%</Text>
      </Row>
      <SizedBox height={12} />
      <Row alignItems="center" justifyContent="start">
        <Text fitContent type={isPriceValid ? "secondary" : "error"} size="small" weight={500}>{
          minPrice
        }</Text>
        <SizedBox width={4} />
        <ArrowWithSuperText color={ isPriceValid ? theme.colors.primary650 : theme.colors.error500 }>
          <Text fitContent type={isPriceValid ? "secondary" : "error"} size="small" weight={500}>{
            currentPrice
          }</Text>
        </ArrowWithSuperText>
        <SizedBox width={4} />
        <Text fitContent type={isPriceValid ? "secondary" : "error"} size="small" weight={500}>{
          maxPrice
        }</Text>
      </Row>
    </TokenCard>
  )
}

interface IWrapperParams {
  asset: RangeAsset;
  baseToken?: RangeAsset;
  showInUsd?: boolean;
}

const TokenInRangePreviewWrapper = ({ asset, baseToken, showInUsd, ...rest }: IWrapperParams & React.HTMLAttributes<HTMLDivElement>) => {
  const isBase = asset.assetId === baseToken?.assetId;

  const minPrice = (
    showInUsd
      ? `$${asset.minPriceUsd.toSmallFormat()}`
      : `${asset.minPrice.toSmallFormat()} ${baseToken?.name}`
  );
  const currentPrice = (
    showInUsd
      ? `$${asset.currentPriceUsd.toSmallFormat()}`
      : `${asset.currentPrice.toSmallFormat()} ${baseToken?.name}`
  );
  const maxPrice = (
    showInUsd
      ? (asset.maxPriceUsd.isFinite() ? `$${asset.maxPriceUsd.toSmallFormat()}` : "∞")
      : (asset.maxPrice.isFinite() ? `${asset.maxPrice.toSmallFormat()} ${baseToken?.name}` : "∞")
  );

  return isBase ? (
    <TokenInRangePreview asset={asset} isBase={true} showInUsd={showInUsd} {...rest} />
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
            <Text size="small" fitContent weight={500} nowrap>{
              currentPrice
            }</Text>
        </Row>
        <Row alignItems="center">
          <Text type="secondary" size="small" weight={500} nowrap>Range:</Text>
          <SizedBox width={40} />
            <Text size="small" weight={500} nowrap>{
              minPrice
            } <span style={{ display: "inline", fontSize: "1.4rem" }}>⟷</span> {
              maxPrice
            }</Text>
        </Row>
      </Column>
    )}>
      <TokenInRangePreview asset={asset} isBase={false} showInUsd={showInUsd} {...rest} />
    </Tooltip>
  );
}

export default observer(TokenInRangePreviewWrapper);
