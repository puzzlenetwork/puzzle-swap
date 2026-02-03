import React, { useState } from "react";
import { observer } from "mobx-react-lite";
import styled from "@emotion/styled";
import { Column, Row } from "@components/Flex";
import Text from "@components/Text";
import Button from "@components/Button";
import SizedBox from "@components/SizedBox";
import { useStores } from "@stores";
import { broadcast, waitForTx } from "@waves/waves-transactions";
import { NODE_URL } from "@src/constants";
import { getCustomPublicKey } from "@src/utils/userSettings";
import { LOGIN_TYPE } from "@stores/AccountStore";

const Root = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0 24px;
  box-sizing: border-box;
  width: 100%;
  overflow-x: hidden;
  min-height: 400px;
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 120px;
  padding: 12px;
  border: 1px solid ${({ theme }) => theme.colors.primary100};
  border-radius: 12px;
  font-family: monospace;
  font-size: 12px;
  resize: vertical;
  background: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.primary800};
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.blue500};
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.primary300};
  }
`;

const RadioGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  overflow: hidden;
`;

const RadioLabel = styled.label`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  cursor: pointer;
  min-width: 0;

  input[type="radio"] {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
    margin-top: 2px;
    cursor: pointer;
  }
`;

const AddressText = styled(Text)`
  word-break: break-all;
  font-size: 11px;
`;

const StatusMessage = styled.div<{ type: "success" | "error" | "info" }>`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 12px;
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.4;
  word-break: break-all;

  ${({ type, theme }) => {
    switch (type) {
      case "success":
        return `
          background: rgba(16, 185, 129, 0.1);
          color: #059669;
          border: 1px solid rgba(16, 185, 129, 0.2);
        `;
      case "error":
        return `
          background: rgba(239, 68, 68, 0.1);
          color: ${theme.colors.error550};
          border: 1px solid rgba(239, 68, 68, 0.2);
        `;
      case "info":
        return `
          background: rgba(99, 102, 241, 0.1);
          color: ${theme.colors.blue500};
          border: 1px solid rgba(99, 102, 241, 0.2);
        `;
    }
  }}
`;

const ExplorerLink = styled.a`
  color: inherit;
  text-decoration: underline;

  &:hover {
    opacity: 0.8;
  }
`;

type PublicKeySource = "wallet" | "settings";

const SignTransaction: React.FC = () => {
  const { accountStore } = useStores();
  const [jsonInput, setJsonInput] = useState("");
  const [publicKeySource, setPublicKeySource] = useState<PublicKeySource>("wallet");
  const [status, setStatus] = useState<{ type: "success" | "error" | "info"; message: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const customPublicKey = getCustomPublicKey();
  const hasCustomKey = !!customPublicKey;

  const prepareTransactionData = (tx: Record<string, unknown>): Record<string, unknown> => {
    const txType = tx.type;
    const txFeeAssetId = tx.feeAssetId;

    const {
      id, proofs, height, stateChanges, applicationStatus, spentComplexity,
      timestamp, version, chainId, sender,
      type: _type, feeAssetId: _feeAssetId, feeAsset: _feeAsset,
      ...cleanData
    } = tx;

    if (typeof cleanData.fee === "number") {
      if (txType === 4) {
        const feeInWaves = cleanData.fee / 100000000;
        cleanData.fee = { tokens: feeInWaves.toString(), assetId: txFeeAssetId || "WAVES" };
      } else {
        cleanData.fee = { assetId: txFeeAssetId || "WAVES", amount: cleanData.fee };
      }
    }

    if (txType === 4 && typeof cleanData.amount === "number") {
      const amountInTokens = cleanData.amount / Math.pow(10, 8);
      cleanData.amount = { tokens: amountInTokens.toString(), assetId: cleanData.assetId || "WAVES" };
      delete cleanData.assetId;
    }

    return cleanData;
  };

  const handleSign = async () => {
    if (!jsonInput.trim()) {
      setStatus({ type: "error", message: "Please enter a transaction JSON" });
      return;
    }

    let txData: any;
    try {
      txData = JSON.parse(jsonInput);
    } catch (e) {
      setStatus({ type: "error", message: "Invalid JSON format" });
      return;
    }

    if (!txData.type) {
      setStatus({ type: "error", message: "Transaction must have a 'type' field" });
      return;
    }

    const txType = txData.type;
    const cleanTxData = prepareTransactionData(txData);

    setIsLoading(true);
    setStatus({ type: "info", message: "Please confirm the transaction in your wallet..." });

    try {
      const useCustomKey = publicKeySource === "settings" && hasCustomKey;

      if (!cleanTxData.senderPublicKey && useCustomKey) {
        cleanTxData.senderPublicKey = customPublicKey;
      }

      if (accountStore.loginType === LOGIN_TYPE.KEEPER) {
        // Sign with Keeper
        const signedTx = await (window as any).WavesKeeper.signTransaction({
          type: txType,
          data: cleanTxData
        });
        const parsedTx = JSON.parse(signedTx);
        const result = await broadcast(parsedTx, NODE_URL);
        await waitForTx(result.id, { apiBase: NODE_URL });

        setStatus({
          type: "success",
          message: `Transaction successful! TX ID: ${result.id}`
        });
        setJsonInput("");
      } else if (accountStore.signer) {
        const result = await broadcast(cleanTxData as Parameters<typeof broadcast>[0], NODE_URL);
        await waitForTx(result.id, { apiBase: NODE_URL });

        setStatus({
          type: "success",
          message: `Transaction successful! TX ID: ${result.id}`
        });
        setJsonInput("");
      } else {
        setStatus({ type: "error", message: "No wallet connected. Please connect a wallet first." });
      }
    } catch (e: any) {
      console.error("Transaction error:", e);
      const errorMessage = e?.message || e?.toString() || "Transaction failed";
      setStatus({ type: "error", message: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const txId = status?.type === "success" ? status.message.match(/TX ID: (.+)$/)?.[1] : null;

  return (
    <Root>
      <Text weight={500} size="medium">
        Sign Transaction
      </Text>
      <SizedBox height={8} />
      <Text type="secondary" size="small">
        Paste a transaction JSON to sign and broadcast it to the network.
      </Text>
      <SizedBox height={16} />

      <TextArea
        value={jsonInput}
        onChange={(e) => setJsonInput(e.target.value)}
        placeholder={`{
  "type": 16,
  "dApp": "3P...",
  "call": {
    "function": "functionName",
    "args": []
  },
  "payment": [],
  "fee": 500000
}`}
      />

      <SizedBox height={16} />

      <Text weight={500} size="small">
        Sign with public key:
      </Text>
      <SizedBox height={8} />

      <RadioGroup>
        <RadioLabel>
          <input
            type="radio"
            name="publicKeySource"
            checked={publicKeySource === "wallet"}
            onChange={() => setPublicKeySource("wallet")}
          />
          <Column style={{ minWidth: 0, overflow: "hidden" }}>
            <Text size="small">Connected wallet</Text>
            {accountStore.address && (
              <AddressText type="secondary">
                {accountStore.address}
              </AddressText>
            )}
          </Column>
        </RadioLabel>

        {hasCustomKey && (
          <RadioLabel>
            <input
              type="radio"
              name="publicKeySource"
              checked={publicKeySource === "settings"}
              onChange={() => setPublicKeySource("settings")}
            />
            <Column style={{ minWidth: 0, overflow: "hidden" }}>
              <Text size="small">Smart Account Key</Text>
              <AddressText type="secondary">
                {accountStore.smartAccountAddress}
              </AddressText>
            </Column>
          </RadioLabel>
        )}
      </RadioGroup>

      <SizedBox height={16} />

      <Row>
        <Button
          size="medium"
          onClick={handleSign}
          disabled={isLoading || !jsonInput.trim() || !accountStore.address}
        >
          {isLoading ? "Signing..." : "Sign & Broadcast"}
        </Button>
      </Row>

      {status && (
        <>
          <SizedBox height={16} />
          <StatusMessage type={status.type}>
            {txId ? (
              <span>
                Transaction successful!{" "}
                <ExplorerLink
                  href={`https://wavesexplorer.com/tx/${txId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View on Explorer
                </ExplorerLink>
              </span>
            ) : (
              status.message
            )}
          </StatusMessage>
        </>
      )}

      <SizedBox height={24} />
    </Root>
  );
};

export default observer(SignTransaction);
