import React from "react";
import Dialog from "@components/Dialog";
import { IDialogPropTypes } from "rc-dialog/lib/IDialogPropTypes";
import styled from "@emotion/styled";
import Scrollbar from "@src/components/Scrollbar";
import SizedBox from "@components/SizedBox";

export interface IProps extends IDialogPropTypes {
  onNftClick?: () => void;
}

const nfts = [
  {
    image: "http://ipfs.io/ipfs/QmUawQhPVhPitBSRtgd6ZKurseYJ3QWYUhYmV23PS2qL4Y",
    name: "Puzzle Surf",
  },
  {
    image: "http://ipfs.io/ipfs/QmUawQhPVhPitBSRtgd6ZKurseYJ3QWYUhYmV23PS2qL4Y",
    name: "Puzzle Surf",
  },
  {
    image: "http://ipfs.io/ipfs/QmUawQhPVhPitBSRtgd6ZKurseYJ3QWYUhYmV23PS2qL4Y",
    name: "Puzzle Surf",
  },
  {
    image: "http://ipfs.io/ipfs/QmUawQhPVhPitBSRtgd6ZKurseYJ3QWYUhYmV23PS2qL4Y",
    name: "Puzzle Surf",
  },
  {
    image: "http://ipfs.io/ipfs/QmUawQhPVhPitBSRtgd6ZKurseYJ3QWYUhYmV23PS2qL4Y",
    name: "Puzzle Surf",
  },
  {
    image:
      "https://ipfs.io/ipfs/QmckDMscnuYp8shr3NxqbeDJ82V6c1UvWP1ecPAfMkSv2D",
    name: "Burj Khalifa",
  },
  {
    image:
      "https://ipfs.io/ipfs/Qma7Beh9pPkRhgK6WNMQKLHahQDKeKRp5myjv2mx1zv1zm",
    name: "Dubai desert",
  },
];
const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  column-gap: 8px;
  row-gap: 8px;
`;
const Wrap = styled.div`
  display: flex;
  background: #f1f2fe;
  border-radius: 12px;
`;
const NFTPic = styled.div<{ image: string }>`
  ${({ image }) =>
    image != null
      ? `background-image: url(${image});`
      : `background: #C6C9F4;`};
  background-size: cover;
  background-position: center;
  border-radius: 12px;
  width: 152px;
  height: 152px;
  position: relative;
`;
const Tag = styled.div`
  padding: 4px 8px;
  background: #363870;
  border-radius: 6px;
  color: #ffffff;
  position: absolute;
  bottom: 4px;
  left: 8px;
`;
const SelectNftDialog: React.FC<IProps> = ({ children, ...rest }) => {
  return (
    <Dialog style={{ maxWidth: 362 }} bodyStyle={{ maxHeight: 496 }} {...rest}>
      <Scrollbar>
        <Grid>
          {nfts.map(({ image, name }, index) => (
            <Wrap key={index + "nft"}>
              <NFTPic image={image}>
                <Tag>{name}</Tag>
              </NFTPic>
            </Wrap>
          ))}
        </Grid>
      </Scrollbar>
      <SizedBox height={24} />
    </Dialog>
  );
};
export default SelectNftDialog;
