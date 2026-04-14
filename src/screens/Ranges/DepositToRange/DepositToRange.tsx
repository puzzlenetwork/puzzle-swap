import styled from "@emotion/styled";
import React from "react";
import Layout from "@components/Layout";
import { observer } from "mobx-react-lite";
import Text from "@components/Text";
import SizedBox from "@components/SizedBox";
import { DepositToRangeVMProvider, useDepositToRangeVM } from "./DepositToRangeVM";
import DialogNotification from "@components/Dialog/DialogNotification";
import GoBack from "@components/GoBack";
import Card from "@components/Card";
import SwitchButtons from "@components/SwitchButtons";
import { useNavigate, useParams } from "react-router-dom";
import { useStores } from "@stores";
import Loading from "@components/Loading";
import DepositSingleToken from "./DepositSingleToken";
import DepositMultipleTokens from "./DepositMultipleTokens";
import { domainToUrlSafe, urlSafeToOriginalDomain } from "@src/utils/rangeUrlUtils";

const Root = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 16px;
  min-height: 100%;
  margin-bottom: 24px;
  margin-top: 40px;
  width: 100%;
  max-width: calc(560px + 32px);
  box-sizing: border-box;
  @media (min-width: 880px) {
    margin-top: 56px;
  }
`;

const DepositToRangeImpl = observer(() => {
  const vm = useDepositToRangeVM();
  const range = vm.range;

  if (range == null) {
    return <Loading />;
  }

  const depositRoute = `/ranges/${range.address}/deposit`;
  const depositOneTokenRoute = `/ranges/${range.address}/depositOneToken`;
  const pathname = window.location.pathname.toLowerCase();
  const isDepositSingle = pathname.includes("/depositonetoken");
  const isDepositMultiple = pathname.includes(depositRoute.toLowerCase()) && !isDepositSingle;
  const activeTab = isDepositSingle ? 1 : 0;
  const navigate = useNavigate();

  return (
    <Layout>
      <Root>
        <GoBack link={`/ranges/${range.address}/details`} text={`Back to range ${range.domain}`} />
        <SizedBox height={24} />
        <Text weight={500} size="large">
          Deposit liquidity to Range {range.domain}
        </Text>
        <SizedBox height={4} />
        <Text size="medium">Select the method of adding liquidity and enter the amount to provide</Text>
        <SizedBox height={24} />
        <Text weight={500} type="secondary">
          Method
        </Text>
        <SizedBox height={8} />
        <Card>
          <SwitchButtons
            values={["Multiple tokens", "Single Token"]}
            active={activeTab}
            onActivate={(i) => {
              i === 1 ? navigate(depositOneTokenRoute) : navigate(depositRoute);
            }}
          />
        </Card>
        <SizedBox height={24} />
        {isDepositMultiple && <DepositMultipleTokens />}
        {isDepositSingle && <DepositSingleToken />}
        <DialogNotification
          onClose={() => vm.setNotificationParams(null)}
          title={vm.notificationParams?.title ?? ""}
          description={vm.notificationParams?.description}
          buttonsDirection={vm.notificationParams?.buttonsDirection}
          type={vm.notificationParams?.type}
          buttons={vm.notificationParams?.buttons}
          style={{ maxWidth: 360 }}
          visible={vm.notificationParams != null}
        />
      </Root>
    </Layout>
  );
});

const DepositToRange: React.FC = () => {
  const { rangeAddress } = useParams<{ rangeAddress: string }>();
  
  return (
    <DepositToRangeVMProvider rangeAddress={rangeAddress || ""}>
      <DepositToRangeImpl />
    </DepositToRangeVMProvider>
  );
};

export default observer(DepositToRange);
