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
import TokenInRangePreview, { TokenCard } from "./TokenInRangePreview";
import { useRangesListVm } from "./RangesListVm";
import RangeNotFound from "./RangeNotFound";
import useWindowSize from "@src/hooks/useWindowSize";
import { ReactComponent as WarningIcon } from "@src/assets/icons/warning.svg";
import { THEME_TYPE, themes } from "@src/themes/ThemeProvider";
import Tooltip from "@src/components/Tooltip";
import Img from "@src/components/Img";
import Skeleton from "react-loading-skeleton";
import { domainToUrlSafe } from "@src/utils/rangeUrlUtils";

const GrayCard = styled(Card)`
  background: ${({ theme }) => theme.colors.primary100};
  border: none;
  width: fit-content;
`;

const StyledTable = styled(Table)`
  & td {
    align-content: start;
  }
`

const ColoredWarningIcon = styled(WarningIcon)<{ color: string }>`
  & path {
    stroke: ${({ color }) => color};
  }
`

const RangesTable: React.FC = () => {
  const vm = useRangesListVm();
  const navigate = useNavigate();
  const { width } = useWindowSize();
  const { rangesStore, accountStore } = useStores();
  const [tableData, setTableData] = React.useState<any[]>([]);

  const columns = React.useMemo(
    () => [
      { Header: "Range", accessor: "range" },
      {
        Header: (
          <Text size="medium" type="secondary" nowrap>
            Fact / Virtual Liquidity
          </Text>
        ),
        accessor: "liquidity"
      },
      {
        Header: (
          <Text size="medium" type="secondary" textAlign="center">
            APY
          </Text>
        ),
        accessor: "apy"
      },
      {
        Header: (
          <Text size="medium" type="secondary" textAlign="end">
            Earned by LP
          </Text>
        ),
        accessor: "periodFees"
      }
    ],
    []
  );

  const changePage = (el: number) => {
    rangesStore.setPagination({
      page: el,
      size: rangesStore.rangesPaginationSize
    });
  };

  const stopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const rangePreviewByAddress: Record<string, JSX.Element> = useMemo(
    () =>
      rangesStore.ranges.reduce(
        (acc, range, index) => ({
          ...acc,
          [range.address]: (
            <Row alignItems="start">
              <GrayCard
                paddingDesktop="4px"
                paddingMobile="4px"
                onClick={width && width < 880 ? stopPropagation : undefined}
              >
                <RangeChart assetsWithLeverage={range.assetsWithLeverage} size={120} uniqueId={index} />
              </GrayCard>
              <SizedBox width={16} />
              <Column crossAxisSize="max" justifyContent="space-between">
                <SizedBox height={10} />
                <Text weight={500}>Range {range.domain}</Text>
                <SizedBox height={8} />
                <Row style={{ flexWrap: "wrap", gap: 4 }}>
                  {range.assets
                    .slice()
                    .sort((a, b) => (range.baseTokenId === a.assetId ? -1 : range.baseTokenId === b.assetId ? 1 : 0))
                    .slice(0, 4)
                    .map((asset, index) => (
                      <TokenInRangePreview
                        key={index}
                        asset={asset}
                        baseToken={range.baseToken}
                        showInUsd={vm.showPriceInUsd}
                      />
                    ))}
                  {range.assets.length > 4 && (
                    <TokenCard
                      style={{
                        alignItems: "center",
                        justifyContent: "center",
                        height: 76
                      }}
                    >
                      <Text>+{range.assets.length - 4}</Text>
                    </TokenCard>
                  )}
                </Row>
                <SizedBox height={10} />
              </Column>
            </Row>
          )
        }),
        {}
      ),
    [rangesStore.ranges, vm.showPriceInUsd, width]
  );

  useMemo(() => {
    const mappedData = rangesStore.ranges
      .map((range, index) => {
        const lowLiquidityAssets = range.assets.filter((a) => !a.isActive);
        return ({
          onClick: () => navigate(`/ranges/${range.address}/details`),
          range: rangePreviewByAddress[range.address],
          liquidity: (
            <Row mainAxisSize="fit-content" style={{ position: "relative" }}>
              {lowLiquidityAssets?.length > 0 ? (
                <>
                  <Tooltip
                    content={
                      <Column style={{ minWidth: 200 }}>
                        <Text type="error" size="small" fitContent style={{ position: "absolute", top: 8, right: 16 }} nowrap>
                          Low Liquidity
                        </Text>
                        <Column crossAxisSize="max" style={{ gap: 8 }}>
                          {
                            lowLiquidityAssets
                              .slice(0, 3)
                              .map((asset, index) => (
                                <React.Fragment key={index}>
                                  <Column>
                                    <Row>
                                      <Img
                                        src={TOKENS_BY_ASSET_ID[asset.assetId]?.logo}
                                        alt={asset.name}
                                        width="20px"
                                        height="20px"
                                        style={{ borderRadius: "10px" }}
                                      />
                                      <SizedBox width={6} />
                                      <Text size="medium" fitContent>{asset.name}</Text>
                                      {index === 0 && (
                                        <SizedBox width={80} />
                                      )}
                                    </Row>
                                    <SizedBox height={8} />
                                    <Row>
                                      <Text>
                                        <Text type="error" style={{ display: "inline" }} fitContent>
                                          ${asset.factBalanceUsd.toSmallFormat()}
                                        </Text>
                                        {" / "}
                                        <Text type="secondary" style={{ display: "inline" }} size="medium" fitContent>
                                          ${asset.balanceUsd.toSmallFormat()}
                                        </Text>
                                      </Text>
                                    </Row>
                                  </Column>
                                  {index < lowLiquidityAssets.slice(0, 3).length - 1 && (
                                    <>
                                      <div style={{ width: "100%", height: "1px", backgroundColor: themes[accountStore.selectedTheme as THEME_TYPE].colors.primary100 }} />
                                    </>
                                  )}
                                </React.Fragment>
                              ))
                          }
                          {lowLiquidityAssets.length > 3 && (
                            <Text type="secondary" weight={500} textAlign="center">+{lowLiquidityAssets.length - 3} More tokens</Text>
                          )}
                        </Column>
                      </Column>
                    }
                    config={{
                      placement: "top",
                    }}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: -28,
                    }}
                  >
                    <ColoredWarningIcon
                      color={themes[accountStore.selectedTheme as THEME_TYPE].colors.error500}
                    />
                  </Tooltip>
                  <Text nowrap fitContent>
                    <Text type="error" style={{ display: "inline" }}>
                      ${range.liquidity.toFormat(2)}
                    </Text>{" / "}
                    <Text type="secondary" size="medium" style={{ display: "inline" }}>
                      ${range.virtualLiquidity.toFormat(2)}
                    </Text>
                  </Text>
                </>
              ) : (
                <Text nowrap fitContent>
                  ${range.liquidity.toFormat(2)} /{" "}
                  <Text type="secondary" size="medium" style={{ display: "inline" }}>
                    ${range.virtualLiquidity.toFormat(2)}
                  </Text>
                </Text>
              )}
            </Row>
          ),
          apy: (
            <Text textAlign="end" nowrap fitContent>
              {range.periodStats.apr.toFormat(2)}%
            </Text>
          ),
          periodFees: (
            <Column alignItems="flex-end" crossAxisSize="max">
              <Row style={{ gap: 4, flexWrap: "wrap", justifyContent: "flex-end" }}>
                {Object.entries(range.periodStats.fees)
                  .filter(([_, { feesEarned, extraEarned }]) => feesEarned.plus(extraEarned).gt(0))
                  .map(([assetId, { feesEarned, extraEarned }], i) => {
                    const tokenInfo = TOKENS_BY_ASSET_ID[assetId] || {};
                    return (
                      <TokenTag
                        key={i}
                        token={{ ...tokenInfo, decimals: 0 }}
                        amount={feesEarned.plus(extraEarned)}
                        size="small"
                        iconRight
                      />
                    );
                  })}
              </Row>
              <SizedBox height={10} />
              <Text type="secondary" size="medium" textAlign="end">
                ≈${range.totalFees.toFormat(2)}
              </Text>
            </Column>
          )
        })
      });
    setTableData(mappedData);
  }, [rangesStore.ranges, rangePreviewByAddress, navigate, accountStore.selectedTheme]);

  const skeletonData = Array.from({ length: 10 }, (_, i) => ({
    range: (
      <Row alignItems="start" key={i}>
        <GrayCard
          paddingDesktop="4px"
          paddingMobile="4px"
        >
          <div style={{ width: 120, height: 120 }} />
        </GrayCard>
        <SizedBox width={16} />
        <Column crossAxisSize="max" justifyContent="space-between">
          <SizedBox height={10} />
          <Skeleton width={120} height={24} />
          <SizedBox height={8} />
          <Row style={{ flexWrap: "wrap", gap: 4 }}>
            <Skeleton width={100} height={76} />
            <Skeleton width={100} height={76} />
          </Row>
          <SizedBox height={10} />
        </Column>
      </Row>
    ),
    liquidity: (
      <Skeleton width={160} height={24} />
    ),
    apy: (
      <Skeleton width={80} height={24} />
    ),
    periodFees: (
      <Column alignItems="flex-end" crossAxisSize="max">
        <Row style={{ gap: 4, flexWrap: "wrap", justifyContent: "flex-end" }}>
          <Skeleton width={80} height={24} />
          <Skeleton width={80} height={24} />
        </Row>
        <SizedBox height={10} />
        <Text type="secondary" size="medium" textAlign="end">
          <Skeleton width={64} height={24} />
        </Text>
      </Column>
    ),
  }));

  return (
    <>
      {
        rangesStore.loading ? (
          <Scrollbar style={{ maxWidth: "calc(100vw - 32px)", borderRadius: 16 }}>
            <StyledTable columns={columns} data={skeletonData} loading={rangesStore.loading} />
          </Scrollbar>
        ) : (
          rangesStore.ranges.length > 0 ? (
            <>
              <Scrollbar style={{ maxWidth: "calc(100vw - 32px)", borderRadius: 16 }}>
                <StyledTable columns={columns} data={tableData} loading={rangesStore.loading} />
              </Scrollbar>
              <Pagination
                currentPage={rangesStore.pagination.page}
                lengthData={rangesStore.totalItems}
                limit={rangesStore.rangesPaginationSize}
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
          )
        )
      }
    </>
  );
};

export default observer(RangesTable);
