import React, { useEffect } from "react";
import Layout from "@components/Layout";
import { ExploreVMProvider, useExploreVM } from "./ExploreVm";
import ExploreProtocolPage from "@screens/Explore/protocolPage/ExploreProtocolPage";
import ExploreTokenPage from "@screens/Explore/tokenPage/ExploreTokenPage";
import { TOKENS_BY_SYMBOL } from "@src/constants";
import ExploreLayout from "@screens/Explore/ExploreLayout";
import Text from "@components/Text";
import SizedBox from "@components/SizedBox";
import TopTokens from "./TopTokens";

interface IProps {}

const ExploreImpl: React.FC<IProps> = () => {
  // const vm = useExploreVM();
  // const search = new URLSearchParams(window.location.search);
  // const assetId = search.get("assetId");
  // console.log(assetId);
  // useEffect(() => {
  //   vm.setAssetId(assetId ?? TOKENS_BY_SYMBOL.PUZZLE.assetId);
  // }, [assetId, vm]);
  return (
    <Layout>
      <ExploreLayout>
        <Text weight={500} size="large">
          Explore cryptocurrencies on Puzzle Swap
        </Text>
        <SizedBox height={8} />
        <Text>
          Learn more about the coins featured on Puzzle Swap: statistics, price
          charts and much more!
        </Text>
        <SizedBox height={24} />
        <TopTokens />
        {/*<BasicProtocolInformation />*/}
        {/*<SizedBox height={24} />*/}
        {/*<AggregatorHistory />*/}
        {/*<SizedBox height={24} />*/}
        {/*<MegaPoolsHistory />*/}
      </ExploreLayout>
      {/*{assetId != null ? <ExploreTokenPage /> : <ExploreProtocolPage />}*/}
    </Layout>
  );
};

const Explore: React.FC<IProps> = () => (
  <ExploreVMProvider>
    <ExploreImpl />
  </ExploreVMProvider>
);
export default Explore;
