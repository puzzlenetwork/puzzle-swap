import styled from "@emotion/styled";
import React from "react";
import { Link } from "react-router-dom";
import { Column, Row } from "@components/Flex";
import SizedBox from "@components/SizedBox";
import Text from "@components/Text";
import { useStores } from "@stores";
import { observer } from "mobx-react-lite";
import Pool from "@src/entities/Pool";
import { IStatsPoolItem } from "@stores/PoolsStore";
import TokenTags from "@screens/Invest/TokenTags";

interface IProps {
  stats?: IStatsPoolItem;
  pool: Pool;
}

const Icon = styled.img`
  width: 56px;
  height: 56px;
  border-radius: 12px;
  border: 1px solid #f1f2fe;
`;

const Root = styled(Link)`
  margin: 0 !important;

  :hover {
    background: #f8f8ff;
  }
`;
const StyledRow = styled(Row)`
  margin: 0 16px;
  @media (min-width: 880px) {
    margin: 0 24px;
  }
`;
const InvestPoolRow: React.FC<IProps> = ({ pool, stats }) => {
  const { accountStore, poolsStore } = useStores();
  const apy = stats?.apy != null ? stats.apy.toFormat(2) : null;
  const volume =
    stats?.monthly_volume != null ? stats.monthly_volume.toFormat(2) : null;
  const accountBalance = poolsStore.accountPoolsLiquidity?.find(
    (o) => pool.domain === o.pool.domain
  )?.liquidityInUsdn;
  return (
    <Root to={`/pools/${pool.domain}/invest`} className="gridRow">
      <StyledRow>
        <Icon src={pool.logo} alt="logo" />
        <SizedBox width={8} />
        <Column crossAxisSize="max">
          <Row alignItems="center">
            <Text fitContent style={{ whiteSpace: "nowrap" }} weight={500}>
              {pool.title}
            </Text>
          </Row>
          <TokenTags
            tokens={pool.tokens}
            findBalanceByAssetId={accountStore.findBalanceByAssetId}
          />
        </Column>
      </StyledRow>
      <Text style={{ whiteSpace: "nowrap" }}>
        {accountBalance != null && accountBalance.gt(0)
          ? `$${accountBalance.toFormat(2)}`
          : "—"}
      </Text>
      <Text style={{ whiteSpace: "nowrap" }}>
        $ {pool.globalLiquidity.toFormat(2)}
      </Text>
      <Text style={{ whiteSpace: "nowrap" }}>
        {volume != null ? `$ ${volume}` : "—"}
      </Text>
      <Text style={{ whiteSpace: "nowrap" }}>
        {apy != null ? `${apy} %` : "—"}
      </Text>
    </Root>
  );
};
export default observer(InvestPoolRow);
