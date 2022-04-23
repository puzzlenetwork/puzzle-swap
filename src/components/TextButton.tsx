import styled from "@emotion/styled";
import Button from "@components/Button";

const TextButton = styled(Button)`
  font-weight: 500;
  font-size: 16px;
  line-height: 24px;
  white-space: nowrap;
  display: flex;
  align-items: center;
  cursor: pointer;
  justify-content: center;
  color: #7075e9;
  background: transparent;
  width: 100%;
  height: auto;
  border: none;
  padding: 0;
  :hover {
    color: #7075e9;
    background: transparent;
    border: none;
  }
`;

export default TextButton;
