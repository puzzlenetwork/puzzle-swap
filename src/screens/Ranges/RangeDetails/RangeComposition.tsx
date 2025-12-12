import styled from "@emotion/styled";
import React, { useMemo, useState } from "react";
import Text from "@components/Text";
import SizedBox from "@components/SizedBox";
import { Column, Row } from "@components/Flex";
import { useRangeDetailsInterfaceVM } from "./RangeDetailsVM";
import { observer } from "mobx-react-lite";
import Table from "@components/Table";
import Scrollbar from "@src/components/Scrollbar";
import useWindowSize from "@src/hooks/useWindowSize";
import { useTheme } from "@emotion/react";
import Tooltip from "@src/components/Tooltip";
import { ReactComponent as InfoIcon } from "@src/assets/icons/info.svg";
import { TOKENS_BY_ASSET_ID } from "@src/constants";
import BN from "@src/utils/BN";
import Checkbox from "@src/components/Checkbox";
import Select from "@src/components/Select";
import Tag from "@src/components/Tag";

interface IProps {
  isMobile?: boolean;
}

const Root = styled.div<{ balanceSort?: boolean }>`
  display: flex;
  flex-direction: column;
  padding-top: 24px;

  .value-group {
    width: 20px;
    height: 20px;
    transform: ${({ balanceSort }) => (balanceSort ? "scale(1)" : "scale(1, -1)")};
  }
`;

const Icon = styled.img`
  width: 24px;
  height: 24px;
  border-radius: 12px;
  border: 1px solid #f1f2fe;
`;

const RangeComposition: React.FC<IProps> = (props) => {
  const theme = useTheme();
  const vm = useRangeDetailsInterfaceVM();
  const { width: screenWidth } = useWindowSize();
  const [filteredTokens, setFilteredTokens] = useState<any[]>([]);
  const [balanceSort, setValueSort] = useState(true);
  const [showSellOff, setShowSellOff] = useState(props.isMobile ?? false);
  const [relativeTokenAssetId, setRelativeTokenAssetId] = useState<string>("");
  const [rateToRelativeToken, setRateToRelativeToken] = useState(new BN(1));

  const hideShowSellOff = vm.range?.assets.every((a) => !a.maxSellAllowed || a.maxSellAllowed.isNaN());

  const handleChangeRelativeToken = (relativeAssetId: string) => {
    setRelativeTokenAssetId(relativeAssetId);
    const baseTokenPrice = vm.range?.assets.find((a) => a.assetId === vm.range?.baseTokenId)?.currentPrice;
    const relativePrice =
      relativeAssetId === "USD"
        ? vm.range?.baseTokenPrice
        : vm.range?.assets.find((a) => a.assetId === relativeAssetId)?.currentPrice;
    if (!!baseTokenPrice && !!relativePrice) setRateToRelativeToken(baseTokenPrice.div(relativePrice));
  };

  React.useEffect(() => {
    if (vm.range?.baseTokenId && !relativeTokenAssetId) {
      handleChangeRelativeToken(vm.range.baseTokenId);
    }
  }, [vm.range?.baseTokenId]);

  const columns = React.useMemo(
    () => [
      { Header: "Asset", accessor: "asset" },
      {
        accessor: "price",
        Header: () => (
          <Row alignItems="center" justifyContent="flex-end">
            Min ← Current → Max Price
          </Row>
        )
      },
      {
        accessor: "balance",
        Header: () => (
          <Row style={{ cursor: "pointer" }} justifyContent="center">
            <Text size="medium" fitContent>
              Fact / Virtual Balance
            </Text>
            <img
              style={{ paddingLeft: 7 }}
              src={theme.images.icons.group}
              alt="group"
              className="value-group"
              onClick={() => setValueSort(!balanceSort)}
            />
          </Row>
        )
      },
      {
        accessor: "share",
        Header: () => (
          <Row alignItems="center" justifyContent="flex-end">
            Fact / Virt / Setup Share
          </Row>
        )
      },
      {
        Header: (
          <Tooltip
            config={{
              trigger: "hover"
            }}
            content={
              <Column>
                <Text size="small">Sell of is Max portion of this token that can</Text>
                <Text size="small">be safely sold without breaking range balance</Text>
              </Column>
            }
          >
            <Row>
              Sell-Off (100 Min) <InfoIcon style={{ marginLeft: 4 }} />
            </Row>
          </Tooltip>
        ),
        accessor: "selloff",
        columnVisibility: showSellOff
      }
    ],
    [balanceSort, theme.images.icons.group, showSellOff]
  );
  useMemo(() => {
    const tokens = (vm.range?.assets ?? [])
      .slice()
      .sort((a, b) => {
        // // Stick base token to the top
        // if (a.asset_id === vm.range!.baseTokenId) {
        //   return -1;
        // }
        // if (b.asset_id === vm.range!.baseTokenId) {
        //   return 1;
        // }
        if (a.factBalance.lte(b.factBalance)) {
          return balanceSort ? 1 : -1;
        } else {
          return balanceSort ? -1 : 1;
        }
      })
      .map((a) => ({
        ...a,
        ...TOKENS_BY_ASSET_ID[a.assetId]
      }));

    let totalValue = BN.ZERO;
    let totalFactValue = BN.ZERO;
    tokens.forEach((a) => {
      totalValue = totalValue.plus(a.balanceUsd);
      totalFactValue = totalFactValue.plus(a.factBalanceUsd);
    });

    const data = tokens.map((a) => ({
      onClick: null,
      asset: (
        <Row alignItems="center" mainAxisSize="fit-content">
          <Icon src={a.logo} alt="logo" />
          <SizedBox width={8} />
          <Text fitContent>{a.symbol}</Text>
          {a.shutdownBuy && (
            <>
              <SizedBox width={8} />
              <Tooltip
                content={
                  <Column>
                    <Text size="small">For security reasons, the purchase of this</Text>
                    <Text size="small">token has been temporarily suspended.</Text>
                  </Column>
                }
              >
                <Tag type="error">Buy Shutdown</Tag>
              </Tooltip>
            </>
          )}
          {a.shutdownSell && (
            <>
              <SizedBox width={8} />
              <Tooltip
                content={
                  <Column>
                    <Text size="small">For security reasons, the sale of this</Text>
                    <Text size="small">token has been temporarily suspended.</Text>
                  </Column>
                }
              >
                <Tag type="error">Sell Shutdown</Tag>
              </Tooltip>
            </>
          )}
          {/* {a.staked && a.stakeApr?.gte(1) && (
            <Tooltip content={
              <Column>
                <Text size="medium">Some tokens keep earning yield even</Text>
                <Text size="medium">while inside a range.</Text>
              </Column>
            }>
              <Row mainAxisSize="fit-content">
                <SizedBox width={8} />
                <Text type="success" size="medium" weight={500} fitContent>
                  {a.stakeApr.toFixed(0)}%
                </Text>
                <SizedBox width={6} />
                <Autostaking width={20} height={20} />
              </Row>
            </Tooltip>
          )} */}
        </Row>
      ),
      price:
        relativeTokenAssetId === "USD" ? (
          a.assetId === relativeTokenAssetId ? (
            <Row alignItems="center" justifyContent="flex-end">
              ${a.currentPriceUsd.toSmallFormat()}
            </Row>
          ) : (
            <Row alignItems="center" justifyContent="flex-end">
              <Text fitContent type="secondary" size="small">
                ${a.minPriceUsd.toSmallFormat()}
              </Text>
              <SizedBox width={4} />
              <Text fitContent> ← ${a.currentPriceUsd.toSmallFormat()} → </Text>
              <SizedBox width={4} />
              <Text fitContent type="secondary" size="small">
                {a.maxPriceUsd?.isFinite() ? `${a.maxPriceUsd.toSmallFormat()}` : "∞"}
              </Text>
            </Row>
          )
        ) : a.assetId === relativeTokenAssetId ? (
          <Row alignItems="center" justifyContent="flex-end">
            {a.currentPrice.times(rateToRelativeToken).toSmallFormat()}
          </Row>
        ) : (
          <Row alignItems="center" justifyContent="flex-end">
            <Text fitContent type="secondary" size="small">
              {a.minPrice.times(rateToRelativeToken).toSmallFormat()}
            </Text>
            <SizedBox width={4} />
            <Text fitContent> ← {a.currentPrice.times(rateToRelativeToken).toSmallFormat()} → </Text>
            <SizedBox width={4} />
            <Text fitContent type="secondary" size="small">
              {a.maxPrice?.isFinite() ? a.maxPrice.times(rateToRelativeToken).toSmallFormat() : "∞"}
            </Text>
          </Row>
        ),
      balance: (
        <Row alignItems="center" justifyContent="center">
          <Text fitContent type={a.isActive ? "primary" : "error"}>
            {a.factBalance.toSmallFormat()}
          </Text>
          <SizedBox width={4} />
          <Text fitContent>/</Text>
          <SizedBox width={4} />
          <Text fitContent type="secondary">
            {a.balance.toSmallFormat()}
          </Text>
        </Row>
      ),
      share: (
        <Row alignItems="center" justifyContent="flex-end">
          <Text fitContent type={a.isActive ? "primary" : "error"}>
            {a.factBalanceUsd.div(totalFactValue).times(100).toFormat(2)}%
          </Text>
          <SizedBox width={4} />
          <Text fitContent>/</Text>
          <SizedBox width={4} />
          <Text fitContent>{a.balanceUsd.div(totalValue).times(100).toFormat(2)}%</Text>
          <SizedBox width={4} />
          <Text fitContent>/</Text>
          <SizedBox width={4} />
          <Text fitContent type="secondary">
            {a.share.toFormat(2)}%
          </Text>
        </Row>
      ),
      selloff:
        a.maxSellAllowed &&
        (a.currentSelloff.gte(a.maxSellAllowed) ? (
          <Tooltip
            content={
              <Column>
                <Text size="small">The token has currently reached</Text>
                <Text size="small">its peak sales volume. Sales will</Text>
                <Text size="small">
                  resume in{" "}
                  {new BN(vm.currentBlockHeight)
                    .div(100)
                    .toDecimalPlaces(0, BN.ROUND_CEIL)
                    .times(100)
                    .minus(a.selloffStartHeight)
                    .toNumber()}{" "}
                  minutes.
                </Text>
              </Column>
            }
          >
            <Row alignItems="center" justifyContent="flex-end">
              <Text fitContent type={a.currentSelloff.gt(a.maxSellAllowed) ? "error" : "success"}>
                {a.currentSelloff.gt(1e-2)
                  ? a.currentSelloff.toFormat(2)
                  : a.currentSelloff.gt(1e-4)
                  ? a.currentSelloff.toFormat(4)
                  : 0}
                % /{" "}
                <Text type="secondary" size="medium" style={{ display: "inline" }}>
                  {a.maxSellAllowed.toSmallFormat()}%
                </Text>
              </Text>
            </Row>
          </Tooltip>
        ) : (
          <Row alignItems="center" justifyContent="flex-end">
            <Text fitContent type={a.currentSelloff.gt(a.maxSellAllowed) ? "error" : "success"}>
              {a.currentSelloff.gt(1e-2)
                ? a.currentSelloff.toFormat(2)
                : a.currentSelloff.gt(1e-4)
                ? a.currentSelloff.toFormat(4)
                : 0}
              % /{" "}
              <Text type="secondary" size="medium" style={{ display: "inline" }}>
                {a.maxSellAllowed.toSmallFormat()}%
              </Text>
            </Text>
          </Row>
        ))
    }));
    setFilteredTokens(data);
  }, [vm.range, vm.currentBlockHeight, balanceSort, relativeTokenAssetId, rateToRelativeToken]);
  const { width } = useWindowSize();
  return (
    <Root balanceSort={balanceSort}>
      <Row alignItems="center">
        <Text weight={500} type="secondary">
          Range composition
        </Text>
        <Row alignItems="baseline" mainAxisSize="fit-content">
          {!props.isMobile && !hideShowSellOff && (
            <Row alignItems="center" mainAxisSize="fit-content">
              <Text fitContent nowrap>
                Show Sell-Off
              </Text>
              <SizedBox width={8} />
              <Checkbox onChange={() => setShowSellOff(!showSellOff)} checked={showSellOff} />
              <SizedBox width={20} />
            </Row>
          )}
          <Text size={props.isMobile ? "small" : undefined} fitContent nowrap>
            Show Asset Prices in
          </Text>
          <SizedBox width={props.isMobile ? 4 : 8} />
          <Select
            kind="text"
            textSize="medium"
            options={[
              {
                key: "USD",
                title: "USD"
              },
              ...(vm.range?.assets ?? []).map((asset) => ({
                key: asset.assetId,
                title: asset.name
              }))
            ]}
            onSelect={({ key }) => handleChangeRelativeToken(key)}
            selected={{
              key: relativeTokenAssetId,
              title: relativeTokenAssetId === "USD" ? "USD" : TOKENS_BY_ASSET_ID[relativeTokenAssetId]?.name
            }}
          />
        </Row>
      </Row>
      <SizedBox height={8} />
      <Scrollbar
        style={{
          maxWidth:
            screenWidth && screenWidth > 1160
              ? "750px"
              : screenWidth && screenWidth > 880
              ? "calc(((100vw - 32px - 40px) / 3) * 2)"
              : "calc(100vw - 32px)",
          borderRadius: 16
        }}
      >
        {width && (
          <Table
            fitContent={width < 402}
            columns={columns}
            data={filteredTokens}
            style={{ whiteSpace: "nowrap" }}
            initialState={{
              hiddenColumns: [!(showSellOff || props.isMobile) && "selloff"]
            }}
          />
        )}
      </Scrollbar>
      <SizedBox height={16} />
    </Root>
  );
};
export default observer(RangeComposition);
