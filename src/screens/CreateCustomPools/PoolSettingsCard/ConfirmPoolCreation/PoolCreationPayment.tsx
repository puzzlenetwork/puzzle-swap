import styled from "@emotion/styled";
import { observer } from "mobx-react-lite";
import React from "react";
import Text from "@components/Text";
import SizedBox from "@components/SizedBox";
import Card from "@components/Card";
import NoPayment from "./NoPayment";
import SelectArtefact from "@screens/CreateCustomPools/PoolSettingsCard/ConfirmPoolCreation/SelectArtefact";
import { useCreateCustomPoolsVM } from "@screens/CreateCustomPools/CreateCustomPoolsVm";
import DialogNotification from "@components/Dialog/DialogNotification";
import Notification from "@components/Notification";
import { useStores } from "@stores";
import BN from "@src/utils/BN";

interface IProps {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
`;

const PoolCreationPayment: React.FC<IProps> = () => {
  const { accountStore } = useStores();
  const { findBalanceByAssetId, TOKENS } = accountStore;
  const puzzleBalance = findBalanceByAssetId(TOKENS.TPUZZLE.assetId);
  const vm = useCreateCustomPoolsVM();
  return (
    <Root>
      <Text type="secondary" weight={500}>
        Payment for creation
      </Text>
      <SizedBox height={8} />
      <Card>
        {vm.isThereArtefacts ? <SelectArtefact /> : <NoPayment />}
        {puzzleBalance &&
          puzzleBalance?.balance?.lt(
            BN.parseUnits(vm.puzzleNFTPrice, puzzleBalance.decimals)
          ) && (
            <>
              <SizedBox height={8} />
              <Notification
                type="warning"
                text="Your Puzzle balance is too low to buy NFT."
              />
            </>
          )}
      </Card>
      <DialogNotification
        onClose={() => vm.setNotificationParams(null)}
        title={vm.notificationParams?.title ?? ""}
        description={vm.notificationParams?.description}
        buttonsDirection={vm.notificationParams?.buttonsDirection}
        type={vm.notificationParams?.type}
        buttons={vm.notificationParams?.buttons}
        style={{ maxWidth: 360 }}
        visible={vm.notificationParams != null}
        icon={vm.notificationParams?.icon}
      />
    </Root>
  );
};
export default observer(PoolCreationPayment);
