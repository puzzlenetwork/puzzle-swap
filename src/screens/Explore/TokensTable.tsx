import styled from "@emotion/styled";
import { observer } from "mobx-react-lite";
import React, { useMemo, useState } from "react";
import SearchTab from "./SearchTab";
import SizedBox from "@components/SizedBox";
import GridTable from "@components/GridTable";
import Card from "@components/Card";
import { IToken, TOKENS_BY_ASSET_ID } from "@src/constants";
import useWindowSize from "@src/hooks/useWindowSize";
import DesktopTokenTableRow from "./DesktopTokenTableRow";
import MobileTokenTableRow from "@screens/Explore/MobileTokenTableRow";
import { useStores } from "@stores";
import { tokenCategoriesEnum } from "@components/TokensSelectModal/TokenSelectModal";
import { useExploreVM } from "@screens/Explore/ExploreVm";
import BN from "@src/utils/BN";
import { Column } from "@src/components/Flex";
import Text from "@components/Text";
import { ReactComponent as NotFoundIcon } from "@src/assets/notFound.svg";

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
  const [filteredTokens, setFilteredTokens] = useState<IToken[]>([]);
  useMemo(() => {
    const data = vm.assetsWithStats
      .filter(({ name, symbol }) =>
        vm.tokenNameFilter
          ? [name, symbol]
              .map((v) => v.toLowerCase())
              .some((v) => v.includes(vm.tokenNameFilter.toLowerCase()))
          : true
      )
      .filter(({ category }) => {
        if (vm.tokenCategoryFilter === 0) return true;
        return category?.includes(tokenCategoriesEnum[vm.tokenCategoryFilter]);
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
      });
    setFilteredTokens(data);
  }, [
    accountStore.assetBalances,
    tokenStore.watchList,
    vm.assetsWithStats,
    vm.tokenCategoryFilter,
    vm.tokenNameFilter,
    vm.tokenUserFilter,
  ]);

  return (
    <Root>
      <SearchTab />
      <SizedBox height={24} />
      <Card
        style={{ padding: 0, overflow: "auto", maxWidth: "calc(100vw - 32px)" }}
        justifyContent="center"
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
          {filteredTokens.length === 0 && (
            <Column
              justifyContent="center"
              alignItems="center"
              crossAxisSize="max"
            >
              <SizedBox height={24} />
              <NotFoundIcon style={{ marginBottom: 24 }} />
              <Text type="secondary" className="text" textAlign="center">
                Unfortunately, there are no tokens that fit your filters.
              </Text>
              <SizedBox height={24} />
            </Column>
          )}
          {filteredTokens.map((t) => {
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
        </GridTable>
      </Card>
    </Root>
  );
};
export default observer(TokensTable);
