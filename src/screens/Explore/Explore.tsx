import React, { useEffect } from "react";
import Layout from "@components/Layout";
import { ExploreVMProvider, useExploreVM } from "./ExploreVm";
import ExploreProtocolPage from "@screens/Explore/protocolPage/ExploreProtocolPage";
import ExploreTokenPage from "@screens/Explore/tokenPage/ExploreTokenPage";
import { TOKENS_BY_SYMBOL } from "@src/constants";

interface IProps {}

// const Subtitle = styled(Text)`
//   @media (min-width: 880px) {
//     max-width: 560px;
//   }
// `;
const ExploreImpl: React.FC<IProps> = () => {
  const vm = useExploreVM();
  const search = new URLSearchParams(window.location.search);
  const assetId = search.get("assetId");
  console.log(assetId);
  useEffect(() => {
    vm.setAssetId(assetId ?? TOKENS_BY_SYMBOL.PUZZLE.assetId);
  }, [assetId, vm]);
  return (
    <Layout>
      {assetId != null ? <ExploreTokenPage /> : <ExploreProtocolPage />}
    </Layout>
  );
};

const Explore: React.FC<IProps> = () => (
  <ExploreVMProvider>
    <ExploreImpl />
  </ExploreVMProvider>
);
export default Explore;
