import { Anchor } from "@components/Anchor";
import styled from "@emotion/styled";
import CheckIcon from "@src/assets/links/check.svg";
import React, { HTMLAttributes } from "react";
import { Row } from "./Flex";

interface ILinkGroupItem {
  icon: string;
  name: string;
  link: string;
  isExternalLink?: boolean;
  isActive?: boolean;
  innerLinks?: { name: string; link: string }[];
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
`;

const InnerLink = styled(Anchor)`
  font-size: 14px;
  line-height: 20px;
  color: ${({ theme }) => theme.colors.primary650};
  padding: 4px 0px 4px 34px;
  display: block;
`;

const ProductList: React.FC<IProps> = ({ title, links, ...rest }) => {
  return (
    <Root {...rest}>
      {links.map(({ icon, name, link, isExternalLink, isActive, innerLinks }, key) => (
        <React.Fragment key={key}>
          <RowLinks>
            <img alt={name} src={icon} width={24} height={24} style={{ opacity: isActive ? 0.4 : 1 }} />
            <StyledAnchor href={link} style={{ opacity: isActive ? 0.4 : 1 }}>
              {name}
            </StyledAnchor>
            {isActive ? <img alt={name} src={CheckIcon} /> : <div></div>}
          </RowLinks>
          {innerLinks?.map((innerLink, innerKey) => (
            <InnerLink key={innerKey} href={innerLink.link}>
              {innerLink.name}
            </InnerLink>
          ))}
        </React.Fragment>
      ))}
    </Root>
  );
};
export default ProductList;
