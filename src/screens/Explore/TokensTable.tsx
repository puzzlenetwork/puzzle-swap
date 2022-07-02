import styled from "@emotion/styled";
import { observer } from "mobx-react-lite";
import React from "react";
import SearchTab from "./SearchTab";
import SizedBox from "@components/SizedBox";
import GridTable from "@components/GridTable";
import Card from "@components/Card";
import { TOKENS_BY_ASSET_ID, TOKENS_LIST } from "@src/constants";
import useWindowSize from "@src/hooks/useWindowSize";
import DesktopTokenTableRow from "./DesktopTokenTableRow";
import MobileTokenTableRow from "@screens/Explore/MobileTokenTableRow";
import { useStores } from "@stores";
import { tokenCategoriesEnum } from "@components/TokensSelectModal/TokenSelectModal";
import { useExploreVM } from "@screens/Explore/ExploreVm";
import BN from "@src/utils/BN";
import { AdaptiveRow, Row } from "@src/components/Flex";

interface IProps {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
`;

const TokensTable: React.FC<IProps> = () => {
  const { tokenStore, accountStore, notificationStore, poolsStore } =
    useStores();
  const { width } = useWindowSize();
  const vm = useExploreVM();
  const handleWatchListChange = (assetId: string) => {
    const watchListText =
      'Keep track of your favorite coins by turning on the "Watchlist" filter above the table';
    if (accountStore.address == null) {
      //todo change to dialog notification
      notificationStore.notify(
        "Connect your wallet to add tokens to the watchlist",
        { type: "error" }
      );
    }
    const tokenStatus = tokenStore.watchList.includes(assetId);
    if (tokenStatus) {
      tokenStore.removeFromWatchList(assetId);
      notificationStore.notify(watchListText, {
        type: "info",
        title: `${TOKENS_BY_ASSET_ID[assetId].symbol} has been removed to the watchlist`,
      });
    } else {
      tokenStore.addToWatchList(assetId);
      notificationStore.notify(watchListText, {
        type: "success",
        title: `${TOKENS_BY_ASSET_ID[assetId].symbol} has been added to the watchlist`,
      });
    }
  };
  // const [displayedTokens, setDisplayedTokens] = useState(10);
  return (
    <Root>
      <SearchTab />
      <SizedBox height={24} />
      <Card
        style={{ padding: 0, overflow: "auto", maxWidth: "calc(100vw - 32px)" }}
      >
        <GridTable
          style={{ width: "fit-content", minWidth: "100%" }}
          desktopTemplate={"2fr 1fr 1fr 1fr 1fr "}
          mobileTemplate={"2fr 1fr"}
        >
          {width && width >= 880 && (
            <div className="gridTitle">
              <div>Token name</div>
              <div>Price</div>
              <div>Change (24h)</div>
              <div>Volume (24h)</div>
            </div>
          )}
          {vm.assetsWithStats
            .filter(({ name, symbol }) =>
              vm.tokenNameFilter
                ? [name, symbol]
                    .map((v) => v.toLowerCase())
                    .some((v) => v.includes(vm.tokenNameFilter.toLowerCase()))
                : true
            )
            .filter(({ category }) => {
              if (vm.tokenCategoryFilter === 0) return true;
              return category?.includes(
                tokenCategoriesEnum[vm.tokenCategoryFilter]
              );
            })
            .filter(({ assetId, symbol }) => {
              if (vm.tokenUserFilter === 0) return true;
              if (vm.tokenUserFilter === 1) {
                return tokenStore.watchList.includes(assetId);
              }
              if (vm.tokenUserFilter === 2) {
                return accountStore.assetBalances
                  ?.filter((v) => v.balance?.gt(0))
                  ?.map((v) => v.assetId)
                  .includes(assetId);
              }
              return true;
            })
            .map((t) => {
              const rate = poolsStore.usdnRate(t.assetId, 1) ?? BN.ZERO;
              const stats = tokenStore.statisticsByAssetId[t.assetId];
              return width && width >= 880 ? (
                <DesktopTokenTableRow
                  token={t}
                  change={stats?.change24H}
                  vol24={stats?.volume24}
                  fav={tokenStore.watchList.includes(t.assetId)}
                  key={t.assetId}
                  rate={rate}
                  handleWatchListChange={handleWatchListChange}
                />
              ) : (
                <MobileTokenTableRow
                  token={t}
                  change={stats?.change24H}
                  fav={tokenStore.watchList.includes(t.assetId)}
                  key={t.assetId}
                  rate={rate}
                  handleWatchListChange={handleWatchListChange}
                />
              );
            })}
          <SizedBox height={16} />
          {/*{TOKENS_LIST.length !== displayedTokens && (*/}
          {/*  <Text*/}
          {/*    type="secondary"*/}
          {/*    weight={500}*/}
          {/*    textAlign="center"*/}
          {/*    style={{ cursor: "pointer" }}*/}
          {/*    onClick={() => setDisplayedTokens(displayedTokens + 10)}*/}
          {/*  >*/}
          {/*    Load more*/}
          {/*  </Text>*/}
          {/*)}*/}
          <SizedBox height={16} />
        </GridTable>
      </Card>
    </Root>
  );
};
export default observer(TokensTable);
