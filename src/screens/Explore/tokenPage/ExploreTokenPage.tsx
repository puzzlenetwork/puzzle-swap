import React from "react";
import Layout from "@components/Layout";
import Text from "@components/Text";
import SizedBox from "@components/SizedBox";
import { observer } from "mobx-react-lite";
import AggregatorHistory from "@screens/Explore/protocolPage/AggregatorHistory";
import ExploreLayout from "@screens/Explore/ExploreLayout";
import { useExploreVM } from "@screens/Explore/ExploreVm";
import { Navigate } from "react-router-dom";
import { ROUTES } from "@src/constants";
import { ReactComponent as ArrowBackIcon } from "@src/assets/icons/backArrow.svg";
import { Row } from "@src/components/Flex";
import BasicTokenInformation from "@screens/Explore/tokenPage/BasicTokenInformation";
import TokenStatistics from "@screens/Explore/tokenPage/TokenStatistics";

interface IProps {}

const ExploreTokenPage: React.FC<IProps> = () => {
  const vm = useExploreVM();
  const asset = vm.asset;
  if (asset == null) return <Navigate to={ROUTES.EXPLORE} />;

  return (
    <Layout>
      <ExploreLayout>
        <a href={ROUTES.EXPLORE}>
          <Row alignItems="center">
            <ArrowBackIcon />
            <Text weight={500} type="blue500">
              Back to token list
            </Text>
          </Row>
        </a>
        <SizedBox height={24} />
        <Text weight={500} size="large">
          {asset.name} ({asset.symbol})
        </Text>
        <SizedBox height={40} />
        <BasicTokenInformation />
        <SizedBox height={24} />
        <TokenStatistics />
        <SizedBox height={24} />
        <AggregatorHistory />
      </ExploreLayout>
    </Layout>
  );
};

export default observer(ExploreTokenPage);
