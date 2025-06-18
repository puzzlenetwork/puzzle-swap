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
import { useNavigate } from "react-router-dom";
import RangeChart from "@components/RangeChart";
import { Column, Row } from "@src/components/Flex";
import Card from "@src/components/Card";
import styled from "@emotion/styled";
import ArrowWithSuperText from "./ArrowWithSuperText";


const GrayCard = styled(Card)`
  background: ${({ theme }) => theme.colors.primary50};
  border: none;
  width: fit-content;
`;

const RedCard = styled(Card)`
  background: ${({ theme }) => theme.colors.error100};
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
      { Header: "Earned by LP", accessor: "periodFees" },
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
              asset.assetId === range.baseTokenId
                ? (
                  <GrayCard paddingDesktop="12px 8px" paddingMobile="12px 8px" style={{ borderRadius: "6px", marginRight: "4px" }} key={index}>
                    <Text>{asset.name}</Text>
                    <SizedBox height={12} />
                      <Text type="secondary" size="small" weight={500}>Base</Text>
                  </GrayCard>
                )
                : (asset.currentPrice.lte(asset.maxPrice) && asset.currentPrice.gte(asset.minPrice))
                  ? (
                    <GrayCard paddingDesktop="12px 8px" paddingMobile="12px 8px" style={{ borderRadius: "6px", marginRight: "4px" }} key={index}>
                      <Text>{asset.name}</Text>
                      <SizedBox height={12} />
                        <Row alignItems="center">
                          <Text type="secondary" size="small" weight={500}>{asset.minPrice.toSmallFormat()}</Text>
                          <SizedBox width={4} />
                          <ArrowWithSuperText>
                            <Text type="secondary" size="small" weight={500}>{asset.currentPrice.toSmallFormat()}</Text>
                          </ArrowWithSuperText>
                          <SizedBox width={4} />
                          <Text type="secondary" size="small" weight={500}>{asset.maxPrice.toSmallFormat()}</Text>
                        </Row>
                    </GrayCard>
                  )
                  : (
                    <RedCard paddingDesktop="12px 8px" paddingMobile="12px 8px" style={{ borderRadius: "6px", marginRight: "4px" }} key={index}>
                      <Text>{asset.name}</Text>
                      <SizedBox height={12} />
                        <Row alignItems="center">
                          <Text type="secondary" size="small" weight={500}>{asset.minPrice.toSmallFormat()}</Text>
                          <SizedBox width={4} />
                          <ArrowWithSuperText>
                            <Text type="secondary" size="small" weight={500}>{asset.currentPrice.toSmallFormat()}</Text>
                          </ArrowWithSuperText>
                          <SizedBox width={4} />
                          <Text type="secondary" size="small" weight={500}>{asset.maxPrice.toSmallFormat()}</Text>
                        </Row>
                    </RedCard>
                  )
            ))}
          </Row>
          <SizedBox height={20} />
        </Column>
      </Row>
    ),
    liquidity: `$${range.liquidity} / $${range.virtualLiquidity}`,
    periodFees: (() => {
      const tokens = Object.entries(range.periodFees).map(([asset_id, { feesEarned }]: [string, { feesEarned: number }]) => {
        const token = TOKENS_BY_ASSET_ID[asset_id] || {};
        return {
          asset_id,
          name: token.symbol,
          logo: token.logo,
          share: feesEarned,
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
