import React from "react";
import Dialog from "@components/Dialog";
import { IDialogPropTypes } from "rc-dialog/lib/IDialogPropTypes";
import surf from "@src/assets/nfts/surf.png";
import burj from "@src/assets/nfts/burj.png";
import desert from "@src/assets/nfts/desert.png";
import styled from "@emotion/styled";
import Scrollbar from "@src/components/Scrollbar";
import SizedBox from "@components/SizedBox";

export interface IProps extends IDialogPropTypes {
  onNftClick?: () => void;
}

const nfts = [
  { image: surf, name: "Puzzle Surf" },
  { image: surf, name: "Puzzle Surf" },
  { image: burj, name: "Burj Khalifa" },
  { image: burj, name: "Burj Khalifa" },
  { image: desert, name: "Dubai desert" },
  { image: desert, name: "Dubai desert" },
  { image: desert, name: "Dubai desert" },
];
const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  column-gap: 8px;
  row-gap: 8px;
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
            <NFTPic image={image} key={index + "nft"}>
              <Tag>{name}</Tag>
            </NFTPic>
          ))}
        </Grid>
      </Scrollbar>
      <SizedBox height={24} />
    </Dialog>
  );
};
export default SelectNftDialog;
