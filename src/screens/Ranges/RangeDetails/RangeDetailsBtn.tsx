import Button from "@components/Button";
import Dialog from "@components/Dialog";
import { Column } from "@components/Flex";
import SizedBox from "@components/SizedBox";
import Tooltip from "@components/Tooltip";
import styled from "@emotion/styled";
import { ReactComponent as CopyIcon } from "@src/assets/icons/darkCopy.svg";
import { ReactComponent as MoreIcon } from "@src/assets/icons/dots.svg";
import { ReactComponent as FacebookIcon } from "@src/assets/icons/facebook.svg";
import { ReactComponent as TelegramIcon } from "@src/assets/icons/telegram.svg";
import { ReactComponent as XIcon } from "@src/assets/links/x.svg";
import { useStores } from "@stores";
import copy from "copy-to-clipboard";
import React, { useState } from "react";
import MoreRangeInformation from "./MoreRangeInformation";
import { useRangeDetailsInterfaceVM } from "./RangeDetailsVM";

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
  const vm = useRangeDetailsInterfaceVM();
  const [isOpenedShare, setOpenedShare] = useState(false);
  const link = vm.range ? `${window.location.origin}/ranges/${vm.range.domain}/details` : `${window.location.origin}/ranges/`;
  const text = `Invest to ${vm.range?.domain ?? ""} Puzzle Network range %0A%0Ahttps://x.com/puzzle_network`;
  const shareInfo = [
    {
      title: "X",
      onClick: () => window.open(`https://x.com/intent/tweet?url=${link}&text=${text}`),
      icon: <XIcon />
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
        content={<MoreRangeInformation setOpenedShare={setOpenedShare} />}
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
        title={"Share"}
        onClose={() => {
          setOpenedShare(false);
        }}
        visible={isOpenedShare}
      >
        <Column crossAxisSize="max" style={{ maxHeight: 352, padding: "10px 0" }}>
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
