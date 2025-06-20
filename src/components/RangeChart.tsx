import Img from "@src/components/Img";
import RadarWithImage from "@src/components/RadarWithImage";
import { TOKENS_BY_ASSET_ID } from "@src/constants";
import { Range } from "@src/entities/Range";
import { RadarChart, PolarGrid, Radar, PolarAngleAxis } from "recharts";
import radarBg from "@src/assets/radar_bg.svg";
import Tooltip from "@components/Tooltip";
import { Column, Row } from "@components/Flex";
import Text from "@components/Text";
import SizedBox from "./SizedBox";
import styled from "@emotion/styled";

interface IParams {
  range: Range;
  size: number;
  index?: number;
}

const AssetsList = styled.div`
  display: grid;
  gap: 8px;
  grid-template-columns: repeat(2, 1fr);
`

const TokenIcon = styled(Img)`
  width: 20px;
  height: 20px;
  border-radius: 50%;
`;

const RangeChart = ({ range, size, index }: IParams) => {
  const iconSize = size / 7.5;
  const halfIcon = iconSize / 2;

  return (
    <Tooltip config={{ placement: "bottom" }} content={
      <Column crossAxisSize="max">
        <Text size="medium">Range represents the ratio of actual liquidity to virtual liquidity. The farther a token’s point is from the center, the higher its actual liquidity.</Text>
        <SizedBox height={10} />
        <AssetsList>{
          range.assetsWithLeverage
            .map((asset) => ({ ...TOKENS_BY_ASSET_ID[asset.assetId], ...asset }))
            .map(({ logo, symbol, leverage }, index) => <Row crossAxisSize="max" key={index}><TokenIcon src={logo} /><SizedBox width={6} /><Text size="medium">{symbol} - {leverage.toFixed(2)}%</Text></Row>)
        }</AssetsList>
      </Column>
    }>
      <RadarChart width={size} height={size} data={range.assetsWithLeverage} style={{ transform: range.assetsWithLeverage.length < 3 ? "rotate(-90deg)" : "" }}>
        <PolarGrid />
        <Radar
          dataKey="relativeLeverage"
          shape={(props) =>
            <RadarWithImage
              imageElement={<Img src={radarBg} />}
              uniqueId={"allranges_" + index}
              {...props}
            />
          }
        />
        <PolarAngleAxis
          dataKey="assetId"
          tick={(props) => (
            <foreignObject width={iconSize} height={iconSize} x={props.x - halfIcon} y={props.y - halfIcon}>
              <Img src={TOKENS_BY_ASSET_ID[props.payload.value].logo} style={{ width: iconSize, height: iconSize, borderRadius: halfIcon, transform: range.assetsWithLeverage.length < 3 ? "rotate(90deg)" : "" }} />
            </foreignObject>
          )}
        />
      </RadarChart>
    </Tooltip>
  )
}

export default RangeChart;
