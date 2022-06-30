import statsService, { IArtWork } from "@src/services/statsService";
import RootStore from "@stores/RootStore";
import nodeService, { INFT } from "@src/services/nodeService";
import { makeAutoObservable, reaction } from "mobx";
import { CONTRACT_ADDRESSES, PUZZLE_NFTS } from "@src/constants";

export default class NftStore {
  public rootStore: RootStore;

  public nftPictures: Record<string, string> | null = null;
  private _setNftPictures = (v: Record<string, string>) =>
    (this.nftPictures = v);

  public artworks: IArtWork[] | null = null;
  private _setArtworks = (v: IArtWork[]) => (this.artworks = v);

  public totalPuzzleNftsAmount: number | null = null;
  private _setTotalPuzzleNftsAmount = (v: number) =>
    (this.totalPuzzleNftsAmount = v);

  public stakedAccountNFTs: Array<IArtWork & Partial<INFT>> | null = null;
  public setStakedAccountNFTs = (v: Array<IArtWork & Partial<INFT>> | null) =>
    (this.stakedAccountNFTs = v);

  public accountNFTs: Array<IArtWork & Partial<INFT>> | null = null;
  public setAccountNFTs = (v: Array<IArtWork & Partial<INFT>> | null) =>
    (this.accountNFTs = v);

  get accountNFTsToStake() {
    return (
      this.accountNFTs?.filter(({ description, typeId }) => {
        if (description && typeId) {
          return description.includes(typeId);
        }
        return false;
      }) ?? []
    );
  }

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
    this.syncNftPics().then();
    statsService
      .getArtworks()
      .then((d) => this._setArtworks(d))
      .then(() =>
        Promise.all([
          this.syncAccountNFTs(),
          this.syncAccountNFTsOnStaking(),
          this.getTotalPuzzlesNftsAmount(),
        ])
      );

    reaction(
      () => this.rootStore.accountStore.address,
      () =>
        Promise.all([
          this.syncAccountNFTs(),
          this.syncAccountNFTsOnStaking(),
          this.getTotalPuzzlesNftsAmount(),
        ])
    );
    setInterval(
      () =>
        Promise.all([
          this.syncAccountNFTs(),
          this.syncAccountNFTsOnStaking(),
          this.getTotalPuzzlesNftsAmount(),
        ]),
      40 * 1000
    );
  }

  private getTotalPuzzlesNftsAmount = async () => {
    const res = await nodeService.nodeKeysRequest(
      CONTRACT_ADDRESSES.createArtefacts,
      `total_sold_nft`
    );
    this._setTotalPuzzleNftsAmount(
      res && res[0] && res[0].value ? Number(res[0].value) : 0
    );
  };

  syncAccountNFTs = async () => {
    const { address } = this.rootStore.accountStore;
    const { artworks } = this;
    if (address == null || artworks == null) return;
    const nfts = await nodeService.getAddressNfts(address);
    const supportedPuzzleNft = nfts
      .map((nft) => ({
        ...nft,
        ...(artworks.find(
          ({ typeId }) => typeId && nft.description.includes(typeId)
        ) ?? []),
      }))
      .filter(
        ({ description, typeId }) =>
          typeId && description && description.includes(typeId)
      )
      .map((nft) => {
        const searchTerm = "Issue: ";
        const searchIndex = nft.description?.indexOf(searchTerm) ?? 0;
        if (searchIndex !== -1) {
          const strOut = nft.description?.substr(
            searchIndex + searchTerm.length
          );
          const numberName = `${nft.name} #${strOut}`;
          return { ...nft, name: numberName, old: true };
        }
        let imageLink = PUZZLE_NFTS.find(
          ({ name }) => name === nft.name
        )?.image;
        if (imageLink == null && this.nftPictures != null) {
          imageLink = this.nftPictures[nft.assetId];
        }
        return { ...nft, imageLink };
      });
    this.setAccountNFTs(supportedPuzzleNft);
  };
  syncNftPics = async () => {
    const pics = await nodeService.getNFTPictures();
    const v = pics.reduce((acc, v) => {
      const id = v.key.split("_");
      return { ...acc, [id[1]]: v.value };
    }, {});
    this._setNftPictures(v);
  };

  syncAccountNFTsOnStaking = async () => {
    const { artworks } = this;
    const { address } = this.rootStore.accountStore;
    if (address == null || artworks == null) return;
    const ultra = CONTRACT_ADDRESSES.ultraStaking;

    const allNftOnStaking = await nodeService.getAddressNfts(ultra);
    const addressStakingNft = await nodeService.nodeMatchRequest(
      ultra,
      `address_${address}_nft_(.*)`
    );

    if (addressStakingNft == null) return;
    const stakedNftIds = addressStakingNft?.reduce<string[]>(
      (acc, { key }) => [...acc, key.split("_")[3]],
      []
    );
    if (stakedNftIds?.length === 0) {
      this.setStakedAccountNFTs([]);
      return;
    }
    const supportedPuzzleNft = allNftOnStaking
      .filter(({ assetId }) => stakedNftIds?.some((id) => id === assetId))
      .map((nft) => {
        if (nft.description.toLowerCase().includes("eagle")) {
          const data = artworks?.find(
            ({ name }) => name?.toLowerCase() === "eagle"
          );
          const searchTerm = "Issue: ";
          const searchIndex = nft.description?.indexOf(searchTerm) ?? 0;
          const strOut = nft.description?.substr(
            searchIndex + searchTerm.length
          );
          const numberName = `EAGLE #${strOut}`;
          return { ...nft, ...data, name: numberName };
        }
        if (this.nftPictures != null) {
          const data = artworks?.find(
            ({ name }) => name?.toLowerCase() === "ania"
          );
          const imageLink = this.nftPictures[nft.assetId];
          return { ...nft, name: nft.name, imageLink, ...data };
        }
        return { ...nft };
      });
    console.log(supportedPuzzleNft);
    this.setStakedAccountNFTs(supportedPuzzleNft);
  };
}
