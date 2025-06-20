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
import { TOKENS_BY_ASSET_ID } from "@src/constants";
import { useNavigate } from "react-router-dom";
import RangeChart from "@components/RangeChart";
import { Column, Row } from "@src/components/Flex";
import Card from "@src/components/Card";
import styled from "@emotion/styled";
import TokenTag from "@src/components/TokenTag";
import BN from "@src/utils/BN";
import TokenInRangePreview from "./TokenInRangePreview";


const GrayCard = styled(Card)`
  background: ${({ theme }) => theme.colors.primary100};
  border: none;
  width: fit-content;
`;

const RangesTable: React.FC = () => {
  const navigate = useNavigate();
  const { rangesStore } = useStores();

  const columns = React.useMemo(
    () => [
      { Header: "Range", accessor: "range" },
      { Header: "Fact / Virtual Liquidity", accessor: "liquidity" },
      { Header: <Text size="medium" type="secondary" textAlign="end">Earned by LP</Text>, accessor: "periodFees" },
    ],
    []
  );

  const changePage = (el: number) => {
    rangesStore.setPagination({ page: el, size: 20 });
  };

  const tableData = rangesStore.ranges.map((range, index) => ({
    onClick: () => navigate(`/ranges/${range.address}/invest`),
    range: (
      // <Text>{range.assetsWithLeverage.map(({ leverage }) => `${leverage}`).join(", ")}</Text>
      <Row>
        <GrayCard paddingDesktop="4px" paddingMobile="4px">
          <RangeChart range={range} size={120} index={index} />
        </GrayCard>
        <SizedBox width={16} />
        <Column crossAxisSize="max" justifyContent="space-between">
          <SizedBox height={20} />
          <Text weight={500}>
            Range {range.title}
          </Text>
          <SizedBox height={8} />
          <Row>
            {range.assets.map((asset, index) => (
              <TokenInRangePreview
                key={index}
                asset={asset}
                baseToken={range.baseToken}
                style={{ marginRight: 4 }}
              />
            ))}
          </Row>
          <SizedBox height={20} />
        </Column>
      </Row>
    ),
    liquidity: <Text nowrap>${range.liquidity.toFormat(2)} / <Text type="secondary" size="medium" style={{ display: "inline" }}>${range.virtualLiquidity.toFormat(2)}</Text></Text>,
    periodFees: (
      <Column alignItems="flex-end" crossAxisSize="max">
        <Row style={{ gap: 4, flexWrap: "wrap", justifyContent: "flex-end" }}>
          {Object.entries(range.periodFees).filter(([_, { feesEarned, extraEarned }]) => new BN(feesEarned + extraEarned).gt(0)).map(([assetId, { feesEarned, extraEarned }], i) => {
            const tokenInfo = TOKENS_BY_ASSET_ID[assetId] || {};
            return (
              <TokenTag
                key={i}
                token={{...tokenInfo, decimals: 0}}
                amount={new BN(feesEarned + extraEarned)}
                size="small"
                iconRight
              />
            );
          }
          )}
        </Row>
        <SizedBox height={10} />
        <Text type="secondary" size="medium" textAlign="end">
          ≈${ range.stats.poolFees.plus(range.stats.ownerFees).plus(range.stats.protocolFees).toFormat(2) }
        </Text>
      </Column>
    ),
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
