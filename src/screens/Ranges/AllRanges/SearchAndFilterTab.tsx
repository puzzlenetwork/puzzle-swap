import styled from "@emotion/styled";
import React from "react";
import Input from "@components/Input";
import Text from "@components/Text";
import { observer } from "mobx-react-lite";
import Select from "@components/Select";
import { useStores } from "@src/stores";
import { useAllRangesVm } from "@screens/Ranges/AllRanges/AllRangesVm";
import Card from "@components/Card";
import SizedBox from "@components/SizedBox";
import { Row } from "@components/Flex";
import Switch from "@components/Switch";

interface IProps {}

const Root = styled(Row)`
  gap: 12px;
  flex-wrap: wrap;
`;

const SearchAndFilterTab: React.FC<IProps> = () => {
  const vm = useAllRangesVm();
  const { poolsStore } = useStores();
  return (
    <Root>
      <Input
        icon="search"
        placeholder="Search by asset or range name..."
        value={poolsStore.searchValue}
        onChange={(e) => poolsStore.setSearchValue(e.target.value)}
        suffixCondition={poolsStore.searchValue.length > 1}
        white
        flexGrow={100}
      />
      <Row style={{ flexGrow: 1, flexWrap: "wrap", gap: 12 }} mainAxisSize="fit-content">
        <Card flexGrow={1} flexDirection="row" alignItems="center" fitContent paddingDesktop="12px 20px" paddingMobile="12px 20px">
          <Text type="secondary" weight={500}>
            Show all prices in USD
          </Text>
          <SizedBox width={12} />
          <Switch onChange={() => {}} value={false} />
        </Card>
        <Card flexGrow={1} flexDirection="row" alignItems="center" fitContent paddingDesktop="12px 20px" paddingMobile="12px 20px">
          <Text type="secondary" weight={500}>
            Only active ranges
          </Text>
          <SizedBox width={12} />
          <Switch onChange={() => {}} value={false} />
        </Card>
      </Row>
      <Row style={{ flexGrow: 5, gap: 12 }} mainAxisSize="fit-content">
        <Card flexDirection="row" alignItems="center" fitContent paddingDesktop="12px 20px" paddingMobile="12px 20px" flexGrow={1}>
          <Select
            options={vm.rangesFilters}
            selected={vm.rangesFilters[vm.rangesFilter]}
            onSelect={({ key }) => {
              const index = vm.rangesFilters.findIndex((o) => o.key === key);
              vm.setRangesFilter(index);
            }}
            kind="text"
            fullWidth
          />
        </Card>
        <Card flexDirection="row" alignItems="center" fitContent paddingDesktop="12px 20px" paddingMobile="12px 20px" flexGrow={1}>
          <Select
            options={vm.rangesFilters}
            selected={vm.rangesFilters[vm.rangesFilter]}
            onSelect={({ key }) => {
              const index = vm.rangesFilters.findIndex((o) => o.key === key);
              vm.setRangesFilter(index);
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
