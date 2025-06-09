import React, { useState } from "react";
import Text from "@components/Text";
import { useStores } from "@src/stores";
import SizedBox from "@components/SizedBox";
import Table from "@src/components/Table";
import Scrollbar from "@components/Scrollbar";
import { observer } from "mobx-react-lite";
import { Pagination } from "@src/components/Pagination/Pagination";
import { ReactComponent as NotFoundIcon } from "@src/assets/notFound.svg";
import Button from "@components/Button";

const RangesTable: React.FC = () => {
  const [lengthData, setLengthData] = useState(0);
  const { poolsStore, accountStore } = useStores();
  const columns = React.useMemo(
    () => [
      { Header: "Range", accessor: "picture" },
      { Header: "Fact / Virtual Liquidity", accessor: "poolName" },
      { Header: "Earned by LP", accessor: "earnedByLP" },
    ],
    []
  );
  const [filteredRanges, setFilteredRanges] = useState<any[]>([]);

  const changePage = (el: number) => {
    poolsStore.setPagination({ page: el, size: 20 });
  };

  return (
    <>
      {filteredRanges.length > 0 ? (
        <>
          <Scrollbar
            style={{ maxWidth: "calc(100vw - 32px)", borderRadius: 16 }}
          >
            <Table columns={columns} data={filteredRanges} withHover />
          </Scrollbar>
          <Pagination
            currentPage={poolsStore.pagination.page}
            lengthData={lengthData}
            limit={20}
            onChange={changePage}
          />
        </>
      ) : (
        <>
          <SizedBox height={24} />
          <NotFoundIcon style={{ marginBottom: 24 }} />
          <Text size="medium" type="secondary" className="text">
            We are loading the megapools. Sorry for taking so long, please bear
            with us!
          </Text>
          <Button onClick={() => {}}>Cancel the search</Button>
          <SizedBox height={24} />
        </>
      )}
    </>
  );
};
export default observer(RangesTable);
