import React from "react";
import Layout from "@components/Layout";
import ExploreLayout from "@screens/Explore/ExploreLayout";
import Text from "@components/Text";
import SizedBox from "@components/SizedBox";
import {
  ExploreTokenVMProvider,
  useExploreTokenVM,
} from "@screens/ExploreToken/ExploreTokenVm";
import { Link, Navigate, useParams } from "react-router-dom";
import { ROUTES, TOKENS_BY_ASSET_ID } from "@src/constants";
import { Row } from "@components/Flex";
import { ReactComponent as ArrowBackIcon } from "@src/assets/icons/backArrow.svg";
import ExploreTokenBasicInformation from "@screens/ExploreToken/ExploreTokenBasicInformation";
import styled from "@emotion/styled";
import RoundTokenIcon from "@components/RoundTokenIcon";
import { ReactComponent as StarIcon } from "@src/assets/icons/star.svg";
import { ReactComponent as ShareIcon } from "@src/assets/icons/share.svg";
import IconButtonAdaptive from "@screens/ExploreToken/IconButtonAdaptive";
import { observer } from "mobx-react-lite";

interface IProps {}

const TokenTitle = styled(Text)`
  @media (min-width: 880px) {
    font-size: 24px;
    line-height: 32px;
  }
`;

const ButtonWrapper = styled(Row)`
  & > :first-of-type {
    margin-right: 16px;
  }
  @media (min-width: 880px) {
    & > :first-of-type {
      margin-right: 8px;
    }
  }
`;

const PriceTitle = styled(Text)`
  white-space: nowrap;
  font-weight: 500;
  font-size: 24px;
  line-height: 20px;
  @media (min-width: 880px) {
    line-height: 24px;
    font-size: 32px;
  }
`;

const ExploreTokenImpl: React.FC<IProps> = observer(() => {
  const vm = useExploreTokenVM();
  return (
    <Layout>
      <ExploreLayout>
        <Link to={ROUTES.EXPLORE}>
          <Row alignItems="center">
            <ArrowBackIcon />
            <Text weight={500} type="blue500">
              Back to Explore
            </Text>
          </Row>
        </Link>
        <SizedBox height={24} />
        <Row alignItems="center" justifyContent="space-between">
          <Row alignItems="center" mainAxisSize="fit-content">
            <RoundTokenIcon src={vm.asset.logo} alt={vm.asset.symbol} />
            <SizedBox width={8} />
            <TokenTitle weight={500}>
              {vm.asset.name}&nbsp;
              <span style={{ color: "#8082C5" }}>{vm.asset.symbol}</span>
            </TokenTitle>
          </Row>
          <ButtonWrapper mainAxisSize="fit-content">
            <IconButtonAdaptive icon={<StarIcon />}>
              Add to watchlist
            </IconButtonAdaptive>
            <IconButtonAdaptive icon={<ShareIcon />}>Share</IconButtonAdaptive>
          </ButtonWrapper>
        </Row>
        <SizedBox height={8} />
        <Row alignItems="end" mainAxisSize="fit-content">
          <PriceTitle size="large">
            $ {vm.statistics?.currentPrice.toFormat(2) ?? ""}&nbsp;
          </PriceTitle>
          <Text
            style={{ lineHeight: "16px", whiteSpace: "nowrap" }}
            type={vm.statistics?.change24H.gte(0) ? "success" : "error"}
          >
            {vm.statistics?.changeStr ?? ""}
          </Text>
        </Row>
        <SizedBox height={24} />
        <ExploreTokenBasicInformation />
      </ExploreLayout>
    </Layout>
  );
});

const ExploreToken: React.FC<IProps> = () => {
  const { assetId } = useParams<{ assetId: string }>();
  if (assetId == null || !Object.keys(TOKENS_BY_ASSET_ID).includes(assetId)) {
    return <Navigate to={ROUTES.EXPLORE} />;
  }
  return (
    <ExploreTokenVMProvider assetId={assetId}>
      <ExploreTokenImpl />
    </ExploreTokenVMProvider>
  );
};

export default ExploreToken;
