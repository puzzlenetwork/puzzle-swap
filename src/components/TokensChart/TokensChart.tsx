import styled from "@emotion/styled";
import React, { HTMLAttributes } from "react";
import Card from "@components/Card";
import { Column, Row } from "@components/Flex";
import Text from "@components/Text";
import { observer } from "mobx-react-lite";
import useCollapse from "react-collapsed";
import SizedBox from "@components/SizedBox";
import SquareTokenIcon from "@components/SquareTokenIcon";
import ChartAgeButtons from "@components/ChartAgeButtons";
import link from "@src/assets/icons/link.svg";
import { useNavigate } from "react-router-dom";
import { IToken } from "@src/constants";
import Spinner from "@components/Spinner";
import {
  Line,
  LineChart,
  XAxis,
  Tooltip as RechartsTooltip,
  YAxis,
  ResponsiveContainer,
} from "recharts";
import dayjs from "dayjs";
import BN from "@src/utils/BN";
import {
  TokenChartVMProvider,
  useTokenChartVM,
} from "@components/TokensChart/TokenChartVM";

interface IProps extends HTMLAttributes<HTMLDivElement> {
  token0: IToken;
  token1: IToken;
  visible: boolean;
  height: number;
}

const Root = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 660px;
  box-sizing: border-box;
  padding: 0 8px 0 16px;
  .icon {
    cursor: pointer;
    transition: 0.4s;
  }

  .age-btns {
    max-width: 296px;
  }
  @media (min-width: 880px) {
    margin-top: 56px;
  }
`;
const Link = styled.img`
  width: 24px;
  height: 24px;
  cursor: pointer; ;
`;

const Body = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  box-sizing: border-box;
  padding-top: 24px;
  flex: 1;
`;

const LearnMoreContainer = styled.div`
  display: flex;
  flex-direction: column;
  & > :first-of-type {
    margin-bottom: 16px;
  }
  @media (min-width: 880px) {
    flex-direction: row;
    & > :first-of-type {
      margin-bottom: 0;
      margin-right: 16px;
    }
  }
`;

const TokensChartImpl: React.FC<IProps> = ({
  token1,
  token0,
  visible,
  height,
  ...rest
}) => {
  const vm = useTokenChartVM();
  const { getCollapseProps } = useCollapse({
    isExpanded: visible,
    duration: 500,
  });
  const navigate = useNavigate();
  return (
    <Root {...getCollapseProps()}>
      <Card style={{ height: height + 18 }}>
        <Row alignItems="center" justifyContent="space-between">
          <Row alignItems="center">
            <Text
              weight={500}
              fitContent
            >{`${token0.symbol}/${token1.symbol}`}</Text>
            <SizedBox width={8} />
            {/*<SwitchTokensButton new />*/}
          </Row>
          <ChartAgeButtons
            className="age-btns"
            value="1d"
            onChange={() => null}
          />
        </Row>
        <Body>
          {vm.chartUnavailable && (
            <Row justifyContent="center">
              <Text style={{ textAlign: "center" }}>Chart Unavailable</Text>
            </Row>
          )}
          {!vm.chartUnavailable &&
            (vm.chartLoading ? (
              <Row justifyContent="center">
                <Spinner />
              </Row>
            ) : (
              <ResponsiveContainer width="95%" height={350}>
                <LineChart height={280} data={vm.chart}>
                  <YAxis
                    hide
                    domain={[vm.chartMin * 0.99, vm.chartMax * 1.01]}
                  />
                  <XAxis
                    tickLine={false}
                    dataKey="date"
                    tickFormatter={(date) =>
                      dayjs(date).format("MM:HH, MMM DD")
                    }
                    style={{ fill: "#8082c5" }}
                  />
                  <RechartsTooltip
                    labelFormatter={(date) => (
                      <Text type="secondary" size="small">
                        {dayjs(date).format("MM:HH, MMM DD")}
                      </Text>
                    )}
                    formatter={(volume: number) => (
                      <Text size="medium">
                        $&nbsp;{new BN(volume).toFormat(2)}
                      </Text>
                    )}
                    contentStyle={{
                      border: "none",
                      filter:
                        "drop-shadow(0px 8px 24px rgba(54, 56, 112, 0.16))",
                    }}
                  />
                  <Line
                    dot={false}
                    type="monotone"
                    dataKey="volume"
                    stroke="#7075E9"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            ))}
        </Body>
      </Card>
      <SizedBox height={16} />
      <LearnMoreContainer>
        {[token0, token1].map((t) => (
          <Card
            key={t.assetId}
            alignItems="center"
            justifyContent="space-between"
            flexDirection="row"
          >
            <Row alignItems="center">
              <SquareTokenIcon size="small" src={t.logo} />
              <SizedBox width={12} />
              <Column>
                <Text size="medium" weight={500}>
                  Learn more about {t.symbol}
                </Text>
                <Text size="small" type="secondary">
                  Open in Explore
                </Text>
              </Column>
              <SizedBox width={12} />
            </Row>
            <Link
              src={link}
              alt="link"
              onClick={() => navigate(`/explore/token/${t.assetId}`)}
            />
          </Card>
        ))}
      </LearnMoreContainer>
    </Root>
  );
};

const TokensChart: React.FC<IProps> = (props) => (
  <TokenChartVMProvider
    assetId0={props.token0.assetId}
    assetId1={props.token1.assetId}
  >
    <TokensChartImpl {...props} />
  </TokenChartVMProvider>
);

export default observer(TokensChart);
