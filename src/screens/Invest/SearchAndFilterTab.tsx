import styled from "@emotion/styled";
import React, { useState } from "react";
import Input from "@components/Input";
import { observer } from "mobx-react-lite";
import { useInvestVM } from "@screens/Invest/InvestVm";
import Divider from "@src/components/Divider";
import SizedBox from "@components/SizedBox";
import Button from "@components/Button";
import { ReactComponent as Add } from "@src/assets/icons/whiteAdd.svg";
import Select from "@components/Select";
import useWindowSize from "@src/hooks/useWindowSize";
import { useNavigate } from "react-router-dom";
import Text from "@components/Text";
import close from "@src/assets/icons/primaryBlue16CloseIcon.svg";
import { Row } from "@src/components/Flex";
import { ROUTES } from "@src/constants";

interface IProps {}

const Root = styled.div`
  background: #ffffff;
  display: flex;
  flex-direction: column;
  width: 100%;
  border: 1px solid #f1f2fe;
  border-radius: 16px;
  box-sizing: border-box;
  @media (min-width: 1080px) {
    flex-direction: row;
    justify-content: revert;
  }
`;
const Filters = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px;
  @media (min-width: 1080px) {
    padding: 24px;
  }
`;
const Btn = styled.div`
  display: flex;
  padding: 16px;
  width: calc(100% - 32px);
  @media (min-width: 1080px) {
    padding: 24px;
    width: calc(100% - 48px);
    -webkit-justify-content: flex-end;
  }
`;
const Selects = styled.div<{ withThirdElement?: boolean }>`
  display: flex;
  flex-wrap: wrap;
  padding: 0 16px;
  align-items: center;
  box-sizing: border-box;
  @media (min-width: 1080px) {
    padding: 0 24px;
    flex-wrap: nowrap;
    width: 100%;
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
const ClearBtn = styled(Text)`
  margin: 12px 12px 0 12px;
  cursor: pointer;
  white-space: nowrap;
  position: relative;

  @media (min-width: 455px) {
    margin: 0 12px;
  }

  ::after {
    position: absolute;
    right: -20px;
    top: 2px;
    content: url(${close});
  }
`;

const InputWrapper = styled.div`
  display: flex;
  @media (min-width: 1080px) {
    min-width: 340px;
  }
`;
const SearchAndFilterTab: React.FC<IProps> = () => {
  const vm = useInvestVM();
  const [activeCategory, setActiveCategory] = useState(categoriesOptions[0]);
  const [activeCreatedOption, setActiveCreatedOption] = useState(
    createdByOptions[0]
  );
  const isFiltersChosen =
    activeCategory !== categoriesOptions[0] ||
    activeCreatedOption !== createdByOptions[0];
  const handleClearFilters = () => {
    setActiveCategory(categoriesOptions[0]);
    setActiveCreatedOption(createdByOptions[0]);
  };
  const navigate = useNavigate();
  const { width } = useWindowSize();
  return (
    <Root>
      <Filters>
        <InputWrapper>
          <Input
            style={{ height: 40 }}
            icon="search"
            placeholder="Search by title or asset…"
            value={vm.searchValue}
            onChange={(e) => vm.setSearchValue(e.target.value)}
            suffixCondition={vm.searchValue.length > 1}
          />
        </InputWrapper>
      </Filters>
      <Selects withThirdElement={isFiltersChosen}>
        <Row mainAxisSize="fit-content">
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
          <SizedBox width={12} />
        </Row>
        {isFiltersChosen && (
          <ClearBtn
            fitContent
            weight={500}
            type="blue500"
            onClick={handleClearFilters}
          >
            Clear all
          </ClearBtn>
        )}
      </Selects>
      <SizedBox height={16} />
      {width && width <= 1080 && <Divider />}
      <Btn>
        <Button
          size="medium"
          fixed={width != null && width <= 1080}
          onClick={() => navigate(`${ROUTES.POOLS_CREATE}`)}
        >
          <Add />
          <SizedBox width={12} />
          Create a pool
        </Button>
      </Btn>
    </Root>
  );
};
export default observer(SearchAndFilterTab);
