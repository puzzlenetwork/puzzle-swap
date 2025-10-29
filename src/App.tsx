import React from "react";
import { Route, Routes } from "react-router-dom";
import styled from "@emotion/styled";
import { observer } from "mobx-react-lite";
import AddLiquidity from "@screens/Pools/AddLiquidity";
import PoolInvest from "@screens/Pools/PoolInvest";
import Header from "@components/Header";
import { Column } from "@components/Flex";
import NotFound from "@screens/NotFound";
import { useStores } from "@stores";
import PoolsList from "@screens/Pools/PoolsList";
import WithdrawLiquidity from "@screens/Pools/WithdrawLiquidity";
import Trade from "@screens/Trade";
import Stake from "@screens/Stake";
import StakingNew from "@screens/StakingNew";
import Ultrastake from "@screens/Ultrastake";
import PoolSwap from "@screens/Pools/PoolSwap";
import WalletModal from "@components/Wallet/WalletModal";
import SendAssetModal from "@components/Wallet/SendAssetModal";
import { ROUTES } from "./constants";
import CreatePool from "@screens/Pools/CreatePool";
import Explore from "@screens/Explore";
import ExploreToken from "@screens/ExploreToken";
import OldExplorer from "@screens/OldExplorer";
import PoolBoost from "@screens/Pools/PoolBoost";
import MobileNavBar from "@components/MobileNavBar";
import Landing from "@screens/Landing";
import Paper from "@screens/Paper";
import LoginScreen from "@screens/LoginScreen";
import { usePageTitle } from "./usePageTitle";
import RangesList from "@screens/Ranges/RangesList";
import RangeDetails from "@screens/Ranges/RangeDetails";
import DepositToRange from "@screens/Ranges/DepositToRange";
import WithdrawFromRange from "@screens/Ranges/WithdrawFromRange";
import CreateRange from "@screens/Ranges/CreateRange";
import TradeInRange from "@screens/Ranges/TradeInRange";
import { useAnalyticTracking } from "./hooks/useAnalyticTracking";
import { ReactNotifications } from 'react-notifications-component';
import 'react-notifications-component/dist/theme.css';

const Root = styled(Column)`
  width: 100%;
  align-items: center;
  background: ${({ theme }) => theme.colors.primary50};
  min-height: 100vh;
`;
const MobileSpace = styled.div`
  height: 56px;
  @media (min-width: 880px) {
    display: none;
  }
`;
const App: React.FC = () => {
  const { accountStore } = useStores();
  usePageTitle();
  useAnalyticTracking();
  return (
    <Root>
      <ReactNotifications />
      <LoginScreen />
      <Header />
      <Routes>
        {/* Landing */}
        <Route path={ROUTES.ROOT} element={<Landing />} />
        {/* 404 */}
        <Route path={ROUTES.NOT_FOUND} element={<NotFound />} />
        {/* Stake */}
        <Route path={ROUTES.STAKE} element={<Stake />} />
        <Route path={ROUTES.PZL} element={<StakingNew />} />
        <Route path={ROUTES.STAKING_NEW} element={<StakingNew />} />
        {/* Paper */}
        <Route path="/paper" element={<Paper />} />

        {/* Explore */}
        <Route path={ROUTES.OLD_EXPLORE} element={<OldExplorer />} />
        <Route path={ROUTES.EXPLORE} element={<Explore />} />
        <Route path={ROUTES.EXPLORE_TOKEN} element={<ExploreToken />} />

        {/* Swap routes */}
        <Route path={ROUTES.POOL_SWAP} element={<PoolSwap />} />

        {/* Trade */}
        <Route path={ROUTES.TRADE} element={<Trade />} />
        <Route path={ROUTES.LIMIT_ORDER} element={<Trade />} />

        {/* Pools table routes */}
        <Route path={ROUTES.POOLS} element={<PoolsList />} />

        {/* Invest pool info routes */}
        <Route path={ROUTES.POOLS_INVEST} element={<PoolInvest />} />

        {/* Boost pool Apy  */}
        <Route path={ROUTES.POOL_BOOST} element={<PoolBoost />} />

        {/* Add liquidity routes */}
        <Route path={ROUTES.POOLS_ADD_LIQUIDITY} element={<AddLiquidity />} />
        <Route path={ROUTES.POOLS_ADD_ONE_TOKEN} element={<AddLiquidity />} />

        {/* Withdraw liquidity routes */}
        <Route path={ROUTES.POOLS_WITHDRAW} element={<WithdrawLiquidity />} />

        <Route path={ROUTES.ULTRASTAKE} element={<Ultrastake />} />

        <Route path={ROUTES.POOLS_CREATE} element={<CreatePool />} />

        <Route path="*" element={<NotFound />} />

        {/*Ranges block*/}
        <Route path={ROUTES.RANGES} element={<RangesList />} />
        <Route path={ROUTES.RANGES_DETAILS} element={<RangeDetails />} />
        <Route path={ROUTES.RANGES_DEPOSIT} element={<DepositToRange />} />
        <Route path={ROUTES.RANGES_DEPOSIT_ONE_TOKEN} element={<DepositToRange />} />
        <Route path={ROUTES.RANGES_WITHDRAW} element={<WithdrawFromRange />} />
        <Route path={ROUTES.RANGES_CREATE} element={<CreateRange />} />
        <Route path={ROUTES.RANGES_TRADE} element={<TradeInRange />} />
      </Routes>
      <WalletModal onClose={() => accountStore.setWalletModalOpened(false)} visible={accountStore.walletModalOpened} />
      <SendAssetModal
        onClose={() => accountStore.setSendAssetModalOpened(false)}
        visible={accountStore.sendAssetModalOpened}
      />
      <MobileSpace />
      <MobileNavBar />
    </Root>
  );
};

export default observer(App);
