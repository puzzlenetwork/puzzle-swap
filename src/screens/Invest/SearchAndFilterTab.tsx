import styled from "@emotion/styled";
import React, { useState } from "react";
import Input from "@components/Input";
import Text from "@components/Text";
import { observer } from "mobx-react-lite";
import { useInvestVM } from "@screens/Invest/InvestVm";
import Divider from "@src/components/Divider";
import SizedBox from "@components/SizedBox";
import Button from "@components/Button";
import { Link } from "react-router-dom";
import { useStores } from "@stores";
import { ReactComponent as Add } from "@src/assets/icons/whiteAdd.svg";
import Select from "@components/Select";
import { Row } from "@src/components/Flex";

interface IProps {}

const Root = styled.div`
  background: #ffffff;
  display: flex;
  flex-direction: column;
  width: 100%;
  border: 1px solid #f1f2fe;
  border-radius: 16px;
  box-sizing: border-box;
`;
const Filters = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px;
  @media (min-width: 880px) {
    padding: 24px;
  }
`;
const Btn = styled(Link)`
  padding: 16px;
  @media (min-width: 880px) {
    padding: 24px;
  }
`;
const Selects = styled(Row)`
  display: flex;
  padding: 0 16px;
  align-items: center;
  box-sizing: border-box;
  //justify-content: space-between;
  @media (min-width: 880px) {
    padding: 0 24px;
  }
`;
const categoriesOptions = [
  { title: "All categories", key: "all" },
  {
    title: "Global coins",
    key: "global",
  },
  { title: "Stablecoins", key: "stable" },
  { title: "Waves DeFi", key: "defi" },
  { title: "Waves Ducks", key: "duck" },
];
const createdByOptions = [
  { title: "Created by all", key: "all" },
  { title: "By community", key: "custom" },
  { title: "By Puzzle Swap", key: "puzzle" },
];
const SearchAndFilterTab: React.FC<IProps> = () => {
  const vm = useInvestVM();
  const { accountStore } = useStores();
  const [activeCategory, setActiveCategory] = useState(categoriesOptions[0]);
  const [activeCreatedOption, setActiveCreatedOption] = useState(
    createdByOptions[0]
  );

  return (
    <Root>
      <Filters>
        <Input
          style={{ height: 40 }}
          icon="search"
          placeholder="Search by title or asset…"
          value={vm.searchValue}
          onChange={(e) => vm.setSearchValue(e.target.value)}
          suffix={
            <Text
              fitContent
              type="secondary"
              style={{ cursor: "pointer" }}
              onClick={() => vm.setSearchValue("")}
            >
              CANCEL
            </Text>
          }
          suffixCondition={vm.searchValue.length > 1}
        />
      </Filters>
      <Selects>
        <Select
          options={categoriesOptions}
          selected={activeCategory}
          onSelect={setActiveCategory}
        />
        <SizedBox width={12} />
        <Select
          options={createdByOptions}
          selected={activeCreatedOption}
          onSelect={setActiveCreatedOption}
        />
      </Selects>
      <SizedBox height={16} />
      <Divider />
      <Btn to={`/${accountStore.ROUTES.POOLS_CREATE}`}>
        <Button size="medium" fixed>
          <Add />
          <SizedBox width={12} />
          Create a pool
        </Button>
      </Btn>
    </Root>
  );
};
export default observer(SearchAndFilterTab);
