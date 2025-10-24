import styled from "@emotion/styled";
import React from "react";
import { Row } from "@components/Flex";
import Button from "@components/Button";
import SizedBox from "@components/SizedBox";
import { Banner, BannerContent, BannerTitle, EagleImg } from "./MintRedeem";
import eagle from "@src/assets/eagle.png";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@src/constants";

const ReadyBanner: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Banner type="dark">
      <BannerContent>
        <BannerTitle type="light">Ready to go beyond?</BannerTitle>
        <SizedBox height={16} />
        <Row style={{ gap: "8px", flexWrap: "wrap" }}>
          <Button kind="secondary" size="medium" onClick={() => window.open("https://wavesbridge.io/bridge?from=WAVE&to=UNIT&asset=UNIT0", "_blank")}>
            BRIDGE
          </Button>
          <Button kind="secondary" size="medium" onClick={() => navigate(ROUTES.TRADE)}>
            SWAP
          </Button>
          <Button kind="secondary" size="medium" onClick={() => navigate(ROUTES.RANGES)}>
            LP TO RANGE
          </Button>
        </Row>
      </BannerContent>
      <EagleImg src={eagle} alt="eagle" />
    </Banner>
  );
};

export default ReadyBanner;
