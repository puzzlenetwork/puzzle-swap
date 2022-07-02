import styled from "@emotion/styled";
import { observer } from "mobx-react-lite";
import React from "react";
import SearchTab from "./SearchTab";
import SizedBox from "@components/SizedBox";
import Text from "@components/Text";
import { useExploreVM } from "@screens/Explore/ExploreVm";
import GridTable from "@components/GridTable";
import Card from "@components/Card";
import { TOKENS_LIST } from "@src/constants";
import useWindowSize from "@src/hooks/useWindowSize";
import DesktopTokenTableRow from "./DesktopTokenTableRow";
import MobileTokenTableRow from "@screens/Explore/MobileTokenTableRow";

interface IProps {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
`;

const TokensTable: React.FC<IProps> = () => {
  const vm = useExploreVM();
  const { width } = useWindowSize();
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

          {TOKENS_LIST.map((t) =>
            width && width >= 880 ? (
              <DesktopTokenTableRow token={t} fav={false} key={t.assetId} />
            ) : (
              <MobileTokenTableRow token={t} fav={false} key={t.assetId} />
            )
          )}
          <SizedBox height={16} />
          <Text
            type="secondary"
            weight={500}
            textAlign="center"
            style={{ cursor: "pointer" }}
          >
            {/*{vm.loadingHistory ? <Loading big /> : "Load more"}*/}
            Load more
          </Text>
          <SizedBox height={16} />
        </GridTable>
      </Card>
    </Root>
  );
};
export default observer(TokensTable);
