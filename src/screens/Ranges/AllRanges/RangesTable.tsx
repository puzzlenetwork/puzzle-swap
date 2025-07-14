import React, { JSX, useMemo } from "react";
import Text from "@components/Text";
import { useStores } from "@src/stores";
import SizedBox from "@components/SizedBox";
import Table from "@src/components/Table";
import Scrollbar from "@components/Scrollbar";
import { observer } from "mobx-react-lite";
import { Pagination } from "@src/components/Pagination/Pagination";
import { TOKENS_BY_ASSET_ID } from "@src/constants";
import { useNavigate } from "react-router-dom";
import RangeChart from "@components/RangeChart";
import { Column, Row } from "@src/components/Flex";
import Card from "@src/components/Card";
import styled from "@emotion/styled";
import TokenTag from "@src/components/TokenTag";
import BN from "@src/utils/BN";
import TokenInRangePreview, { TokenCard } from "./TokenInRangePreview";
import { useAllRangesVm } from "./AllRangesVm";
import RangeNotFound from "./RangeNotFound";
import useWindowSize from "@src/hooks/useWindowSize";


const GrayCard = styled(Card)`
  background: ${({ theme }) => theme.colors.primary100};
  border: none;
  width: fit-content;
`;

const RangesTable: React.FC = () => {
  const vm = useAllRangesVm();
  const navigate = useNavigate();
  const { width } = useWindowSize();
  const { rangesStore } = useStores();
  const [tableData, setTableData] = React.useState<any[]>([]);

  const columns = React.useMemo(
    () => [
      { Header: "Range", accessor: "range" },
      { Header: <Text size="medium" type="secondary" nowrap>Fact / Virtual Liquidity</Text>, accessor: "liquidity" },
      { Header: <Text size="medium" type="secondary" textAlign="end">Earned by LP</Text>, accessor: "periodFees" },
    ],
    []
  );

  const changePage = (el: number) => {
    rangesStore.setPagination({ page: el, size: 20 });
  };

  const stopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const rangePreviewByAddress: Record<string, JSX.Element> = useMemo(
    () => rangesStore.ranges.reduce((acc, range, index) => ({
      ...acc,
      [range.address]: (
        <Row alignItems="center">
          <GrayCard paddingDesktop="4px" paddingMobile="4px" onClick={width && width < 880 ? stopPropagation : undefined}>
            <RangeChart range={range} size={120} index={index} />
        </GrayCard>
        <SizedBox width={16} />
        <Column crossAxisSize="max" justifyContent="space-between">
          <SizedBox height={20} />
          <Text weight={500}>
            Range {range.domain}
          </Text>
          <SizedBox height={8} />
          <Row>
            {range.assets.slice().sort((a, b) => range.baseTokenId === a.assetId ? -1 : range.baseTokenId === b.assetId ? 1 : 0).slice(0, 4).map((asset, index) => (
              <TokenInRangePreview
                key={index}
                asset={asset}
                baseToken={range.baseToken}
                showInUsd={vm.showPriceInUsd}
                style={{ marginRight: 4 }}
              />
            ))}
            {range.assets.length > 4 && (
              <TokenCard style={{ alignItems: "center", justifyContent: "center", height: 76 }}>
                <Text>+{range.assets.length - 4}</Text>
              </TokenCard>
            )}
          </Row>
          <SizedBox height={20} />
        </Column>
      </Row>
    )
    }), {}),
    [rangesStore.ranges, vm.showPriceInUsd, width]
  );

  useMemo(
    () => {
      const mappedData = rangesStore.ranges.map((range, index) => ({
      onClick: () => navigate(`/ranges/${range.address}/details`),
      range: rangePreviewByAddress[range.address],
      liquidity: <Text nowrap>${range.liquidity.toFormat(2)} / <Text type="secondary" size="medium" style={{ display: "inline" }}>${range.virtualLiquidity.toFormat(2)}</Text></Text>,
      periodFees: (
        <Column alignItems="flex-end" crossAxisSize="max">
          <Row style={{ gap: 4, flexWrap: "wrap", justifyContent: "flex-end" }}>
            {Object.entries(range.periodStats).filter(([_, { feesEarned, extraEarned }]) => new BN(feesEarned + extraEarned).gt(0)).map(([assetId, { feesEarned, extraEarned }], i) => {
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
            ≈${ range.totalFees.toFormat(2) }
          </Text>
        </Column>
      ),
      }));
      setTableData(mappedData);
    },
    [rangesStore.ranges, navigate, vm.showPriceInUsd]
  );

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
        <RangeNotFound
          onClear={() => {
            vm.setSearchValue("");
            vm.setRangesSorting(0);
            vm.setSelectedStatsRange(0);
            vm.setShowOnlyActiveRanges(false);
            vm.setShowPriceInUsd(false);
          }}
          searchValue={vm.searchValue}
        />
      )}
    </>
  );
};

export default observer(RangesTable);
