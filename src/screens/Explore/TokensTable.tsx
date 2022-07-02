import styled from "@emotion/styled";
import { observer } from "mobx-react-lite";
import React, { useState } from "react";
import SearchTab from "./SearchTab";
import SizedBox from "@components/SizedBox";
import Text from "@components/Text";
import GridTable from "@components/GridTable";
import Card from "@components/Card";
import { TOKENS_BY_ASSET_ID, TOKENS_LIST } from "@src/constants";
import useWindowSize from "@src/hooks/useWindowSize";
import DesktopTokenTableRow from "./DesktopTokenTableRow";
import MobileTokenTableRow from "@screens/Explore/MobileTokenTableRow";
import { useStores } from "@stores";

interface IProps {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
`;

const TokensTable: React.FC<IProps> = () => {
  const { tokenStore, accountStore, notificationStore } = useStores();
  const { width } = useWindowSize();
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
  const [displayedTokens, setDisplayedTokens] = useState(10);
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
          <div className="gridTitle">
            <div>Token name</div>
            <div>Price</div>
            <div>Change (24h)</div>
            <div>Volume (24h)</div>
          </div>

          {TOKENS_LIST.slice(0, displayedTokens).map((t) =>
            width && width >= 880 ? (
              <DesktopTokenTableRow
                token={t}
                fav={tokenStore.watchList.includes(t.assetId)}
                key={t.assetId}
                handleWatchListChange={handleWatchListChange}
              />
            ) : (
              <MobileTokenTableRow
                token={t}
                fav={tokenStore.watchList.includes(t.assetId)}
                key={t.assetId}
                handleWatchListChange={handleWatchListChange}
              />
            )
          )}
          <SizedBox height={16} />
          {TOKENS_LIST.length !== displayedTokens && (
            <Text
              type="secondary"
              weight={500}
              textAlign="center"
              style={{ cursor: "pointer" }}
              onClick={() => setDisplayedTokens(displayedTokens + 10)}
            >
              Load more
            </Text>
          )}
          <SizedBox height={16} />
        </GridTable>
      </Card>
    </Root>
  );
};
export default observer(TokensTable);
