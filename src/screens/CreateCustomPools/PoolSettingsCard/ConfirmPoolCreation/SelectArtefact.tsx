import styled from "@emotion/styled";
import React, { useState } from "react";
import SquareTokenIcon from "@components/SquareTokenIcon";
import Text from "@components/Text";
import { Column, Row } from "@src/components/Flex";
import SizedBox from "@components/SizedBox";
import { ReactComponent as Arrow } from "@src/assets/icons/arrowDown.svg";
import SelectNftDialog from "@screens/CreateCustomPools/PoolSettingsCard/ConfirmPoolCreation/SelectNftDialog";

interface IProps {}

const Root = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
`;

const SelectArtefact: React.FC<IProps> = () => {
  const [openNftDialog, setOpenNftDialog] = useState(false);
  return (
    <Root>
      <Row onClick={() => setOpenNftDialog(true)}>
        <SquareTokenIcon />
        <SizedBox width={8} />
        <Column>
          <Text weight={500}>Artefact is not selected</Text>
          <Text type="secondary">You have N artefacts</Text>
        </Column>
      </Row>
      <Arrow style={{ cursor: "pointer" }} />
      <SelectNftDialog
        visible={openNftDialog}
        onClose={() => setOpenNftDialog(false)}
        title="Select NTF"
      />
    </Root>
  );
};
export default SelectArtefact;
