import Button from "@components/Button";
import Dialog from "@components/Dialog";
import Divider from "@components/Divider";
import { Column, Row } from "@components/Flex";
import SizedBox from "@components/SizedBox";
import Text from "@components/Text";
import TextButton from "@components/TextButton";
import Tooltip from "@components/Tooltip";
import styled from "@emotion/styled";
import { usePoolInvestVM } from "./PoolInvestVM";
import MorePoolInformation from "./MorePoolInformation";
import { ReactComponent as CopyIcon } from "@src/assets/icons/darkCopy.svg";
import { ReactComponent as MoreIcon } from "@src/assets/icons/dots.svg";
import { ReactComponent as FacebookIcon } from "@src/assets/icons/facebook.svg";
import linkIcon from "@src/assets/icons/link.svg";
import { ReactComponent as TelegramIcon } from "@src/assets/icons/telegram.svg";
import { ReactComponent as TwitterIcon } from "@src/assets/icons/twitter.svg";
import { EXPLORER_URL } from "@src/constants";
import BN from "@src/utils/BN";
import { useStores } from "@stores";
import copy from "copy-to-clipboard";
import dayjs from "dayjs";
import React, { useState } from "react";

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
  const vm = usePoolInvestVM();
  const [isOpenedDetails, setOpenedDetails] = useState(false);
  const [isOpenedShare, setOpenedShare] = useState(false);
  const puzzlePoolInformation = [
    {
      title: "Pool creator",
      value: (
        <Text size="medium" fitContent nowrap>
          Puzzle Swap
        </Text>
      )
    },
    {
      title: "Smart-contract",
      value: (
        <TextButton
          size="medium"
          prefix={linkIcon}
          kind="secondary"
          onClick={() => window.open(`${EXPLORER_URL}/${vm.pool.address}`)}
        >
          View on Explorer
        </TextButton>
      )
    },
    // {
    //   title: "Total fees earned",
    //   value: vm.pool.statistics?.fees
    //     ? `$ ${vm.pool.globalVolume
    //         ?.times(vm.pool.swapFee)
    //         .div(100)
    //         ?.toFormat(2)}`
    //     : "–",
    // },
    {
      title: "Fees earned (30 days)",
      value: vm.pool.statistics?.totals?.pool_fees_30d
        ? `$ ${new BN(vm.pool.statistics.totals.pool_fees_30d).toFormat(2)}`
        : "–"
    }
  ];
  const customPoolInformation = [
    {
      title: "Smart Contract Version",
      value: vm.pool.version
    },
    {
      title: "Date of creation",
      value: dayjs(vm.pool.createdAt).format("MMM D, YYYY h:mm A")
    },
    // {
    //   title: "Total creator reward",
    //   value: `$ ${vm.pool?.globalEarnedByOwner?.div(1e6).toFormat(2)}`,
    // },
    // {
    //   title: "Total fees earned",
    //   // value: `$ ${vm.pool.globalVolume?.times(0.02)?.toFormat(2) ?? "0.00"}`,
    //   value: `$ ${
    //     vm.pool.globalVolume?.times(vm.pool.swapFee).div(100)?.toFormat(2) ??
    //     "0.00"
    //   }`,
    // },
    {
      title: "Volume (7D)",
      value: vm.pool.statistics?.totals?.volume_7d ? `$${new BN(vm.pool.statistics.totals.volume_7d).toFormat(2)}` : "–"
    },
    {
      title: "Liquidity Providers Fee (7D)",
      value:
        vm.pool.statistics && vm.pool.statistics?.totals?.protocol_fees_7d
          ? `$${new BN(vm.pool.statistics?.totals?.protocol_fees_7d).div(10).times(5).toFormat(2)}`
          : "–"
    },
    {
      title: "Owner Fee (7D)",
      value:
        vm.pool.statistics && vm.pool.statistics?.totals?.protocol_fees_7d
          ? `$${new BN(vm.pool.statistics?.totals?.protocol_fees_7d).div(10).times(1).toFormat(2)}`
          : "–"
    },
    {
      title: "Protocol Fee (7D)",
      value:
        vm.pool.statistics && vm.pool.statistics?.totals?.protocol_fees_7d
          ? `$${new BN(vm.pool.statistics?.totals?.protocol_fees_7d).div(10).times(4).toFormat(2)}`
          : "–"
    },
    {
      title: "Created via",
      value: (
        <TextButton
          size="medium"
          prefix={linkIcon}
          kind="secondary"
          onClick={() => window.open(`${EXPLORER_URL}/transactions/${vm.pool?.artefactOriginTransactionId}`)}
        >
          {vm.nftPaymentName}
        </TextButton>
      )
    }
  ];
  const information = Array.from(vm.pool.isCustom ? customPoolInformation : puzzlePoolInformation);
  const link = `https://swap.puzzle.network/pools/${vm.pool.domain}/invest`;
  const text = `Invest to ${vm.pool.title} Puzzle Swap megapool`;
  const shareInfo = [
    {
      title: "Twitter",
      onClick: () => window.open(`https://twitter.com/intent/tweet?url=${link}&text=${text}`),
      icon: <TwitterIcon />
    },
    {
      title: "Telegram",
      onClick: () => window.open(`https://telegram.me/share/?url=${link}&text=${text}`),
      icon: <TelegramIcon />
    },
    {
      title: "Facebook",
      onClick: () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${link}&quote=${text}`),
      icon: <FacebookIcon />
    },
    {
      title: "Copy link",
      onClick: () => {
        copy(window.location.href);
        notificationStore.notify("Link was copied");
        setOpenedShare(false);
      },
      icon: <CopyIcon />
    }
  ];
  return (
    <>
      <Tooltip
        config={{ placement: "bottom-end", trigger: "click" }}
        content={<MorePoolInformation {...{ setOpenedDetails, setOpenedShare }} />}
      >
        <Root>
          <StyledMoreIcon />
        </Root>
      </Tooltip>
      <Dialog
        style={{ maxWidth: 400 }}
        styles={{
          body: { minHeight: 232 }
        }}
        title={isOpenedDetails ? "Pool information" : "Share"}
        onClose={() => {
          setOpenedDetails(false);
          setOpenedShare(false);
        }}
        visible={isOpenedDetails || isOpenedShare}
      >
        <Column crossAxisSize="max" style={{ maxHeight: 352, padding: "10px 0" }}>
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
                {information.length - 1 !== index && <Divider style={{ margin: "9px 0 10px" }} />}
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
