import React, { useState } from "react";
import styled from "@emotion/styled";
import { observer } from "mobx-react-lite";
import Dialog from "@components/Dialog";
import { Column, Row } from "@components/Flex";
import Text from "@components/Text";
import Button from "@components/Button";
import { useStores } from "@stores";
import centerEllipsis from "@src/utils/centerEllipsis";

interface Props {
  visible: boolean;
  onClose: () => void;
}

const ModalContent = styled(Column)`
  padding: 24px;
  gap: 20px;
  box-sizing: border-box;

  @media (max-width: 500px) {
    padding: 20px;
    gap: 18px;
  }

  @media (max-width: 400px) {
    padding: 16px;
    gap: 16px;
  }
`;

const ModalHeader = styled(Column)`
  gap: 8px;
`;

const ModalTitle = styled(Text)`
  font-size: 26px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary800};
  letter-spacing: -0.3px;

  @media (max-width: 400px) {
    font-size: 22px;
  }
`;

const ModalSubtitle = styled(Text)`
  font-size: 15px;
  line-height: 22px;
  color: ${({ theme }) => theme.colors.primary650};
`;

const FormGroup = styled(Column)`
  width: 100%;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary800};
`;

const Input = styled.input`
  width: 100%;
  padding: 14px 16px;
  border: 1px solid ${({ theme }) => theme.colors.primary200};
  border-radius: 12px;
  font-size: 15px;
  color: ${({ theme }) => theme.colors.primary800};
  background: ${({ theme }) => theme.colors.white};
  box-sizing: border-box;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #9275CC;
    box-shadow: 0 0 0 3px rgba(146, 117, 204, 0.1);
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.primary650};
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 14px 16px;
  border: 1px solid ${({ theme }) => theme.colors.primary200};
  border-radius: 12px;
  font-size: 15px;
  color: ${({ theme }) => theme.colors.primary800};
  background: ${({ theme }) => theme.colors.white};
  box-sizing: border-box;
  resize: vertical;
  min-height: 140px;
  font-family: inherit;
  line-height: 22px;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #9275CC;
    box-shadow: 0 0 0 3px rgba(146, 117, 204, 0.1);
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.primary650};
  }
`;

const WalletInfo = styled(Row)`
  width: 100%;
  padding: 14px 18px;
  background: linear-gradient(135deg, #9275CC10 0%, #7075E910 100%);
  border: 1px solid #9275CC20;
  border-radius: 12px;
  gap: 12px;
  align-items: center;
  box-sizing: border-box;
  overflow: hidden;

  @media (max-width: 400px) {
    padding: 12px 14px;
    gap: 10px;
  }
`;

const WalletIcon = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, #9275CC 0%, #7075E9 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`;

const WalletLabel = styled(Text)`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.primary650};
`;

const WalletAddress = styled(Text)`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary800};
  font-family: monospace;
  word-break: break-all;
  overflow-wrap: anywhere;

  @media (max-width: 400px) {
    font-size: 13px;
  }
`;

const ButtonsRow = styled(Row)`
  width: 100%;
  gap: 12px;
  margin-top: 4px;

  @media (max-width: 400px) {
    flex-direction: column-reverse;
    gap: 10px;
  }
`;

const CancelButton = styled(Button)`
  flex: 1;
  background: ${({ theme }) => theme.colors.primary100};
  color: ${({ theme }) => theme.colors.primary800};
  border-radius: 12px;
  padding: 14px 24px;
  font-weight: 600;

  &:hover {
    background: ${({ theme }) => theme.colors.primary200};
  }
`;

const SubmitButton = styled(Button)`
  flex: 2;
  background: linear-gradient(135deg, #9275CC 0%, #7075E9 100%);
  border-radius: 12px;
  padding: 14px 24px;
  font-weight: 600;
  box-shadow: 0 4px 16px rgba(146, 117, 204, 0.3);
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(146, 117, 204, 0.4);
  }

  &:disabled {
    background: ${({ theme }) => theme.colors.primary300};
    box-shadow: none;
    cursor: not-allowed;
    transform: none;
  }
`;

const ErrorText = styled(Text)`
  font-size: 13px;
  color: #D66662;
  background: #D6666210;
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid #D6666220;
  word-wrap: break-word;
  overflow-wrap: break-word;
  box-sizing: border-box;
  width: 100%;
`;

const InfoText = styled(Text)`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.primary650};
  line-height: 20px;
`;

const CharCount = styled(Text)<{ isNearLimit?: boolean }>`
  font-size: 12px;
  color: ${({ isNearLimit }) => (isNearLimit ? "#D66662" : "#8082C5")};
  text-align: right;
`;

const HintText = styled(Text)`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.primary650};
`;

const AttachmentsSection = styled(Column)`
  gap: 8px;
  width: 100%;
`;

const AddMoreButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px;
  border: 1px dashed ${({ theme }) => theme.colors.primary300};
  border-radius: 10px;
  background: transparent;
  color: ${({ theme }) => theme.colors.primary650};
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;

  &:hover:not(:disabled) {
    border-color: #9275CC;
    color: #9275CC;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const AttachmentItem = styled(Row)`
  width: 100%;
  padding: 10px 12px;
  background: ${({ theme }) => theme.colors.primary50};
  border: 1px solid ${({ theme }) => theme.colors.primary100};
  border-radius: 10px;
  gap: 10px;
  align-items: center;
  box-sizing: border-box;
`;

const AttachmentLink = styled.a`
  flex: 1;
  font-size: 13px;
  color: #9275CC;
  text-decoration: none;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  &:hover {
    text-decoration: underline;
  }
`;

const RemoveAttachmentButton = styled.button`
  width: 24px;
  height: 24px;
  border-radius: 6px;
  border: none;
  background: ${({ theme }) => theme.colors.primary100};
  color: ${({ theme }) => theme.colors.primary650};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.15s ease;

  &:hover {
    background: #D6666220;
    color: #D66662;
  }
`;

const MAX_DESCRIPTION_LENGTH = 1000;
const MAX_ATTACHMENTS = 5;

const isValidAttachmentUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    const validHosts = ['drive.google.com', 'docs.google.com', 'imgur.com', 'i.imgur.com'];
    return validHosts.includes(parsed.hostname);
  } catch {
    return false;
  }
};

const DriveIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <path d="M8.01 19.03L3.01 10.98L7.99 3H16.01L21 10.98L16.02 19.03H8.01Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    <path d="M3.01 10.98H20.99" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M12 3L16.02 19.03" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);

const CloseSmallIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <path d="M9 3L3 9M3 3L9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const WalletSvg = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path
      d="M15.75 5.25H3.75C3.33579 5.25 3 5.58579 3 6V14.25C3 14.6642 3.33579 15 3.75 15H15.75C16.1642 15 16.5 14.6642 16.5 14.25V6C16.5 5.58579 16.1642 5.25 15.75 5.25Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12.75 10.5C12.75 10.9142 12.4142 11.25 12 11.25C11.5858 11.25 11.25 10.9142 11.25 10.5C11.25 10.0858 11.5858 9.75 12 9.75C12.4142 9.75 12.75 10.0858 12.75 10.5Z"
      fill="currentColor"
    />
    <path
      d="M14.25 5.25V3.75C14.25 3.35218 14.092 2.97064 13.8107 2.68934C13.5294 2.40804 13.1478 2.25 12.75 2.25H4.5C3.90326 2.25 3.33097 2.48705 2.90901 2.90901C2.48705 3.33097 2.25 3.90326 2.25 4.5V13.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const SubmitIdeaModal: React.FC<Props> = ({ visible, onClose }) => {
  const { ideasStore, accountStore } = useStores();
  const [telegram, setTelegram] = useState("");
  const [description, setDescription] = useState("");
  const [attachments, setAttachments] = useState<string[]>([]);
  const [attachmentInput, setAttachmentInput] = useState("");
  const [showAttachmentInput, setShowAttachmentInput] = useState(false);
  const [error, setError] = useState("");

  const handleAddAttachment = () => {
    const url = attachmentInput.trim();
    if (!url) {
      setShowAttachmentInput(false);
      return;
    }

    if (!isValidAttachmentUrl(url)) {
      setError("Only Google Drive and Imgur links are allowed");
      return;
    }

    if (attachments.includes(url)) {
      setError("This link is already added");
      setAttachmentInput("");
      return;
    }

    if (attachments.length >= MAX_ATTACHMENTS) {
      setError(`Maximum ${MAX_ATTACHMENTS} attachments allowed`);
      return;
    }

    setAttachments([...attachments, url]);
    setAttachmentInput("");
    setShowAttachmentInput(false);
    setError("");
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setError("");

    if (!telegram.trim()) {
      setError("Please enter your Telegram username");
      return;
    }

    if (!description.trim()) {
      setError("Please describe your idea");
      return;
    }

    if (description.length > MAX_DESCRIPTION_LENGTH) {
      setError(`Description must be under ${MAX_DESCRIPTION_LENGTH} characters`);
      return;
    }

    const success = await ideasStore.submitIdea({
      telegram: telegram.trim().replace("@", ""),
      description: description.trim(),
      attachments
    });

    if (success) {
      setTelegram("");
      setDescription("");
      setAttachments([]);
      setAttachmentInput("");
      setShowAttachmentInput(false);
      onClose();
    }
  };

  const handleClose = () => {
    setError("");
    setAttachmentInput("");
    setShowAttachmentInput(false);
    onClose();
  };

  const isNearLimit = description.length > MAX_DESCRIPTION_LENGTH * 0.9;

  return (
    <Dialog visible={visible} onClose={handleClose} width={460}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>Submit Your Idea</ModalTitle>
          <ModalSubtitle>
            Help us improve by sharing your suggestions. Ideas that get implemented earn you rewards!
          </ModalSubtitle>
        </ModalHeader>

        <WalletInfo>
          <WalletIcon>
            <WalletSvg />
          </WalletIcon>
          <Column style={{ gap: 2 }}>
            <WalletLabel>Connected Wallet</WalletLabel>
            <WalletAddress>{centerEllipsis(accountStore.address || "", 12)}</WalletAddress>
          </Column>
        </WalletInfo>

        <FormGroup>
          <Label>Telegram Username *</Label>
          <Input
            type="text"
            placeholder="@username"
            value={telegram}
            onChange={(e) => setTelegram(e.target.value)}
          />
          <HintText>We'll contact you here if we need more details</HintText>
        </FormGroup>

        <FormGroup>
          <Label>Your Idea *</Label>
          <TextArea
            placeholder="Describe your idea in detail. What problem does it solve? How should it work?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={MAX_DESCRIPTION_LENGTH + 100}
          />
          <CharCount isNearLimit={isNearLimit}>
            {description.length}/{MAX_DESCRIPTION_LENGTH}
          </CharCount>
        </FormGroup>

        <FormGroup>
          <Label>Attachments (optional)</Label>
          <AttachmentsSection>
            {attachments.map((url, index) => {
              // Extract filename or short ID from URL
              const getShortName = (link: string) => {
                try {
                  const parsed = new URL(link);
                  // Imgur
                  if (parsed.hostname.includes('imgur.com')) {
                    const imgurMatch = link.match(/imgur\.com\/([a-zA-Z0-9]+)/);
                    if (imgurMatch) return `Imgur: ${imgurMatch[1]}`;
                  }
                  // Google Drive
                  const match = link.match(/\/d\/([a-zA-Z0-9_-]+)/);
                  if (match) return `Drive: ...${match[1].slice(-8)}`;
                  const docMatch = link.match(/\/document\/d\/([a-zA-Z0-9_-]+)/);
                  if (docMatch) return `Doc: ...${docMatch[1].slice(-8)}`;
                  return link.length > 35 ? link.slice(0, 32) + '...' : link;
                } catch {
                  return link.length > 35 ? link.slice(0, 32) + '...' : link;
                }
              };
              return (
                <AttachmentItem key={index}>
                  <DriveIcon />
                  <AttachmentLink href={url} target="_blank" rel="noopener noreferrer">
                    {getShortName(url)}
                  </AttachmentLink>
                  <RemoveAttachmentButton onClick={() => handleRemoveAttachment(index)} type="button">
                    <CloseSmallIcon />
                  </RemoveAttachmentButton>
                </AttachmentItem>
              );
            })}
            {showAttachmentInput ? (
              <Input
                type="text"
                placeholder="Paste Google Drive or Imgur link"
                value={attachmentInput}
                onChange={(e) => setAttachmentInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddAttachment();
                  }
                  if (e.key === "Escape") {
                    setAttachmentInput("");
                    setShowAttachmentInput(false);
                  }
                }}
                onBlur={handleAddAttachment}
                autoFocus
              />
            ) : attachments.length < MAX_ATTACHMENTS ? (
              <AddMoreButton type="button" onClick={() => setShowAttachmentInput(true)}>
                + Add link
              </AddMoreButton>
            ) : null}
          </AttachmentsSection>
          <HintText>Google Drive or Imgur ({attachments.length}/{MAX_ATTACHMENTS})</HintText>
        </FormGroup>

        {error && <ErrorText>{error}</ErrorText>}

        <InfoText>
          By submitting, you'll sign a message with your wallet to verify ownership. Your idea will be publicly visible.
        </InfoText>

        <ButtonsRow>
          <CancelButton onClick={handleClose}>Cancel</CancelButton>
          <SubmitButton
            onClick={handleSubmit}
            disabled={ideasStore.submitting || !telegram || !description}
          >
            {ideasStore.submitting ? "Signing..." : "Sign & Submit"}
          </SubmitButton>
        </ButtonsRow>
      </ModalContent>
    </Dialog>
  );
};

export default observer(SubmitIdeaModal);
