import React from "react";
import { observer } from "mobx-react-lite";
import InvestRow, { InvestRowSkeleton } from "@src/components/InvestRow";
import { useWalletVM } from "@components/Wallet/WalletModal/WalletVM";
import styled from "@emotion/styled";
import SizedBox from "@components/SizedBox";
import { ReactComponent as NotFoundIcon } from "@src/assets/notFound.svg";
import Text from "@components/Text";
import Button from "@components/Button";
import { Column } from "@components/Flex";
import { useStores } from "@stores";
import { Link } from "react-router-dom";
import Skeleton from "react-loading-skeleton";
import { ROUTES } from "@src/constants";

const Root = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 400px;
`;

const Investments: React.FC = () => {
  const { accountStore, poolsStore, stakeStore } = useStores();
  const vm = useWalletVM();
  if (
    poolsStore.investedInPools == null ||
    stakeStore.stakedAccountPuzzle == null
  )
    return (
      <Root style={{ padding: "0 24px" }}>
        <Skeleton height={56} style={{ marginBottom: 8 }} count={3} />
      </Root>
    );
  return (
    <Root>
      {vm.investments != null
        ? vm.investments.map((item, index) => {
            const nuclearValue = item.nuclearValue.gte(0.0001)
              ? item.nuclearValue.toFormat(2)
              : item.nuclearValue.toFormat(8);
            const usdnEquivalent = item.usdnEquivalent.gte(0.0001)
              ? item.usdnEquivalent.toFormat(2)
              : item.usdnEquivalent.toFormat(8);
            return (
              <Link to={item.onClickPath} key={index + "investment"}>
                <InvestRow
                  withClickLogic
                  onClick={() => accountStore.setWalletModalOpened(false)}
                  logo={item.logo}
                  topLeftInfo={item.name}
                  topRightInfo={item.amount}
                  bottomRightInfo={
                    "$ " + (item.usdnEquivalent.eq(0) ? "0.00" : usdnEquivalent)
                  }
                  bottomLeftInfo={
                    "$ " + (item.nuclearValue.eq(0) ? "0.00" : nuclearValue)
                  }
                />
              </Link>
            );
          })
        : Array.from({ length: 2 }).map(() => <InvestRowSkeleton />)}
      {vm.investments.length === 0 && (
        <Column justifyContent="center" alignItems="center" crossAxisSize="max">
          <SizedBox height={16} />
          <NotFoundIcon />
          <Text
            type="secondary"
            size="medium"
            textAlign="center"
            style={{ whiteSpace: "pre-wrap" }}
          >
            {`You didn’t invest yet.Go to Pools page\nto provide liquidity and get rewards,\n or stake puzzle on the Stake page.`}
          </Text>
          <SizedBox height={16} />
          <Button
            size="medium"
            kind="secondary"
            onClick={() => {
              window.open(ROUTES.POOLS);
              accountStore.setWalletModalOpened(false);
            }}
          >
            Go to Invest
          </Button>
          <SizedBox height={100} />
        </Column>
      )}
    </Root>
  );
};
export default observer(Investments);
