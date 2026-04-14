import styled from "@emotion/styled";
import React, { useState, useEffect } from "react";
import Text from "@components/Text";
import Card from "@components/Card";
import SizedBox from "@components/SizedBox";
import { Row } from "@components/Flex";
import makeNodeRequest from "@src/utils/makeNodeRequest";
import { CONTRACT_ADDRESSES, EXPLORER_URL } from "@src/constants";
import axios from "axios";

import wavesCommanderIcon from "@src/assets/nodes/WavesCommander.png";
import cryptinIcon from "@src/assets/nodes/cryptin.png";
import auraIcon from "@src/assets/nodes/aura.png";
import wavesFunnyNodeIcon from "@src/assets/nodes/WavesFunnyNode.png";
import dodllnodeIcon from "@src/assets/nodes/dodllnode.png";
import puzzleNodeIcon from "@src/assets/nodes/puzzleNode.png";
import subwarIcon from "@src/assets/nodes/subw@r.png";
import elysiumIcon from "@src/assets/nodes/elysium.svg";
import latamNodeIcon from "@src/assets/nodes/latamNode.webp";
import blackTurtleNodeIcon from "@src/assets/nodes/blackTurtleNode.webp";
import wavesLeaseIcon from "@src/assets/nodes/wavesLease.webp";

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

const NodeIcon = styled.img`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  flex-shrink: 0;
`;

const FallbackIcon = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  flex-shrink: 0;
  background: ${({ theme }) => theme.colors.primary300};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary800};
`;

const NodeInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
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

const NODE_ICONS: Record<string, string> = {
  "3P98uUFYSP3jRr76kUAeW96Vb2m4LZhrAAf": wavesFunnyNodeIcon,
  "3PLp1QsFxukK5nnTBYHAqjz9duWMriDkHeT": dodllnodeIcon,
  "3PCrRrwHEjGXFjYtXDsNv78f3Ch3CH3p6V1": puzzleNodeIcon,
  "3PFcMotvQA8vxzA9NFKFBz6AY7GXD1AgXKP": subwarIcon,
  "3PGiSJd2BjDyzR5Z28cgtGB584GjbhUTsdk": wavesCommanderIcon,
  "3PPPTqGUYHJUYqKkRCV3kAS44guun9iN7J8": cryptinIcon,
  "3PP4nrxNnL3xRkMAaUWXnerryUDVEttAurA": auraIcon,
  "3PBM36FThQAReDT3268sz5KCZ6t9BQ83qRg": elysiumIcon,
  "3P8kbUdrXnsrGVnoEhj3qvZwCzv5snQ4zes": latamNodeIcon,
  "3PA1KvFfq9VuJjg45p2ytGgaNjrgnLSgf4r": blackTurtleNodeIcon,
  "3PGfXB5bEz7EkbtGMNUYop5aior5X6bUbvL": wavesLeaseIcon,
};

const NODE_NAMES: Record<string, string> = {
  "3PGfXB5bEz7EkbtGMNUYop5aior5X6bUbvL": "WavesLease",
  "3PGiSJd2BjDyzR5Z28cgtGB584GjbhUTsdk": "WavesCommander",
  "3PA1KvFfq9VuJjg45p2ytGgaNjrgnLSgf4r": "Black Turtle Node",
  "3P98uUFYSP3jRr76kUAeW96Vb2m4LZhrAAf": "WavesFunnyNode",
  "3PBM36FThQAReDT3268sz5KCZ6t9BQ83qRg": "Elysium",
  "3P8kbUdrXnsrGVnoEhj3qvZwCzv5snQ4zes": "LATAM Node",
  "3PPPTqGUYHJUYqKkRCV3kAS44guun9iN7J8": "Cryptin",
  "3PP4nrxNnL3xRkMAaUWXnerryUDVEttAurA": "Aura",
  "3PLp1QsFxukK5nnTBYHAqjz9duWMriDkHeT": "dodllnode",
  "3PCrRrwHEjGXFjYtXDsNv78f3Ch3CH3p6V1": "Puzzle Node",
};

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
        {nodes.map((node) => {
          const displayName = node.name || NODE_NAMES[node.address] || `${node.address.slice(0, 8)}...${node.address.slice(-6)}`;
          return (
          <NodeRow key={node.address}>
            <NodeInfo>
              {NODE_ICONS[node.address] ? (
                <NodeIcon
                  src={NODE_ICONS[node.address]}
                  alt={displayName}
                />
              ) : (
                <FallbackIcon>
                  {displayName[0].toUpperCase()}
                </FallbackIcon>
              )}
              <LinkText
                href={`${EXPLORER_URL}/address/${node.address}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {displayName}
              </LinkText>
            </NodeInfo>
            <WeightBadge>
              {((node.weight / totalWeight) * 100).toFixed(2)}%
            </WeightBadge>
          </NodeRow>
          );
        })}
      </Container>
    </Root>
  );
};

export default PWavesNodes;
