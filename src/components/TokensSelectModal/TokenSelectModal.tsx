import ButtonsGroup from "@components/ButtonsGroup";
import Dialog from "@components/Dialog";
import Input from "@components/Input";
import SizedBox from "@components/SizedBox";
import Text from "@components/Text";
import styled from "@emotion/styled";
import { Column } from "@src/components/Flex";
import Scrollbar from "@src/components/Scrollbar";
import Balance from "@src/entities/Balance";
import useOnClickOutside from "@src/hooks/useOnClickOutside";
import { useStores } from "@stores";
import { observer } from "mobx-react-lite";
import React, { useRef, useState } from "react";
import TokenInfo from "./TokenInfo";

interface IProps {
  onClose: () => void;
  balances: Balance[];
  onSelect: (assetId: string) => void;
  visible: boolean;
  selectedTokenId?: string;
}

const tokenCategories = [
  "All",
  "Favorites",
  // "Global",
  "Stables",
  "Common",
  "PZ LP",
  "Memes"
  // "Waves DeFi",
  // "Waves Ducks",
];

export enum tokenCategoriesEnum {
  all = 0,
  favorites = 1,
  // global = 2,
  // stable = 3,
  // ducks = 4,
  stable = 2,
  common = 3,
  pz = 4,
  // defi = 5,
  meme = 5
}

const Scroll = styled.div`
  display: flex;
  margin: 0 -24px;
  padding: 0 24px 16px 24px;
  overflow-y: scroll;
  -ms-overflow-style: none;
  scrollbar-width: none;

  ::-webkit-scrollbar {
    display: none;
  }

  border-bottom: 1px solid ${({ theme }) => theme.colors.primary100};
`;
const TokenSelectModal: React.FC<IProps> = ({ onClose, balances, onSelect, visible, selectedTokenId }) => {
  const { tokenStore } = useStores();
  const [searchValue, setSearchValue] = useState<string>("");
  const [activeFilter, setActiveFilter] = useState<number>(0);
  const handleSearch = (event: any) => {
    setSearchValue(event.target.value);
  };
  const ref = useRef(null!);
  useOnClickOutside(ref, onClose);

  const handleTokenSelect = (assetId: string) => {
    onSelect(assetId);
    setActiveFilter(0);
    onClose();
  };

  const handleFavoriteToggle = (assetId: string) => {
    if (tokenStore.watchList.includes(assetId)) {
      tokenStore.removeFromWatchList(assetId);
    } else {
      tokenStore.addToWatchList(assetId);
    }
  };

  const filteredTokens = balances
    .filter((v) => {
      if (!v || !v.symbol || !v.name) {
        return false;
      }
      return (
        v.symbol.toLowerCase().includes(searchValue.toLowerCase()) ||
        v.name.toLowerCase().includes(searchValue.toLowerCase())
      );
    })
    .filter((balance) => {
      if (activeFilter === 0) return true;
      if (activeFilter === tokenCategoriesEnum.favorites) {
        return tokenStore.watchList.includes(balance.assetId);
      }
      return balance.category?.includes(tokenCategoriesEnum[activeFilter]);
    });

  // Sort: favorites first, then by balance
  const sortedTokens = [...filteredTokens].sort((a, b) => {
    const aIsFav = tokenStore.watchList.includes(a.assetId);
    const bIsFav = tokenStore.watchList.includes(b.assetId);
    if (aIsFav && !bIsFav) return -1;
    if (!aIsFav && bIsFav) return 1;
    return 0;
  });

  return (
    <Dialog
      visible={visible}
      style={{ maxWidth: 360 }}
      styles={{
        body: { minHeight: 440 }
      }}
      onClose={() => {
        setActiveFilter(0);
        onClose();
      }}
      title="Select a token"
    >
      <Input icon="search" value={searchValue} onChange={handleSearch} placeholder="Search by name or ticker…" />
      <SizedBox height={16} />

      <Scroll>
        <ButtonsGroup values={tokenCategories} active={activeFilter} onClick={(v) => setActiveFilter(v)} />
      </Scroll>
      <SizedBox height={32} />
      <Scrollbar style={{ margin: -24 }}>
        <Column crossAxisSize="max" style={{ maxHeight: 352 }}>
          {sortedTokens && sortedTokens.length > 0 ? (
            sortedTokens.map((t) => {
              const disabled = selectedTokenId === t.assetId;
              return (
                <TokenInfo
                  hidden={disabled}
                  style={{ position: "relative" }}
                  withClickLogic
                  onClick={!disabled ? () => handleTokenSelect(t.assetId) : () => null}
                  key={t.assetId}
                  token={t}
                  isFavorite={tokenStore.watchList.includes(t.assetId)}
                  onFavoriteToggle={handleFavoriteToggle}
                />
              );
            })
          ) : (
            <Text style={{ padding: "10px 24px" }}>No tokens found</Text>
          )}
          <SizedBox height={32} width={16} />
        </Column>
      </Scrollbar>
    </Dialog>
  );
};
export default observer(TokenSelectModal);
