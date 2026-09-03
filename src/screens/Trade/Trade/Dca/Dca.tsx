import styled from "@emotion/styled";
import React from "react";
import Card from "@components/Card";
import Text from "@components/Text";
import SizedBox from "@components/SizedBox";
import SettingsHeader from "@screens/Trade/Trade/SettingsHeader";
import { DCA_BOT_URL } from "@src/constants";

interface IProps {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  padding: 0 16px;
  width: 100%;
  max-width: 560px;
`;

const Disclaimer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  box-sizing: border-box;
  padding: 12px 16px;
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.attention100};
  border: 1px solid ${({ theme }) => theme.colors.attention500};
`;

const Frame = styled.iframe`
  width: 100%;
  height: 640px;
  border: 1px solid ${({ theme }) => theme.colors.primary100};
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.card.background};
`;

const ExternalLink = styled.a`
  color: ${({ theme }) => theme.colors.blue500};
  font-weight: 500;
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
`;

const Dca: React.FC<IProps> = ({ ...rest }) => (
  <Root {...rest}>
    <Card style={{ position: "relative" }} paddingDesktop="16px 24px" paddingMobile="16px">
      <SettingsHeader />

      <Disclaimer>
        <Text type="primary" weight={500} size="medium">
          ⚠️ Third-party community project
        </Text>
        <SizedBox height={4} />
        <Text type="secondary" size="small">
          DCA Bot is an independent community project and is not developed, maintained, or audited by Puzzle. Using it is
          at your own risk. Trades your tokens in a defined way — e.g. "Sell 100k XTN to WAVES in 100 batches with a 1
          hour interval".
        </Text>
      </Disclaimer>

      <SizedBox height={16} />

      <Frame
        src={DCA_BOT_URL}
        title="Community DCA Bot"
        loading="lazy"
        referrerPolicy="no-referrer"
        sandbox="allow-scripts allow-forms allow-same-origin allow-popups allow-popups-to-escape-sandbox"
      />

      <SizedBox height={12} />

      <Text type="secondary" size="small" textAlign="center">
        If the bot does not load above, open it directly:{" "}
        <ExternalLink href={DCA_BOT_URL} target="_blank" rel="noopener noreferrer">
          {DCA_BOT_URL.replace(/^https?:\/\//, "")} ↗
        </ExternalLink>
      </Text>
    </Card>

    <SizedBox height={40} />
  </Root>
);

export default Dca;
