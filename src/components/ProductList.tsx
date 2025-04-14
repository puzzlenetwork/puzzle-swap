import styled from "@emotion/styled";
import React, { HTMLAttributes } from "react";
import { Link } from "react-router-dom";
import Text from "@components/Text";
import { Anchor } from "@components/Anchor";
import { Row } from "./Flex";
import CheckIcon from "@src/assets/links/check.svg"

interface ILinkGroupItem {
  icon: string;
  name: string;
  link: string;
  isExternalLink?: boolean;
  isActive?: boolean
}

interface IProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  links: ILinkGroupItem[];
}

const Root = styled.div`
  width: 160px;
  padding: 10px 10px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;

  & > * {
    margin-bottom: 8px;
  }

  & > :last-child {
    margin-bottom: 0px;
  }
`;

const StyledLink = styled(Link)`
  font-size: 16px;
  line-height: 24px;
  color: ${({ theme }) => theme.colors.primary800};
`;

const StyledAnchor = styled(Anchor)`
  font-size: 16px;
  width: 120px;
  line-height: 24px;
  color: ${({ theme }) => theme.colors.primary800};
`;

const RowLinks = styled(Row)`
  align-items: center;
  gap: 10px;
  padding: 8px 0px;
  justify-content: space-between;
`
const ProductList: React.FC<IProps> = ({ title, links, ...rest }) => {
  return (
    <Root {...rest}>
      {links.map(({ icon, name, link, isExternalLink, isActive }, key) => (
        <RowLinks key={key}>
          <img src={icon} width={24} height={24} style={{opacity: isActive ? 0.4 : 1}}/>
          <StyledAnchor href={link} style={{opacity: isActive ? 0.4 : 1}}>
            {name}
          </StyledAnchor>
          {isActive ? <img src={CheckIcon} /> : <div></div>}
        </RowLinks>
      ))}
    </Root>
  );
};
export default ProductList;
