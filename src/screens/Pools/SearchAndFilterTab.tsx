import styled from "@emotion/styled";
import React from "react";
import Input from "@components/Input";
import { observer } from "mobx-react-lite";
import { useInvestVM } from "@screens/Pools/InvestVm";
import Divider from "@src/components/Divider";
import SizedBox from "@components/SizedBox";
import Button from "@components/Button";
import Select from "@components/Select";
import useWindowSize from "@src/hooks/useWindowSize";
import Text from "@components/Text";
import close from "@src/assets/icons/primaryBlue16CloseIcon.svg";
import { Row } from "@src/components/Flex";
import { ROUTES } from "@src/constants";
import { useNavigate } from "react-router-dom";
import Img from "@components/Img";
import { useTheme } from "@emotion/react";
import { useStores } from "@src/stores";

interface IProps {}

const Root = styled.div`
  background: ${({ theme }) => `${theme.colors.white}`};
  display: flex;
  flex-direction: column;
  width: 100%;
  border: 1px solid ${({ theme }) => `${theme.colors.primary100}`};
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
    padding: 24px 18px;
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
const Selects = styled.div`
  display: flex;
  flex-wrap: wrap;
  padding: 0 16px;
  align-items: center;
  box-sizing: border-box;
  @media (min-width: 1080px) {
    padding: 0 0px;
    flex-wrap: nowrap;
    width: 100%;
  }
`;
const StyledRow = styled(Row)`
  flex-wrap: wrap;

  & > :first-of-type {
    margin-bottom: 8px;
  }

  @media (min-width: 380px) {
    & > :first-of-type {
      margin-bottom: 0;
    }
  }
  @media (min-width: 1080px) {
    flex-wrap: nowrap;
  }
`;
const categoriesOptions = [
  { title: "All categories", key: "all" },
  { title: "Stablecoins", key: "stable" },
  { title: "Common", key: "common" },
  { title: "PZ Indexes", key: "pz" },
  { title: "Waves DeFi", key: "defi" },
  // { title: "Waves Ducks", key: "duck" },
  // {
  //   title: "Global coins",
  //   key: "global",
  // },
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
  const { poolsStore } = useStores();
  const navigate = useNavigate();
  const isFiltersChosen =
    vm.poolCategoryFilter !== 0 || vm.customPoolFilter !== 0;
  const handleClearFilters = () => {
    vm.setPoolCategoryFilter(0);
    vm.setCustomPoolFilter(0);
  };
  const theme = useTheme();
  const { width } = useWindowSize();
  return (
    <Root>
      <Filters>
        <InputWrapper>
          <Input
            style={{ height: 40 }}
            icon="search"
            placeholder="Search by title or asset…"
            value={poolsStore.searchValue}
            onChange={(e) => poolsStore.setSearchValue(e.target.value)}
            suffixCondition={poolsStore.searchValue.length > 1}
          />
        </InputWrapper>
      </Filters>
      <Selects>
        <StyledRow mainAxisSize="fit-content">
          {/* <Select
            options={categoriesOptions}
            selected={categoriesOptions[vm.poolCategoryFilter]}
            onSelect={({ key }) => {
              const index = categoriesOptions.findIndex((o) => o.key === key);
              vm.setPoolCategoryFilter(index);
            }}
          /> */}
          <Select
            options={poolsStore.versionOptions}
            selected={poolsStore.versionOptions[poolsStore.versionFilter]}
            onSelect={({ key }) => {
              const index = poolsStore.versionOptions.findIndex(
                (o) => o.key === key
              );
              poolsStore.setVersionFilter(index);
            }}
          />
          <SizedBox width={12} />
          <Select
            options={poolsStore.volumeByTimestamp}
            selected={
              poolsStore.volumeByTimestamp[poolsStore.volumeByTimeFilter]
            }
            onSelect={({ key }) => {
              const index = poolsStore.volumeByTimestamp.findIndex(
                (o) => o.key === key
              );
              poolsStore.setVolumeByTimeFilter(index);
            }}
          />
          <SizedBox width={12} />
        </StyledRow>
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
          <Img src={theme.images.icons.add} alt="add" />
          <SizedBox width={12} />
          Create a pool
        </Button>
      </Btn>
    </Root>
  );
};
export default observer(SearchAndFilterTab);
