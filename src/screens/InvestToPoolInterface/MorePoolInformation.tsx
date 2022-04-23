import styled from "@emotion/styled";
import React, { useState } from "react";
import { Column, Row } from "@src/components/Flex";
import Text from "@src/components/Text";
import share from "@src/assets/icons/share.svg";
import more from "@src/assets/icons/dots.svg";
import SizedBox from "@components/SizedBox";
import Dialog from "@components/Dialog";
import { useInvestToPoolInterfaceVM } from "@screens/InvestToPoolInterface/InvestToPoolInterfaceVM";
import Divider from "@src/components/Divider";
import NakedBtn from "@components/NakedBtn";
import link from "@src/assets/icons/link.svg";
import { ReactComponent as Copy } from "@src/assets/icons/darkCopy.svg";
import { ReactComponent as Placeholder } from "@src/assets/icons/placeholder.svg";
import { useStores } from "@stores";
import Button from "@components/Button";
import copy from "copy-to-clipboard";

interface IProps {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
  padding: 11px;
`;
const Icon = styled.img`
  width: 24px;
  height: 24px;
`;
const MorePoolInformation: React.FC<IProps> = () => {
  const { accountStore } = useStores();
  const { EXPLORER_LINK } = accountStore;
  const vm = useInvestToPoolInterfaceVM();
  const [isOpenedDetails, setOpenedDetails] = useState(false);
  const [isOpenedShare, setOpenedShare] = useState(false);

  const puzzlePoolInformation = [
    {
      title: "Pool creator",
      value: (
        <Text size="medium" fitContent nowrap>
          Puzzle Swap
        </Text>
      ),
    },
    {
      title: "Smart-contract",
      value: (
        <NakedBtn
          size="medium"
          prefix={link}
          kind="secondary"
          onClick={() => window.open(`${EXPLORER_LINK}/123`)}
        >
          View on Explorer
        </NakedBtn>
      ),
    },
    { title: "Date of creation", value: "1 Jan 2022, 20:12:12" },
    { title: "Total fees earned", value: "$ 123,456.99" },
    { title: "Total creator reward", value: "$ 12,456.99" },
  ];
  const customPoolInformation = [
    { title: "Pool creator", value: "" },
    { title: "Created via", value: "" },
    { title: "Smart-contract", value: "" },
    { title: "Date of creation", value: "1 Jan 2022, 20:12:12" },
    { title: "Total fees earned", value: "$ 123,456.99" },
    { title: "Total creator reward", value: "$ 12,456.99" },
  ];
  const information = Array.from(
    vm.pool.isCustom ? customPoolInformation : puzzlePoolInformation
  );

  const shareInfo = [
    { title: "Copy link", onClick: () => copy(window.location.href) },
    {
      title: "Twitter",
      onClick: () =>
        window.open(
          `https://twitter.com/intent/tweet?url=http%3A%2F%2Fgithub.com&text=GitHub`
        ),
    },
    {
      title: "Telegram",
      onClick: () =>
        window.open(
          `https://telegram.me/share/?url=http%3A%2F%2Fgithub.com&text=GitHub`
        ),
    },
    {
      title: "Facebook",
      onClick: () =>
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=http%3A%2F%2Fgithub.com&quote=GitHub`
        ),
    },
  ];
  return (
    <Root>
      <Row
        justifyContent="center"
        alignItems="center"
        style={{ cursor: "pointer" }}
        onClick={() => setOpenedShare(true)}
      >
        <Icon src={share} alt="pic" />
        <SizedBox width={11} />
        <Text>Share on social media</Text>
      </Row>
      <SizedBox height={20} />
      <Row
        justifyContent="center"
        alignItems="center"
        style={{ cursor: "pointer" }}
        onClick={() => setOpenedDetails(true)}
      >
        <Icon src={more} alt="pic" />
        <SizedBox width={11} />
        <Text>More information</Text>
      </Row>
      <Dialog
        style={{ maxWidth: 400 }}
        bodyStyle={{ minHeight: 232 }}
        title={isOpenedDetails ? "Pool information" : "Share"}
        onClose={() => {
          setOpenedDetails(false);
          setOpenedShare(false);
        }}
        visible={isOpenedDetails || isOpenedShare}
      >
        <Column
          crossAxisSize="max"
          style={{ maxHeight: 352, padding: "10px 0" }}
        >
          {isOpenedDetails &&
            information.map(({ title, value }, index) => (
              <React.Fragment key={index + "poolInformation"}>
                <Row justifyContent="space-between">
                  <Text size="medium" type="secondary">
                    {title}
                  </Text>
                  {typeof value === "string" ? (
                    <Text size="medium" fitContent nowrap>
                      {value}
                    </Text>
                  ) : (
                    value
                  )}
                </Row>
                {information.length - 1 !== index && (
                  <Divider style={{ margin: "9px 0 10px" }} />
                )}
              </React.Fragment>
            ))}
          {isOpenedShare &&
            shareInfo.map(({ title, onClick }, index) => (
              <Button
                fixed
                size="medium"
                kind="secondary"
                onClick={onClick}
                key={index + "share-link"}
                style={{ marginBottom: 8 }}
              >
                {index === 0 ? <Copy /> : <Placeholder />}
                <SizedBox width={8} />
                {title}
              </Button>
            ))}
        </Column>
      </Dialog>
    </Root>
  );
};
export default MorePoolInformation;
