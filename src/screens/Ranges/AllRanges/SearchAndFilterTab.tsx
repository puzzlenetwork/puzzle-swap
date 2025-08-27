import Card from "@components/Card";
import { Row } from "@components/Flex";
import Input from "@components/Input";
import Select from "@components/Select";
import SizedBox from "@components/SizedBox";
import Switch from "@components/Switch";
import Text from "@components/Text";
import styled from "@emotion/styled";
import { useAllRangesVm } from "@screens/Ranges/AllRanges/AllRangesVm";
import { observer } from "mobx-react-lite";
import React from "react";

interface IProps {}

const Root = styled(Row)`
  gap: 12px;
  flex-wrap: wrap;
`;

const SearchAndFilterTab: React.FC<IProps> = () => {
  const vm = useAllRangesVm();

  return (
    <Root>
      <Input
        icon="search"
        placeholder="Search by asset or range name..."
        value={vm.searchValue}
        onChange={(e) => vm.setSearchValue(e.target.value)}
        suffixCondition={vm.searchValue.length > 1}
        white
        flexGrow={100}
      />
      <Row style={{ flexGrow: 1, flexWrap: "wrap", gap: 12 }} mainAxisSize="fit-content">
        <Card
          flexGrow={1}
          flexDirection="row"
          alignItems="center"
          fitContent
          paddingDesktop="12px 20px"
          paddingMobile="12px 20px"
        >
          <Text type="secondary" weight={500}>
            Show all prices in USD
          </Text>
          <SizedBox width={12} />
          <Switch onChange={() => vm.setShowPriceInUsd(!vm.showPriceInUsd)} value={vm.showPriceInUsd} />
        </Card>
        <Card
          flexGrow={1}
          flexDirection="row"
          alignItems="center"
          fitContent
          paddingDesktop="12px 20px"
          paddingMobile="12px 20px"
        >
          <Text type="secondary" weight={500}>
            Only active ranges
          </Text>
          <SizedBox width={12} />
          <Switch
            onChange={() => vm.setShowOnlyActiveRanges(!vm.showOnlyActiveRanges)}
            value={vm.showOnlyActiveRanges}
          />
        </Card>
      </Row>
      <Row style={{ flexGrow: 5, flexWrap: "wrap", gap: 12 }} mainAxisSize="fit-content">
        <Card
          flexDirection="row"
          alignItems="center"
          fitContent
          paddingDesktop="12px 20px"
          paddingMobile="12px 20px"
          flexGrow={1}
        >
          <Select
            options={vm.rangesSortings}
            selected={vm.rangesSortings[vm.rangesSorting]}
            onSelect={({ key }) => {
              const index = vm.rangesSortings.findIndex((o) => o.key === key);
              vm.setRangesSorting(index);
            }}
            kind="text"
            fullWidth
          />
        </Card>
        <Card
          flexDirection="row"
          alignItems="center"
          fitContent
          paddingDesktop="12px 20px"
          paddingMobile="12px 20px"
          flexGrow={1}
        >
          <Select
            options={vm.statsRanges}
            selected={vm.statsRanges[vm.selectedStatsRange]}
            onSelect={({ key }) => {
              const index = vm.statsRanges.findIndex((o) => o.key === key);
              vm.setSelectedStatsRange(index);
            }}
            kind="text"
            fullWidth
          />
        </Card>
      </Row>
    </Root>
  );
};
export default observer(SearchAndFilterTab);
