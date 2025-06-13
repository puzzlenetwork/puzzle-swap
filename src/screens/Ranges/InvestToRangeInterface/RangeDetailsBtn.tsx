import styled from "@emotion/styled";
import React, { JSX, useState } from "react";
import Tooltip from "@components/Tooltip";
import MoreRangeInformation from "./MoreRangeInformation";
import { ReactComponent as MoreIcon } from "@src/assets/icons/dots.svg";
import Dialog from "@components/Dialog";
import { Column, Row } from "@components/Flex";
import Text from "@components/Text";
import Divider from "@components/Divider";
import Button from "@components/Button";
import SizedBox from "@components/SizedBox";
import { useStores } from "@stores";
import { useInvestToRangeInterfaceVM } from "./RangeDetailsVM";
import TextButton from "@components/TextButton";
import linkIcon from "@src/assets/icons/link.svg";
import copy from "copy-to-clipboard";
import { ReactComponent as CopyIcon } from "@src/assets/icons/darkCopy.svg";
import { ReactComponent as XIcon } from "@src/assets/links/x.svg";
import { ReactComponent as TelegramIcon } from "@src/assets/icons/telegram.svg";
import { ReactComponent as FacebookIcon } from "@src/assets/icons/facebook.svg";
import { EXPLORER_URL } from "@src/constants";
import dayjs from "dayjs";

interface IProps {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
  background: transparent;
  border: 1px solid #8082c5;
  padding: 7px;
  box-sizing: border-box;
  border-radius: 10px;
  cursor: pointer;

  :hover {
    background: #8082c5;
  }
`;

const StyledMoreIcon = styled(MoreIcon)`
  path {
    stroke: #ffffff;
  }
`;

const TransparentDetailsBtn: React.FC<IProps> = () => {
  const { notificationStore } = useStores();
  const vm = useInvestToRangeInterfaceVM();
  const [isOpenedDetails, setOpenedDetails] = useState(false);
  const [isOpenedShare, setOpenedShare] = useState(false);
  const puzzleRangeInformation = [
    {
      title: "Range creator",
      value: (
        <Text size="medium" fitContent nowrap>
          Puzzle Swap
        </Text>
      ),
    },
    {
      title: "Smart-contract",
      value: (
        <TextButton
          size="medium"
          prefix={linkIcon}
          kind="secondary"
          onClick={() =>
            window.open(`${EXPLORER_URL}/address/${vm.range!.address}`)
          }
        >
          View on Explorer
        </TextButton>
      ),
    },
    {
      title: "Total fees earned",
      value: `$ ${vm.range!.stats.poolFees?.toFormat(2)}`,
    },
  ];
  const customRangeInformation = [
    {
      title: "Smart Contract Version",
      value: vm.range!.version,
    },
    {
      title: "Date of creation",
      value: dayjs(vm.range!.createdAt).format("MMM D, YYYY h:mm A"),
    },
    {
      title: "Total creator reward",
      value: `$ ${vm.range!.stats.ownerFees.div(1e6).toFormat(2)}`,
    },
    {
      title: "Total fees earned",
      value: `$ ${
        vm.range!.stats.volume.times(vm.range!.swapFee).div(100)?.toFormat(2) ??
        "0.00"
      }`,
    },
    // {
    //   title: "Created via",
    //   value: (
    //     <TextButton
    //       size="medium"
    //       prefix={linkIcon}
    //       kind="secondary"
    //       onClick={() =>
    //         window.open(
    //           `${EXPLORER_URL}/transactions/${vm.range?.artefactOriginTransactionId}`
    //         )
    //       }
    //     >
    //       {vm.nftPaymentName}
    //     </TextButton>
    //   ),
    // },
  ];
  const information = Array.from(
    vm.range?.isCustom
      ? customRangeInformation as { title: string; value: string | JSX.Element }[]
      : puzzleRangeInformation as { title: string; value: string | JSX.Element }[]
  );
  const link = `https://swap.puzzle.network/ranges/${vm.range!.address}/invest`;
  const text = `Invest to ${vm.range!.title} Puzzle Swap range`;
  const shareInfo = [
    {
      title: "X",
      onClick: () =>
        window.open(
          `https://x.com/intent/tweet?url=${link}&text=${text}`
        ),
      icon: <XIcon />,
    },
    {
      title: "Telegram",
      onClick: () =>
        window.open(`https://telegram.me/share/?url=${link}&text=${text}`),
      icon: <TelegramIcon />,
    },
    {
      title: "Facebook",
      onClick: () =>
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${link}&quote=${text}`
        ),
      icon: <FacebookIcon />,
    },
    {
      title: "Copy link",
      onClick: () => {
        copy(window.location.href);
        notificationStore.notify("Link was copied");
        setOpenedShare(false);
      },
      icon: <CopyIcon />,
    },
  ];
  return (
    <>
      <Tooltip
        config={{ placement: "bottom-end", trigger: "click" }}
        content={
          <MoreRangeInformation {...{ setOpenedDetails, setOpenedShare }} />
        }
      >
        <Root>
          <StyledMoreIcon />
        </Root>
      </Tooltip>
      <Dialog
        style={{ maxWidth: 400 }}
        bodyStyle={{ minHeight: 232 }}
        title={isOpenedDetails ? "Range information" : "Share"}
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
              <React.Fragment key={index + "rangeInformation"}>
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
            shareInfo.map(({ title, onClick, icon }, index) => (
              <Button
                fixed
                size="medium"
                kind="secondary"
                onClick={onClick}
                key={index + "share-link"}
                style={{ marginBottom: 8 }}
              >
                {title}
                <SizedBox width={8} />
                {icon}
              </Button>
            ))}
        </Column>
      </Dialog>
    </>
  );
};
export default TransparentDetailsBtn;
