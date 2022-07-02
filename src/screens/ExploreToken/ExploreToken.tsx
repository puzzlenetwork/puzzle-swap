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

interface IProps {}

const ExploreTokenImpl: React.FC<IProps> = () => {
  const vm = useExploreTokenVM();
  console.log(vm.asset);
  return (
    <Layout>
      <ExploreLayout>
        <Link to={ROUTES.EXPLORE}>
          <Row alignItems="center">
            <ArrowBackIcon />
            <Text weight={500} type="blue500">
              Back to token list
            </Text>
          </Row>
        </Link>
        <SizedBox height={24} />
        <Text weight={500} size="large">
          {vm.asset.name} ({vm.asset.symbol})
        </Text>
        <SizedBox height={40} />
        {/*<BasicTokenInformation />*/}
        {/*<SizedBox height={24} />*/}
        {/*<TokenStatistics />*/}
        {/*<SizedBox height={24} />*/}
        {/*<AggregatorHistory />*/}
      </ExploreLayout>
    </Layout>
  );
};

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
