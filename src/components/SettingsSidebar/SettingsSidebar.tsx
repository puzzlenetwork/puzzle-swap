import React, { useState, useEffect } from "react";
import styled from "@emotion/styled";
import { observer } from "mobx-react-lite";
import { useStores } from "@stores";
import { Column, Row } from "@components/Flex";
import Text from "@components/Text";
import Input from "@components/Input";
import Button from "@components/Button";
import TextButton from "@components/TextButton";
import Tooltip from "@components/Tooltip";
import Switch from "@components/Switch";
import { ReactComponent as Close } from "@src/assets/icons/darkClose.svg";
import { ReactComponent as InfoIcon } from "@src/assets/icons/info.svg";
import { ReactComponent as SuccessIcon } from "@src/assets/icons/success.svg";
import { ReactComponent as ErrorIcon } from "@src/assets/icons/error.svg";
import { ReactComponent as SettingsIcon } from "@src/assets/icons/settings.svg";
import { normalizeUrl } from "@src/constants/api";
import { getUserSettings, saveUserSettings, isValidPublicKey, getSmartAccountAddress, IUserSettings, isBearMarketEnabled } from "@src/utils/userSettings";
import axios from "axios";
import { THEME_TYPE } from "@src/themes/ThemeProvider";
import { ReactComponent as SunIcon } from "@src/assets/icons/sun.svg";
import { ReactComponent as MoonIcon } from "@src/assets/icons/moon.svg";

const Overlay = styled.div<{ visible: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  opacity: ${({ visible }) => (visible ? 1 : 0)};
  visibility: ${({ visible }) => (visible ? "visible" : "hidden")};
  transition: opacity 0.3s ease, visibility 0.3s ease;
`;

const Sidebar = styled.div<{ visible: boolean }>`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 400px;
  max-width: 100vw;
  background: ${({ theme }) => theme.colors.white};
  z-index: 1001;
  transform: translateX(${({ visible }) => (visible ? "0" : "100%")});
  transition: transform 0.3s ease;
  display: flex;
  flex-direction: column;
  box-shadow: -4px 0 24px rgba(0, 0, 0, 0.12);

  @media (max-width: 480px) {
    top: auto;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    max-height: 90vh;
    border-radius: 16px 16px 0 0;
    transform: translateY(${({ visible }) => (visible ? "0" : "100%")});
  }
`;

const Header = styled(Row)`
  padding: 16px 24px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.primary100};
  flex-shrink: 0;
`;

const Body = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  min-height: 0;
`;

const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-top: 1px solid ${({ theme }) => theme.colors.primary100};
  flex-shrink: 0;
  background: ${({ theme }) => theme.colors.white};
`;

const Section = styled(Column)`
  margin-bottom: 24px;
  width: 100%;
`;

const SectionTitle = styled(Text)`
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: ${({ theme }) => theme.colors.primary650};
  margin-bottom: 16px;
`;

const NodeInputRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  width: 100%;

  .input-container {
    flex: 1;
    min-width: 0;
  }

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: stretch;

    .input-container {
      width: 100%;
    }
  }
`;

const TestButton = styled(Button)<{ status: "idle" | "testing" | "success" | "error" }>`
  height: 48px;
  min-width: 80px;
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
        `;
      case "error":
        return `
          background: ${theme.colors.error550};
          border-color: ${theme.colors.error550};
          color: white;
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
  margin-top: 8px;

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

const LoadingDots = styled.span`
  &::after {
    content: '...';
    animation: dots 1.4s infinite;
  }

  @keyframes dots {
    0%, 20% { content: '.'; }
    40% { content: '..'; }
    60%, 100% { content: '...'; }
  }
`;

const MobileHandle = styled.div`
  width: 40px;
  height: 4px;
  background: ${({ theme }) => theme.colors.primary300};
  border-radius: 2px;
  margin: 8px auto 0;

  @media (min-width: 481px) {
    display: none;
  }
`;

const ThemeToggle = styled.div<{ isDark: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: ${({ theme, isDark }) => isDark ? theme.colors.primary800 : theme.colors.primary100};
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;

  svg {
    width: 20px;
    height: 20px;
    fill: ${({ isDark }) => isDark ? "#FFD700" : "#7075E9"};
    transition: fill 0.3s ease;
  }

  span {
    font-weight: 500;
    color: ${({ theme, isDark }) => isDark ? theme.colors.white : theme.colors.primary800};
  }

  &:hover {
    transform: scale(1.02);
  }
`;

interface IProps {
  visible: boolean;
  onClose: () => void;
}

const SettingsSidebar: React.FC<IProps> = ({ visible, onClose }) => {
  const { accountStore, poolsStore, rangesStore } = useStores();

  const initData = getUserSettings();
  const [customNode, setCustomNode] = useState(initData?.customNode ?? "");
  const [backendUrl, setBackendUrl] = useState(initData?.backendUrl ?? "");
  const [customPublicKey, setCustomPublicKey] = useState(initData?.customPublicKey ?? "");
  const [bearMarketEnabled, setBearMarketEnabled] = useState(initData?.bearMarketEnabled ?? false);
  const [testStatus, setTestStatus] = useState<"idle" | "testing" | "success" | "error">("idle");
  const [testMessage, setTestMessage] = useState("");
  const [backendTestStatus, setBackendTestStatus] = useState<"idle" | "testing" | "success" | "error">("idle");
  const [backendTestMessage, setBackendTestMessage] = useState("");

  useEffect(() => {
    if (visible) {
      const data = getUserSettings();
      setCustomNode(data?.customNode ?? "");
      setBackendUrl(data?.backendUrl ?? "");
      setCustomPublicKey(data?.customPublicKey ?? "");
      setBearMarketEnabled(data?.bearMarketEnabled ?? false);
      setTestStatus("idle");
      setTestMessage("");
      setBackendTestStatus("idle");
      setBackendTestMessage("");
    }
  }, [visible]);

  const trimmedPublicKey = customPublicKey.trim();
  const isPublicKeyValid = isValidPublicKey(trimmedPublicKey);
  const hasChanges =
    customNode !== (initData?.customNode ?? "") ||
    backendUrl !== (initData?.backendUrl ?? "") ||
    customPublicKey !== (initData?.customPublicKey ?? "") ||
    bearMarketEnabled !== (initData?.bearMarketEnabled ?? false);
  const canSave = hasChanges && isPublicKeyValid;

  const handleSave = () => {
    const publicKeyChanged = trimmedPublicKey !== (initData?.customPublicKey ?? "");
    const settings: IUserSettings = {
      slippage: initData?.slippage ?? 1,
      customNode: customNode.trim(),
      backendUrl: backendUrl.trim(),
      customPublicKey: trimmedPublicKey,
      bearMarketEnabled
    };
    saveUserSettings(settings);

    // Update bear market mode in store for reactive updates
    accountStore.setBearMarketEnabled(bearMarketEnabled);

    if (publicKeyChanged) {
      accountStore.setSmartAccountAddress(getSmartAccountAddress());
      accountStore.updateAccountAssets(true);
      poolsStore.updateInvestedInPoolsInfo(true);
      poolsStore.updatePoolsState();
      rangesStore.syncInvestments();
      rangesStore.syncUserInvestedAmount();
    }

    onClose();
  };

  const handleReset = () => {
    setCustomNode(initData?.customNode ?? "");
    setBackendUrl(initData?.backendUrl ?? "");
    setCustomPublicKey(initData?.customPublicKey ?? "");
    setBearMarketEnabled(initData?.bearMarketEnabled ?? false);
    setTestStatus("idle");
    setTestMessage("");
    setBackendTestStatus("idle");
    setBackendTestMessage("");
  };

  const testNodeConnection = async () => {
    if (!customNode.trim()) {
      setTestStatus("error");
      setTestMessage("Please enter a node URL first");
      return;
    }

    setTestStatus("testing");
    setTestMessage("");

    try {
      const nodeUrl = normalizeUrl(customNode);
      const response = await axios.get(`${nodeUrl}/blocks/height`, { timeout: 10000 });

      if (response.data && typeof response.data.height === 'number') {
        setTestStatus("success");
        setTestMessage(`Connected! Height: ${response.data.height}`);
      } else {
        setTestStatus("error");
        setTestMessage("Invalid response from node");
      }
    } catch (error: any) {
      setTestStatus("error");
      if (error.code === 'ECONNABORTED') {
        setTestMessage("Connection timeout");
      } else if (error.response) {
        setTestMessage(`HTTP ${error.response.status}`);
      } else {
        setTestMessage("Connection failed");
      }
    }
  };

  const testBackendConnection = async () => {
    if (!backendUrl.trim()) {
      setBackendTestStatus("error");
      setBackendTestMessage("Please enter a backend URL first");
      return;
    }

    setBackendTestStatus("testing");
    setBackendTestMessage("");

    try {
      const testBackendUrl = normalizeUrl(backendUrl);
      const response = await axios.get(`${testBackendUrl}/pools/data`, { timeout: 10000 });

      if (response.data) {
        setBackendTestStatus("success");
        setBackendTestMessage("Backend is reachable");
      } else {
        setBackendTestStatus("error");
        setBackendTestMessage("Invalid response");
      }
    } catch (error: any) {
      setBackendTestStatus("error");
      if (error.code === 'ECONNABORTED') {
        setBackendTestMessage("Connection timeout");
      } else if (error.response) {
        setBackendTestMessage(`HTTP ${error.response.status}`);
      } else {
        setBackendTestMessage("Connection failed");
      }
    }
  };

  return (
    <>
      <Overlay visible={visible} onClick={onClose} />
      <Sidebar visible={visible}>
        <MobileHandle />
        <Header alignItems="center" justifyContent="space-between">
          <Row alignItems="center" style={{ gap: 8 }}>
            <Text weight={500} size="medium">Settings</Text>
          </Row>
          <Close onClick={onClose} style={{ cursor: "pointer" }} />
        </Header>

        <Body>
          <Section>
            <SectionTitle weight={500}>Appearance</SectionTitle>
            <ThemeToggle
              isDark={accountStore.selectedTheme === THEME_TYPE.DARK_THEME}
              onClick={() => accountStore.toggleTheme()}
            >
              {accountStore.selectedTheme === THEME_TYPE.DARK_THEME ? <MoonIcon /> : <SunIcon />}
              <span>{accountStore.selectedTheme === THEME_TYPE.DARK_THEME ? "Dark Theme" : "Light Theme"}</span>
            </ThemeToggle>
            <Column crossAxisSize="max" style={{ marginTop: 16 }}>
              <Tooltip
                config={{ placement: "bottom-start", trigger: "click" }}
                content={<Text>Inverse color scheme to red up/green down for bear market preferences.</Text>}
              >
                <Row alignItems="center" justifyContent="space-between" style={{ gap: 8 }}>
                  <Row alignItems="center" style={{ gap: 8 }}>
                    <Text fitContent weight={500}>Bear Market</Text>
                    <InfoIcon style={{ width: 16, height: 16 }} />
                  </Row>
                  <Switch value={bearMarketEnabled} onChange={() => setBearMarketEnabled(!bearMarketEnabled)} />
                </Row>
              </Tooltip>
            </Column>
          </Section>

          <Section>
            <SectionTitle weight={500}>Network</SectionTitle>

            <Column crossAxisSize="max" style={{ marginBottom: 16 }}>
              <Tooltip
                config={{ placement: "bottom-start", trigger: "click" }}
                content={<Text>Custom node URL for blockchain requests</Text>}
              >
                <Row alignItems="center" style={{ marginBottom: 8 }}>
                  <Text fitContent weight={500}>Custom Node URL</Text>
                  <InfoIcon style={{ marginLeft: 8, width: 16, height: 16 }} />
                </Row>
              </Tooltip>
              <NodeInputRow>
                <div className="input-container">
                  <Input
                    value={customNode}
                    onChange={(e) => {
                      setCustomNode(e.target.value);
                      setTestStatus("idle");
                      setTestMessage("");
                    }}
                    placeholder="nodes.wx.network"
                    description=""
                  />
                </div>
                <TestButton
                  size="medium"
                  kind="secondary"
                  onClick={testNodeConnection}
                  disabled={testStatus === "testing" || !customNode.trim()}
                  status={testStatus}
                >
                  {testStatus === "testing" ? <>Test<LoadingDots /></> :
                   testStatus === "success" ? "OK" :
                   testStatus === "error" ? "Fail" : "Test"}
                </TestButton>
              </NodeInputRow>
              {testMessage && (
                <StatusMessage type={testStatus === "success" ? "success" : "error"}>
                  {testStatus === "success" ? <SuccessIcon width={14} height={14} /> : <ErrorIcon width={14} height={14} />}
                  <span>{testMessage}</span>
                </StatusMessage>
              )}
            </Column>

            <Column crossAxisSize="max" style={{ marginBottom: 16 }}>
              <Tooltip
                config={{ placement: "bottom-start", trigger: "click" }}
                content={<Text>Custom backend URL for API requests</Text>}
              >
                <Row alignItems="center" style={{ marginBottom: 8 }}>
                  <Text fitContent weight={500}>Backend URL</Text>
                  <InfoIcon style={{ marginLeft: 8, width: 16, height: 16 }} />
                </Row>
              </Tooltip>
              <NodeInputRow>
                <div className="input-container">
                  <Input
                    value={backendUrl}
                    onChange={(e) => {
                      setBackendUrl(e.target.value);
                      setBackendTestStatus("idle");
                      setBackendTestMessage("");
                    }}
                    placeholder="https://backend.example.com"
                    description=""
                  />
                </div>
                <TestButton
                  size="medium"
                  kind="secondary"
                  onClick={testBackendConnection}
                  disabled={backendTestStatus === "testing" || !backendUrl.trim()}
                  status={backendTestStatus}
                >
                  {backendTestStatus === "testing" ? <>Test<LoadingDots /></> :
                   backendTestStatus === "success" ? "OK" :
                   backendTestStatus === "error" ? "Fail" : "Test"}
                </TestButton>
              </NodeInputRow>
              {backendTestMessage && (
                <StatusMessage type={backendTestStatus === "success" ? "success" : "error"}>
                  {backendTestStatus === "success" ? <SuccessIcon width={14} height={14} /> : <ErrorIcon width={14} height={14} />}
                  <span>{backendTestMessage}</span>
                </StatusMessage>
              )}
              <Text size="small" type="secondary" style={{ marginTop: 8, opacity: 0.7 }}>
                Leave empty to use default
              </Text>
            </Column>
          </Section>

          <Section style={{width:'100%'}}>
            <SectionTitle weight={500}>Smart Account</SectionTitle>
            <Column crossAxisSize="max">
              <Tooltip
                config={{ placement: "bottom-start", trigger: "click" }}
                content={<Text>Public key for smart account signing</Text>}
              >
                <Row alignItems="center" style={{ marginBottom: 8 }}>
                  <Text fitContent weight={500}>Public Key</Text>
                  <InfoIcon style={{ marginLeft: 8, width: 16, height: 16 }} />
                </Row>
              </Tooltip>
              <Input
                value={customPublicKey}
                onChange={(e) => setCustomPublicKey(e.target.value)}
                placeholder="Base58 public key (44 chars)"
                description=""
                error={!!trimmedPublicKey && !isPublicKeyValid}
              />
              {trimmedPublicKey && !isPublicKeyValid && (
                <Text size="small" type="error" style={{ marginTop: 8 }}>
                  Invalid public key format
                </Text>
              )}
              <Text size="small" type="secondary" style={{ marginTop: 8, opacity: 0.7 }}>
                Leave empty for normal wallet
              </Text>
            </Column>
          </Section>
        </Body>

        <Footer>
          <TextButton kind="secondary" weight={500} onClick={handleReset}>
            Reset
          </TextButton>
          <Button size="medium" onClick={handleSave} disabled={!canSave}>
            Save
          </Button>
        </Footer>
      </Sidebar>
    </>
  );
};

export default observer(SettingsSidebar);
