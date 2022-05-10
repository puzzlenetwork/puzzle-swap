import styled from "@emotion/styled";
import React, { useState } from "react";
import Card from "@components/Card";
import Text from "@components/Text";
import SizedBox from "@components/SizedBox";
import Notification from "@components/Notification";
import Button from "@components/Button";
import { ReactComponent as Add } from "@src/assets/icons/add.svg";
import { observer } from "mobx-react-lite";
import { useCreateCustomPoolsVM } from "@screens/CreateCustomPools/CreateCustomPoolsVm";
import TokenCompositionRow from "./TokenCompositionRow";
import TokenSelectModal from "@components/TokensSelectModal/TokenSelectModal";
import BN from "@src/utils/BN";
import { TOKENS_BY_SYMBOL } from "@src/constants";

interface IProps {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;
const Grid = styled.div`
  display: grid;
  row-gap: 26px;
  padding: 24px 0;
`;
const SelectsAssets: React.FC<IProps> = () => {
  const [addAssetModal, openAssetModal] = useState(false);
  const vm = useCreateCustomPoolsVM();
  const assetNotification =
    "Please note that the pool must include a PUZZLE asset with at least 2% of pool weight and the maximum of 10 different assets.";
  return (
    <Root>
      <Text type="secondary" weight={500}>
        Select Assets
      </Text>
      <SizedBox height={8} />
      <Card style={{ width: "100%" }}>
        <Notification type="info" text={assetNotification} />
        <Grid>
          {vm.poolsAssets.map(({ asset, share, locked }, index) => {
            const isPuzzle = asset.assetId === TOKENS_BY_SYMBOL.PUZZLE.assetId;
            const minShare = new BN(isPuzzle ? 20 : 5);
            return (
              <TokenCompositionRow
                key={index + "select-asset"}
                locked={locked}
                onLockClick={() => vm.updateLockedState(asset.assetId, !locked)}
                onUpdateAsset={vm.changeAssetInShareInPool}
                balances={vm.tokensToAdd}
                asset={asset}
                share={share}
                setShare={(v) =>
                  vm.changeAssetShareInPool(
                    asset.assetId,
                    v.lte(minShare) ? minShare : v
                  )
                }
                onDelete={() => vm.removeAssetFromPool(asset.assetId)}
                disabled={isPuzzle}
              />
            );
          })}
        </Grid>
        {vm.poolsAssets.length < 10 && (
          <Button
            fixed
            size="medium"
            kind="secondary"
            onClick={() => openAssetModal(true)}
          >
            Add an asset
            <SizedBox width={10} />
            <Add />
          </Button>
        )}
        <TokenSelectModal
          visible={addAssetModal}
          onSelect={vm.addAssetToPool}
          balances={vm.tokensToAdd}
          onClose={() => openAssetModal(!addAssetModal)}
        />
      </Card>
    </Root>
  );
};
export default observer(SelectsAssets);
