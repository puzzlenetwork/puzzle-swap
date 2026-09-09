import styled from "@emotion/styled";
import { Anchor } from "@components/Anchor";
import Text from "@components/Text";
import { CONTRACT_ADDRESSES, DCA, EXPLORER_URL } from "@src/constants";
import React from "react";

const Root = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  box-sizing: border-box;
  padding: 12px 16px;
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.attention100};
  border: 1px solid ${({ theme }) => theme.colors.attention500};

  a {
    color: ${({ theme }) => theme.colors.blue500};
    text-decoration: none;
  }
`;

const DcaDisclaimer: React.FC = () => (
  <Root>
    <Text size="small" type="primary" weight={500}>
      Community project — use at your own risk
    </Text>
    <Text size="small" type="secondary" style={{ marginTop: 4 }}>
      The DCA contract is built and operated by an independent community developer, not by Puzzle. Puzzle does not
      audit, maintain or guarantee it. Your deposit is held by the DCA contract until the schedule finishes or you stop
      the session, and a service account signs every scheduled swap on your behalf. Each swap is routed through the
      Puzzle aggregator, and its output is transferred straight to your wallet.
    </Text>
    <Text size="small" type="secondary" style={{ marginTop: 8 }}>
      <Anchor href={`${EXPLORER_URL}/${CONTRACT_ADDRESSES.dcaBot}`}>Contract</Anchor>
      {" · "}
      <Anchor href={`${EXPLORER_URL}/${DCA.serviceAddress}`}>Service account</Anchor>
      {" · "}
      <Anchor href={DCA.sourceUrl}>Source</Anchor>
    </Text>
  </Root>
);

export default DcaDisclaimer;
