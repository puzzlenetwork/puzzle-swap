import styled from "@emotion/styled";
import React, { useState, useEffect } from "react";
import Text from "@components/Text";
import Card from "@components/Card";
import SizedBox from "@components/SizedBox";
import { Row } from "@components/Flex";
import makeNodeRequest from "@src/utils/makeNodeRequest";
import { CONTRACT_ADDRESSES, EXPLORER_URL } from "@src/constants";
import axios from "axios";

const Root = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const Container = styled(Card)`
  display: flex;
  flex-direction: column;
  && {
    padding: 0;
  }
  overflow: hidden;
`;

const NodeRow = styled(Row)`
  justify-content: space-between;
  align-items: center;
  padding: 14px 24px;
  box-sizing: border-box;
  transition: background 0.15s ease-out;

  &:not(:last-child) {
    border-bottom: 1px solid ${({ theme }) => theme.colors.primary100};
  }

  &:hover {
    background: ${({ theme }) => theme.colors.primary100};
  }
`;

const LinkText = styled.a`
  color: ${({ theme }) => theme.colors.blue500};
  text-decoration: none;
  font-size: 13px;
  font-weight: 500;
  transition: opacity 0.15s ease-out;
  cursor: pointer;

  &:hover {
    opacity: 0.8;
    text-decoration: underline;
  }
`;

const WeightBadge = styled.span`
  background: ${({ theme }) => theme.colors.primary100};
  border-radius: 6px;
  padding: 2px 8px;
  font-size: 12px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.primary800};
`;

interface NodeEntry {
  address: string;
  weight: number;
  name: string | null;
}

const PWavesNodes: React.FC = () => {
  const [nodes, setNodes] = useState<NodeEntry[]>([]);

  useEffect(() => {
    const fetchNodes = async () => {
      try {
        const [nodesResponse, wavescapResponse] = await Promise.all([
          makeNodeRequest(
            `/addresses/data/${CONTRACT_ADDRESSES.pWaves}/setup_nodes`
          ),
          axios.get("https://wavescap.com/api/nodes.json").catch(() => null),
        ]);

        const nameMap: Record<string, string> = {};
        if (wavescapResponse?.data?.nodes) {
          for (const node of wavescapResponse.data.nodes) {
            if (node.address && node.name) {
              nameMap[node.address] = node.name;
            }
          }
        }

        const value: string = nodesResponse.data.value;
        const entries: NodeEntry[] = value.split(";").map((entry) => {
          const [address, weight] = entry.split(",");
          return {
            address,
            weight: parseInt(weight),
            name: nameMap[address] || null,
          };
        });
        setNodes(entries);
      } catch (error) {
        console.error("Failed to fetch pWAVES nodes:", error);
      }
    };
    fetchNodes();
  }, []);

  if (nodes.length === 0) return null;

  const totalWeight = nodes.reduce((sum, n) => sum + n.weight, 0);

  return (
    <Root>
      <Text weight={500} type="secondary">
        Leasing nodes
      </Text>
      <SizedBox height={8} />
      <Container>
        {nodes.map((node) => (
          <NodeRow key={node.address}>
            <LinkText
              href={`${EXPLORER_URL}/address/${node.address}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {node.name || `${node.address.slice(0, 8)}...${node.address.slice(-6)}`}
            </LinkText>
            <WeightBadge>
              {((node.weight / totalWeight) * 100).toFixed(0)}%
            </WeightBadge>
          </NodeRow>
        ))}
      </Container>
    </Root>
  );
};

export default PWavesNodes;
