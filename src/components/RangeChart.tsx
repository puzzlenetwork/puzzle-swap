import Img from "@src/components/Img";
import RadarWithImage from "@src/components/RadarWithImage";
import { TOKENS_BY_ASSET_ID } from "@src/constants";
import { RadarChart, PolarGrid, Radar, PolarAngleAxis } from "recharts";
import Tooltip from "@components/Tooltip";
import { Column, Row } from "@components/Flex";
import Text from "@components/Text";
import SizedBox from "./SizedBox";
import styled from "@emotion/styled";

interface IParams {
  assetsWithLeverage: {
    assetId: string;
    reversedLeverage: number;
    relativeReversedLeverage: number;
  }[];
  size: number;
  uniqueId?: string | number;
  chartStyle?: React.CSSProperties;
  filterDeviation?: number;
  showTooltip?: boolean;
}

const AssetsList = styled.div`
  display: grid;
  gap: 8px;
  grid-template-columns: repeat(2, 1fr);
`;

const TokenIcon = styled(Img)`
  width: 20px;
  height: 20px;
  border-radius: 50%;
`;

const RangeChart: React.FC<IParams> = ({ assetsWithLeverage, size, uniqueId, chartStyle, filterDeviation = 12 }: IParams) => {
  const iconSize = size / 7.5;
  const halfIcon = iconSize / 2;
  const backgroundIconSize = size / 2;
  const halfBackgroundIcon = backgroundIconSize / 2;

  return (
    <RadarChart
      width={size}
      height={size}
      data={assetsWithLeverage}
      style={{
        transform: assetsWithLeverage.length < 3 ? "rotate(-90deg)" : "",
        cursor: "pointer",
        ...chartStyle,
      }}
    >
      <PolarGrid />
      <Radar
        dataKey="relativeReversedLeverage"
        shape={(props) => {
          return (
            <>
              <defs>
                <filter
                  id={"blur" + uniqueId}
                  x="-100%"
                  y="-100%"
                  width="300%"
                  height="300%"
                  colorInterpolationFilters="sRGB"
                >
                  <feGaussianBlur in="SourceGraphic" stdDeviation={filterDeviation} />
                </filter>
              </defs>
              <RadarWithImage
                imageElement={
                  <g filter={`url(#blur${uniqueId})`}>
                    {props.points.map((point: any, i: any) => {
                      const logo = TOKENS_BY_ASSET_ID[point.name]?.logo;
                      if (!logo) return null;
                      return (
                        <image
                          href={logo}
                          width={backgroundIconSize}
                          height={backgroundIconSize}
                          x={point.x - halfBackgroundIcon}
                          y={point.y - halfBackgroundIcon}
                          key={i}
                          style={{
                            opacity: 0.9,
                            borderRadius: halfBackgroundIcon // Note: SVG image does not support borderRadius directly
                          }}
                        />
                      );
                    })}
                  </g>
                }
                uniqueId={uniqueId}
                useSvgImage
                {...props}
              />
            </>
          );
        }}
        isAnimationActive={false}
      />
      <PolarAngleAxis
        dataKey="assetId"
        tick={(props) => {
          const logo = TOKENS_BY_ASSET_ID[props.payload.value]?.logo;
          if (!logo) return <g />;
          return (
            <foreignObject width={iconSize} height={iconSize} x={props.x - halfIcon} y={props.y - halfIcon}>
              <Img
                src={logo}
                style={{
                  width: iconSize,
                  height: iconSize,
                  borderRadius: halfIcon,
                  transform: assetsWithLeverage.length < 3 ? "rotate(90deg)" : ""
                }}
              />
            </foreignObject>
          );
        }}
      />
    </RadarChart>
  );
};

const RangeChartWrapper: React.FC<IParams> = ({ assetsWithLeverage, showTooltip = true, ...rest }: IParams) => {
  return showTooltip ? (
    <Tooltip
      config={{ placement: "bottom" }}
      content={
        <Column crossAxisSize="max">
          <Text size="medium">
            Range represents the ratio of actual liquidity to virtual liquidity. The farther a token’s point is from the
            center, the higher its actual liquidity.
          </Text>
          <SizedBox height={10} />
          <AssetsList>
            {assetsWithLeverage
              .map((asset) => ({
                ...(TOKENS_BY_ASSET_ID[asset.assetId] ?? {}),
                ...asset
              }))
              .map(({ logo, symbol, reversedLeverage, assetId }, index) => (
                <Row crossAxisSize="max" key={index}>
                  <TokenIcon src={logo} />
                  <SizedBox width={6} />
                  <Text size="medium">
                    {symbol ?? assetId} - {reversedLeverage.toFixed(2)}%
                  </Text>
                </Row>
              ))}
          </AssetsList>
        </Column>
      }
      style={{ cursor: "pointer" }}
    >
      <RangeChart
        assetsWithLeverage={assetsWithLeverage}
        {...rest}
      />
    </Tooltip>
  ) : (
      <RangeChart
        assetsWithLeverage={assetsWithLeverage}
        {...rest}
      />
  );
}

export default RangeChartWrapper;
