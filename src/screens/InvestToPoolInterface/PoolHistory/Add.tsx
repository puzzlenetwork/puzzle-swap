import styled from "@emotion/styled";
import add from "@src/assets/icons/addTransaction.svg";
import Img from "@src/components/Img";

interface IProps {}

const Root = styled.div`
  display: flex;
  flex-direction: row;
`;

const Add: React.FC<IProps> = () => {
  return (
    <Root>
      <Img src={add} alt="add" />
    </Root>
  );
};
export default Add;
