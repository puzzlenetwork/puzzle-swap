import React from "react";
import Text from "@components/Text";
import { useStores } from "@src/stores";
import SizedBox from "@components/SizedBox";
import Table from "@src/components/Table";
import Scrollbar from "@components/Scrollbar";
import { observer } from "mobx-react-lite";
import { Pagination } from "@src/components/Pagination/Pagination";
import { ReactComponent as NotFoundIcon } from "@src/assets/notFound.svg";
import Button from "@components/Button";
import Loading from "@components/Loading";
import TokenTags from "@screens/Pools/TokenTags";
import { TOKENS_BY_ASSET_ID } from "@src/constants";

const RangesTable: React.FC = () => {
  const { rangesStore } = useStores();

  const columns = React.useMemo(
    () => [
      { Header: "Range", accessor: "range" },
      { Header: "Fact / Virtual Liquidity", accessor: "liquidity" },
      { Header: "Earned by LP", accessor: "periodFees" },
    ],
    []
  );

  const changePage = (el: number) => {
    rangesStore.setPagination({ page: el, size: 20 });
  };

  const tableData = rangesStore.ranges.map((range) => ({
    range: range.logo,
    liquidity: `$${range.liquidity} / $${range.virtualLiquidity}`,
    periodFees: (() => {
      const tokens = Object.entries(range.periodFees).map(([asset_id, { fees_earned }]: [string, { fees_earned: number }]) => {
        const token = TOKENS_BY_ASSET_ID[asset_id] || {};
        return {
          asset_id,
          name: token.symbol,
          logo: token.logo,
          share: fees_earned,
        };
      });
      return <TokenTags tokens={tokens} findBalanceByAssetId={() => null} />;
    }),
  }));

  return (
    <>
      {rangesStore.ranges.length > 0 ? (
        <>
          <Scrollbar
            style={{ maxWidth: "calc(100vw - 32px)", borderRadius: 16 }}
          >
            <Table
              columns={columns}
              data={tableData}
              withHover
              loading={rangesStore.loading}
            />
          </Scrollbar>
          <Pagination
            currentPage={rangesStore.pagination.page}
            lengthData={rangesStore.totalItems}
            limit={20}
            onChange={changePage}
          />
        </>
      ) : (
        <>
          <SizedBox height={24} />
          <NotFoundIcon style={{ marginBottom: 24 }} />
          <Text size="medium" type="secondary" className="text">
            {rangesStore.loading ? (
              <Loading big />
            ) : (
              "No ranges found. Try adjusting your filters or create a new range."
            )}
          </Text>
          <Button onClick={() => { }}>Cancel the search</Button>
          <SizedBox height={24} />
        </>
      )}
    </>
  );
};

export default observer(RangesTable);
