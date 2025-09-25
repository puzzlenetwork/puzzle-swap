import Button from "@components/Button";
import Card from "@components/Card";
import Input from "@components/Input";
import SizedBox from "@components/SizedBox";
import Text from "@components/Text";
import TextButton from "@components/TextButton";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import ShareTokenInput from "@screens/CreateCustomPools/PoolSettingsCard/SelectAssets/ShareTokenInput";
import { useSwapVM } from "@screens/Trade/SwapVM";
import { ReactComponent as Close } from "@src/assets/icons/darkClose.svg";
import { ReactComponent as InfoIcon } from "@src/assets/icons/info.svg";
import { ReactComponent as SuccessIcon } from "@src/assets/icons/success.svg";
import { ReactComponent as ErrorIcon } from "@src/assets/icons/error.svg";
import { normalizeUrl } from "@src/constants/api";
import { Column, Row } from "@src/components/Flex";
import Tooltip from "@src/components/Tooltip";
import BN from "@src/utils/BN";
import axios from "axios";
import { observer } from "mobx-react-lite";
import React, { useState } from "react";

interface IProps {}

interface ISettingsStorageData {
  slippage: number;
  customNode?: string;
  backendUrl?: string;
}

const Root = styled(Card)<{ expanded: boolean }>`
  ${({ expanded }) => (!expanded ? "display:none;" : "")}
  position: absolute;
  z-index: 20;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  inset: 0;
`;

const Tag = styled.div<{ active?: boolean }>`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  color: ${({ active, theme }) => (active ? theme.colors.white : theme.colors.primary650)};
  background: ${({ active, theme }) => (active ? theme.colors.blue500 : theme.colors.white)};
  border: 1px solid ${({ active, theme }) => (active ? theme.colors.blue500 : theme.colors.primary100)};
  box-sizing: border-box;
  border-radius: 10px;
  cursor: pointer;
  white-space: nowrap;
  padding: 8px 12px;
  height: 40px;
  @media (min-width: 880px) {
    padding: 8px 20px;
  }
`;

const NodeTestContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const NodeInputRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  
  .input-container {
    flex: 1;
    min-width: 300px;
  }
  
  @media (max-width: 480px) {
    flex-direction: column;
    align-items: stretch;
    
    .input-container {
      min-width: unset;
    }
  }
`;

const TestButton = styled(Button)<{ status: "idle" | "testing" | "success" | "error" }>`
  height: 48px;
  min-width: 80px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  
  ${({ status, theme }) => {
    switch (status) {
      case "testing":
        return `
          background: ${theme.colors.primary300};
          border-color: ${theme.colors.primary300};
          cursor: not-allowed;
        `;
      case "success":
        return `
          background: #10B981;
          border-color: #10B981;
          color: white;
          
          &:hover {
            background: #059669;
            border-color: #059669;
          }
        `;
      case "error":
        return `
          background: ${theme.colors.error550};
          border-color: ${theme.colors.error550};
          color: white;
          
          &:hover {
            background: #DC2626;
            border-color: #DC2626;
          }
        `;
      default:
        return "";
    }
  }}
  
  @media (max-width: 480px) {
    width: 100%;
  }
`;

const StatusMessage = styled.div<{ type: "success" | "error" }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.4;
  transition: all 0.3s ease;
  
  ${({ type, theme }) => 
    type === "success"
      ? `
        background: rgba(16, 185, 129, 0.1);
        color: #059669;
        border: 1px solid rgba(16, 185, 129, 0.2);
      `
      : `
        background: rgba(239, 68, 68, 0.1);
        color: ${theme.colors.error550};
        border: 1px solid rgba(239, 68, 68, 0.2);
      `
  }
`;

const LoadingDots = styled.div`
  display: inline-block;
  
  &::after {
    content: '';
    display: inline-block;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: currentColor;
    animation: loadingDots 1.4s infinite both;
    margin-left: 2px;
  }
  
  @keyframes loadingDots {
    0%, 80%, 100% {
      opacity: 0.3;
      transform: scale(0.8);
    }
    40% {
      opacity: 1;
      transform: scale(1);
    }
  }
`;
const Settings: React.FC<IProps> = () => {
  const vm = useSwapVM();
  const theme = useTheme();
  const storageData = localStorage.getItem("puzzle-user-settings");
  const initData: ISettingsStorageData | null = storageData ? JSON.parse(storageData) : null;
  const initialSlippage = new BN(initData ? initData.slippage : 1).times(10);
  const [slippage, setSlippage] = useState(initialSlippage);
  const [customNode, setCustomNode] = useState(initData?.customNode || "");
  const [backendUrl, setBackendUrl] = useState(initData?.backendUrl || "");
  const [testStatus, setTestStatus] = useState<"idle" | "testing" | "success" | "error">("idle");
  const [testMessage, setTestMessage] = useState("");
  const [backendTestStatus, setBackendTestStatus] = useState<"idle" | "testing" | "success" | "error">("idle");
  const [backendTestMessage, setBackendTestMessage] = useState("");
  const isSomethingChanged = slippage.eq(initialSlippage) && customNode === (initData?.customNode || "") && backendUrl === (initData?.backendUrl || "");
  const handleClose = () => vm.setOpenedSettings(false);
  const validateSlippage = (v: number) =>
    // assuming that slippage is a number in [0,100] as required for percentage
    !isNaN(v) && v > 0 ? Math.min(v, 100) : 1;
  const handleSave = () => {
    localStorage.setItem(
      "puzzle-user-settings",
      JSON.stringify({
        ...initData,
        slippage: validateSlippage(slippage.div(10).toNumber()),
        customNode: customNode.trim(),
        backendUrl: backendUrl.trim()
      })
    );
    handleClose();
  };
  const handleReset = () => {
    setSlippage(initialSlippage);
    setCustomNode(initData?.customNode || "");
    setBackendUrl(initData?.backendUrl || "");
    setTestStatus("idle");
    setTestMessage("");
    setBackendTestStatus("idle");
    setBackendTestMessage("");
    handleClose();
  };

  const testNodeConnection = async () => {
    setBackendTestStatus("idle");
    setBackendTestMessage("");
    if (!customNode.trim()) {
      setTestStatus("error");
      setTestMessage("Please enter a node URL first");
      return;
    }

    setTestStatus("testing");
    setTestMessage("");

    try {
      const nodeUrl = normalizeUrl(customNode);

      const response = await axios.get(`${nodeUrl}/blocks/height`, {
        timeout: 10000
      });

      if (response.data && typeof response.data.height === 'number') {
        setTestStatus("success");
        setTestMessage(`Connection successful! Current height: ${response.data.height}`);
      } else {
        setTestStatus("error");
        setTestMessage("Invalid response from node");
      }
    } catch (error: any) {
      setTestStatus("error");
      if (error.code === 'ECONNABORTED') {
        setTestMessage("Connection timeout");
      } else if (error.response) {
        setTestMessage(`HTTP ${error.response.status}: ${error.response.statusText}`);
      } else if (error.request) {
        setTestMessage("Network error - unable to reach node");
      } else {
        setTestMessage("Connection failed");
      }
    }
  };

  const testBackendConnection = async () => {
    setTestStatus("idle")
    setTestMessage("");
    if (!backendUrl.trim()) {
      setBackendTestStatus("error");
      setBackendTestMessage("Please enter a backend URL first");
      return;
    }

    setBackendTestStatus("testing");
    setBackendTestMessage("");

    try {
      const testBackendUrl = normalizeUrl(backendUrl);

      const response = await axios.get(`${testBackendUrl}/pools/data`, {
        timeout: 10000
      });

      if (response.data) {
        setBackendTestStatus("success");
        setBackendTestMessage("Connection successful! Backend is reachable");
      } else {
        setBackendTestStatus("error");
        setBackendTestMessage("Invalid response from backend");
      }
    } catch (error: any) {
      setBackendTestStatus("error");
      if (error.code === 'ECONNABORTED') {
        setBackendTestMessage("Connection timeout");
      } else if (error.response) {
        setBackendTestMessage(`HTTP ${error.response.status}: ${error.response.statusText}`);
      } else if (error.request) {
        setBackendTestMessage("Network error - unable to reach backend");
      } else {
        setBackendTestMessage("Connection failed");
      }
    }
  };
  return (
    <Root expanded={vm.openedSettings} paddingDesktop="16px 24px" paddingMobile="16px" justifyContent="space-between">
      {/*header*/}
      <Row
        alignItems="center"
        justifyContent="space-between"
        style={{
          borderBottom: `1px solid ${theme.colors.primary100}`,
          paddingBottom: 16
        }}
      >
        <Text weight={500}>Settings</Text>
        <Close onClick={handleClose} style={{ cursor: "pointer" }} />
      </Row>
      <SizedBox height={12} />
      {/*body*/}
      <Column mainAxisSize="stretch">
        <Column crossAxisSize="max">
          <Tooltip
            config={{ placement: "bottom-end", trigger: "click" }}
            content={
              <Text>
                Maximum acceptable % difference between the expected amount of token and the amount you actually receive
                if the token ratio in the pool suddenly change.
              </Text>
            }
          >
            <Row alignItems="center">
              <Text fitContent weight={500}>
                Slippage tolerance
              </Text>
              <InfoIcon style={{ marginLeft: 8 }} />
            </Row>
          </Tooltip>
          <SizedBox height={8} />
          <Row>
            {[1, 3, 5].map((v) => (
              <Tag
                key={v + "percent"}
                onClick={() => setSlippage(new BN(v * 10))}
                active={slippage.eq(new BN(v * 10))}
                style={{ marginRight: 4 }}
              >
                {v} %
              </Tag>
            ))}
            <ShareTokenInput
              amount={slippage}
              onChange={(v) => setSlippage(v)}
              maxValue={new BN(1000)}
              error={slippage.gt(1000)}
            />
          </Row>
        </Column>
        <SizedBox height={24} />
        <Column crossAxisSize="max">
          <Tooltip
            config={{ placement: "bottom-end", trigger: "click" }}
            content={
              <Text>
                Specify a custom node URL to send requests to your own node instead of the default ones. Leave empty to use default nodes.
              </Text>
            }
          >
            <Row alignItems="center">
              <Text fitContent weight={500}>
                Custom Node URL
              </Text>
              <InfoIcon style={{ marginLeft: 8 }} />
            </Row>
          </Tooltip>
          <SizedBox height={8} />
          <NodeTestContainer>
            <NodeInputRow>
              <div className="input-container">
                <Input
                  value={customNode}
                  onChange={(e) => {
                    setCustomNode(e.target.value);
                    setTestStatus("idle");
                    setTestMessage("");
                  }}
                  placeholder="https://your-node.example.com"
                  description=""
                  flexGrow={1}
                />
              </div>
              <TestButton
                size="medium"
                kind="secondary"
                onClick={testNodeConnection}
                disabled={testStatus === "testing" || !customNode.trim()}
                status={testStatus}
              >
                {testStatus === "testing" ? (
                  <>
                    Testing<LoadingDots />
                  </>
                ) : testStatus === "success" ? (
                  "Success"
                ) : testStatus === "error" ? (
                  "Failed"
                ) : (
                  "Test"
                )}
              </TestButton>
            </NodeInputRow>
            
            {testMessage && (
              <StatusMessage type={testStatus === "success" ? "success" : "error"}>
                {testStatus === "success" ? (
                  <SuccessIcon width={16} height={16} />
                ) : (
                  <ErrorIcon width={16} height={16} />
                )}
                <span>{testMessage}</span>
              </StatusMessage>
            )}
            
            {!customNode.trim() && (
              <Text size="small" type="secondary" style={{ opacity: 0.7 }}>
                Leave empty to use default nodes
              </Text>
            )}
          </NodeTestContainer>
        </Column>
        <SizedBox height={12} />
        <Column crossAxisSize="max">
          <Tooltip
            config={{ placement: "bottom-end", trigger: "click" }}
            content={
              <Text>
                Specify a custom backend URL to send API requests to your own backend instead of the default one. Leave empty to use default backend.
              </Text>
            }
          >
            <Row alignItems="center">
              <Text fitContent weight={500}>
                Backend URL
              </Text>
              <InfoIcon style={{ marginLeft: 8 }} />
            </Row>
          </Tooltip>
          <SizedBox height={8} />
          <NodeTestContainer>
            <NodeInputRow>
              <div className="input-container">
                <Input
                  value={backendUrl}
                  onChange={(e) => {
                    setBackendUrl(e.target.value);
                    setBackendTestStatus("idle");
                    setBackendTestMessage("");
                  }}
                  placeholder="https://your-node.example.com"
                  description=""
                  flexGrow={1}
                />
              </div>
              <TestButton
                size="medium"
                kind="secondary"
                onClick={testBackendConnection}
                disabled={backendTestStatus === "testing" || !backendUrl.trim()}
                status={backendTestStatus}
              >
                {backendTestStatus === "testing" ? (
                  <>
                    Testing<LoadingDots />
                  </>
                ) : backendTestStatus === "success" ? (
                  "Success"
                ) : backendTestStatus === "error" ? (
                  "Failed"
                ) : (
                  "Test"
                )}
              </TestButton>
            </NodeInputRow>
            
            {backendTestMessage && (
              <StatusMessage type={backendTestStatus === "success" ? "success" : "error"}>
                {backendTestStatus === "success" ? (
                  <SuccessIcon width={16} height={16} />
                ) : (
                  <ErrorIcon width={16} height={16} />
                )}
                <span>{backendTestMessage}</span>
              </StatusMessage>
            )}
            
            {!backendUrl.trim() && (
              <Text size="small" type="secondary" style={{ opacity: 0.7 }}>
                Leave empty to use default backend from environment
              </Text>
            )}
          </NodeTestContainer>
        </Column>
        <SizedBox height={12} />
      </Column>
      {/*footer*/}
      <Row
        alignItems="center"
        justifyContent="space-between"
        style={{
          borderTop: `1px solid ${theme.colors.primary100}`,
          paddingTop: 16
        }}
      >
        <TextButton kind="secondary" weight={500} onClick={handleReset}>
          Reset
        </TextButton>
        <Button size="medium" onClick={handleSave} disabled={isSomethingChanged || slippage.gt(1000)}>
          Save
        </Button>
      </Row>
    </Root>
  );
};
export default observer(Settings);
