import styled from "@emotion/styled";
import React from "react";
import Input from "@components/Input";
import Text from "@components/Text";
import { observer } from "mobx-react-lite";
import Select from "@components/Select";
import { useStores } from "@src/stores";
import { useAllRanges } from "@screens/Ranges/AllRanges/AllRangesVm";
import Card from "@components/Card";
import SizedBox from "@components/SizedBox";
import { Row } from "@components/Flex";
import Switch from "@components/Switch";

interface IProps {}

const Root = styled(Card)`
  display: grid;
  grid-template-columns: 3fr 1fr 1fr 1fr;
  gap: 12px;
`;

const SearchAndFilterTab: React.FC<IProps> = () => {
  const vm = useAllRanges();
  const { poolsStore } = useStores();
  return (
    <Root>
      <Input
        icon="search"
        placeholder="Search by asset or range name..."
        value={poolsStore.searchValue}
        onChange={(e) => poolsStore.setSearchValue(e.target.value)}
        suffixCondition={poolsStore.searchValue.length > 1}
      />
      <Select
        options={vm.rangesFilters}
        selected={vm.rangesFilters[vm.rangesFilter]}
        onSelect={({ key }) => {
          const index = vm.rangesFilters.findIndex((o) => o.key === key);
          vm.setRangesFilter(index);
        }}
      />
      <Select
        options={vm.rangesFilters}
        selected={vm.rangesFilters[vm.rangesFilter]}
        onSelect={({ key }) => {
          const index = vm.rangesFilters.findIndex((o) => o.key === key);
          vm.setRangesFilter(index);
        }}
      />
      <Row alignItems="center" justifyContent="center" crossAxisSize="max">
        <Text type="secondary" weight={500}>
          Only active ranges
        </Text>
        <SizedBox width={4} />
        <Switch onChange={() => {}} value={false} />
      </Row>
    </Root>
  );
};
export default observer(SearchAndFilterTab);
