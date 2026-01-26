import RootStore from "@stores/RootStore";
import { makeAutoObservable, runInAction } from "mobx";
import { IIdea, IDeveloper, IDEA_STATUS, IDEAS_API_URL } from "@src/constants";

export interface ISubmitIdeaParams {
  telegram: string;
  description: string;
  screenshots?: string[];
  attachments?: string[];
}

class IdeasStore {
  public readonly rootStore: RootStore;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }

  ideas: IIdea[] = [];
  setIdeas = (ideas: IIdea[]) => (this.ideas = ideas);

  myIdeas: IIdea[] = [];
  setMyIdeas = (ideas: IIdea[]) => (this.myIdeas = ideas);

  // Leaderboard data for current user (rank only)
  myRank: number = 0;
  setMyRank = (rank: number) => (this.myRank = rank);

  // Full leaderboard data
  leaderboard: Array<{ address: string; totalPoints: number; completedIdeas: number; totalPaid: number }> = [];
  setLeaderboard = (data: typeof this.leaderboard) => (this.leaderboard = data);
  leaderboardLoading = false;
  setLeaderboardLoading = (v: boolean) => (this.leaderboardLoading = v);

  // Global platform stats
  globalStats: { totalIdeas: number; completedIdeas: number; totalPaid: number } | null = null;
  setGlobalStats = (stats: typeof this.globalStats) => (this.globalStats = stats);

  // Developers list for assignment (active only)
  developers: IDeveloper[] = [];
  setDevelopers = (devs: IDeveloper[]) => (this.developers = devs);

  // All developers including hidden (for showing assignee names)
  allDevelopers: IDeveloper[] = [];
  setAllDevelopers = (devs: IDeveloper[]) => (this.allDevelopers = devs);

  loading = false;
  setLoading = (v: boolean) => (this.loading = v);

  submitting = false;
  setSubmitting = (v: boolean) => (this.submitting = v);

  submitModalOpen = false;
  setSubmitModalOpen = (v: boolean) => (this.submitModalOpen = v);

  fetchIdeas = async () => {
    this.setLoading(true);
    try {
      const response = await fetch(`${IDEAS_API_URL}/ideas`);
      if (!response.ok) throw new Error("Failed to fetch ideas");
      const data = await response.json();
      runInAction(() => {
        this.setIdeas(data.ideas || []);
      });
    } catch (error) {
      console.error("Error fetching ideas:", error);
      this.rootStore.notificationStore.notify("Failed to load ideas", {
        type: "danger",
        title: "Error"
      });
    } finally {
      this.setLoading(false);
    }
  };

  fetchMyIdeas = async () => {
    const { address } = this.rootStore.accountStore;
    if (!address) {
      this.setMyIdeas([]);
      this.setMyRank(0);
      return;
    }

    try {
      const response = await fetch(`${IDEAS_API_URL}/ideas/user/${address}`);
      if (!response.ok) throw new Error("Failed to fetch user ideas");
      const data = await response.json();
      runInAction(() => {
        this.setMyIdeas(data.ideas || []);
      });

      // Fetch user's rank
      await this.fetchMyRank();
    } catch (error) {
      console.error("Error fetching user ideas:", error);
    }
  };

  fetchGlobalStats = async () => {
    try {
      const response = await fetch(`${IDEAS_API_URL}/ideas/stats`);
      if (!response.ok) throw new Error("Failed to fetch stats");
      const data = await response.json();
      runInAction(() => {
        this.setGlobalStats({
          totalIdeas: data.totalIdeas || 0,
          completedIdeas: data.completedIdeas || 0,
          totalPaid: data.totalPaid || 0
        });
      });
    } catch (error) {
      console.error("Error fetching global stats:", error);
    }
  };

  fetchMyRank = async () => {
    const { address } = this.rootStore.accountStore;
    if (!address) {
      this.setMyRank(0);
      return;
    }

    try {
      const response = await fetch(`${IDEAS_API_URL}/ideas/leaderboard`);
      if (!response.ok) throw new Error("Failed to fetch leaderboard");
      const data = await response.json();
      const leaderboard = data.leaderboard || [];

      const myIndex = leaderboard.findIndex(
        (entry: any) => entry.address.toLowerCase() === address.toLowerCase()
      );

      runInAction(() => {
        this.setMyRank(myIndex !== -1 ? myIndex + 1 : 0);
      });
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    }
  };

  fetchLeaderboard = async () => {
    this.setLeaderboardLoading(true);
    try {
      const response = await fetch(`${IDEAS_API_URL}/ideas/leaderboard`);
      if (!response.ok) throw new Error("Failed to fetch leaderboard");
      const data = await response.json();
      runInAction(() => {
        this.setLeaderboard(data.leaderboard || []);
      });
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      this.setLeaderboardLoading(false);
    }
  };

  submitIdea = async (params: ISubmitIdeaParams): Promise<boolean> => {
    const { accountStore, notificationStore } = this.rootStore;
    const { address } = accountStore;

    if (!address) {
      notificationStore.notify("Please connect your wallet first", {
        type: "warning",
        title: "Wallet Required"
      });
      return false;
    }

    this.setSubmitting(true);
    try {
      const timestamp = Date.now();
      const message = JSON.stringify({
        action: "submit_idea",
        address,
        telegram: params.telegram,
        description: params.description,
        timestamp
      });

      let signature: string;
      let publicKey: string;

      // Use KeeperWallet directly if available
      const keeper = (window as any).KeeperWallet || (window as any).WavesKeeper;
      if (keeper) {
        try {
          const encoder = new TextEncoder();
          const messageBytes = encoder.encode(message);
          const base64Message = btoa(String.fromCharCode.apply(null, Array.from(messageBytes)));

          const signResult = await keeper.signCustomData({
            version: 1,
            binary: "base64:" + base64Message
          });
          signature = signResult.signature;
          publicKey = signResult.publicKey;
        } catch (keeperError: any) {
          throw new Error("Failed to sign message. Please check your Keeper Wallet.");
        }
      } else if (accountStore.signer) {
        try {
          const signResult = await accountStore.signer.signMessage(message);
          signature = (signResult as any)[0]?.signature || (signResult as any).signature || String(signResult);
          publicKey = (signResult as any)[0]?.publicKey || (signResult as any).publicKey || "";
        } catch (signerError: any) {
          throw new Error("Failed to sign message. Please reconnect your wallet.");
        }
      } else {
        accountStore.setWalletModalOpened(true);
        throw new Error("Please connect your wallet first");
      }

      const response = await fetch(`${IDEAS_API_URL}/ideas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          address,
          telegram: params.telegram,
          description: params.description,
          screenshots: params.screenshots || [],
          attachments: params.attachments || [],
          signature,
          publicKey,
          message,
          timestamp
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit idea");
      }

      notificationStore.notify("Your idea has been submitted successfully!", {
        type: "success",
        title: "Success"
      });

      await this.fetchIdeas();
      await this.fetchMyIdeas();
      await this.fetchGlobalStats();
      this.setSubmitModalOpen(false);
      return true;
    } catch (error: any) {
      console.error("Error submitting idea:", error);
      notificationStore.notify(error.message || "Failed to submit idea", {
        type: "danger",
        title: "Error"
      });
      return false;
    } finally {
      this.setSubmitting(false);
    }
  };

  getStatusLabel = (status: IDEA_STATUS): string => {
    const labels: Record<IDEA_STATUS, string> = {
      [IDEA_STATUS.PENDING]: "Pending Review",
      [IDEA_STATUS.IN_PROGRESS]: "In Progress",
      [IDEA_STATUS.NEEDS_INFO]: "Needs More Info",
      [IDEA_STATUS.TESTING]: "Testing",
      [IDEA_STATUS.DONE]: "Completed",
      [IDEA_STATUS.REJECTED]: "Rejected"
    };
    return labels[status] || status;
  };

  getStatusColor = (status: IDEA_STATUS): string => {
    const colors: Record<IDEA_STATUS, string> = {
      [IDEA_STATUS.PENDING]: "#EDAA8A",
      [IDEA_STATUS.IN_PROGRESS]: "#7075E9",
      [IDEA_STATUS.NEEDS_INFO]: "#D9916E",
      [IDEA_STATUS.TESTING]: "#35A15A",
      [IDEA_STATUS.DONE]: "#1F8943",
      [IDEA_STATUS.REJECTED]: "#D66662"
    };
    return colors[status] || "#8082C5";
  };

  // Admin functions
  isAdmin = false;
  setIsAdmin = (v: boolean) => (this.isAdmin = v);

  checkAdminStatus = async () => {
    const { address } = this.rootStore.accountStore;
    if (!address) {
      this.setIsAdmin(false);
      return;
    }

    try {
      const response = await fetch(`${IDEAS_API_URL}/whitelist/me/${address}`);
      if (response.ok) {
        const data = await response.json();
        runInAction(() => {
          this.setIsAdmin(data.isAdmin || data.isOwner);
        });
      }
    } catch (error) {
      console.error("Error checking admin status:", error);
      this.setIsAdmin(false);
    }
  };

  fetchDevelopers = async () => {
    try {
      const response = await fetch(`${IDEAS_API_URL}/whitelist/developers`);
      if (response.ok) {
        const data = await response.json();
        runInAction(() => {
          this.setDevelopers(data.developers || []);
          this.setAllDevelopers(data.allDevelopers || data.developers || []);
        });
      }
    } catch (error) {
      console.error("Error fetching developers:", error);
    }
  };

  assignDeveloper = async (ideaId: string, developerAddress: string | null): Promise<boolean> => {
    const { accountStore, notificationStore } = this.rootStore;
    const { address } = accountStore;

    if (!address || !this.isAdmin) {
      notificationStore.notify("Admin access required", {
        type: "warning",
        title: "Access Denied"
      });
      return false;
    }

    try {
      const timestamp = Date.now();
      const message = JSON.stringify({
        action: "assign_developer",
        address,
        ideaId,
        developerAddress,
        timestamp
      });

      let signature: string;
      let publicKey: string;

      const keeper = (window as any).KeeperWallet || (window as any).WavesKeeper;
      if (keeper) {
        try {
          const encoder = new TextEncoder();
          const messageBytes = encoder.encode(message);
          const base64Message = btoa(String.fromCharCode.apply(null, Array.from(messageBytes)));

          const signResult = await keeper.signCustomData({
            version: 1,
            binary: "base64:" + base64Message
          });
          signature = signResult.signature;
          publicKey = signResult.publicKey;
        } catch (keeperError: any) {
          throw new Error("Failed to sign message. Please check your Keeper Wallet.");
        }
      } else if (accountStore.signer) {
        try {
          const signResult = await accountStore.signer.signMessage(message);
          signature = (signResult as any)[0]?.signature || (signResult as any).signature || String(signResult);
          publicKey = (signResult as any)[0]?.publicKey || (signResult as any).publicKey || "";
        } catch (signerError: any) {
          throw new Error("Failed to sign message. Please reconnect your wallet.");
        }
      } else {
        accountStore.setWalletModalOpened(true);
        throw new Error("Please connect your wallet first");
      }

      const response = await fetch(`${IDEAS_API_URL}/ideas/${ideaId}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address,
          developerAddress,
          signature,
          publicKey,
          message
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to assign developer");
      }

      notificationStore.notify(
        developerAddress ? "Developer assigned" : "Developer unassigned",
        { type: "success", title: "Updated" }
      );

      await this.fetchIdeas();
      return true;
    } catch (error: any) {
      notificationStore.notify(error.message, {
        type: "danger",
        title: "Error"
      });
      return false;
    }
  };

  getDeveloperName = (address: string): string => {
    // Use allDevelopers to show names even for hidden/removed users
    const dev = (this.allDevelopers || []).find(d => d.address.toLowerCase() === address.toLowerCase());
    return dev?.nickname || address.slice(0, 8) + "...";
  };

  updateIdeaStatus = async (ideaId: string, newStatus: IDEA_STATUS, bonusPoints?: number, paidAmount?: number): Promise<boolean> => {
    const { accountStore, notificationStore } = this.rootStore;
    const { address } = accountStore;

    if (!address || !this.isAdmin) {
      notificationStore.notify("Admin access required", {
        type: "warning",
        title: "Access Denied"
      });
      return false;
    }

    try {
      const timestamp = Date.now();
      const message = JSON.stringify({
        action: "update_idea",
        address,
        ideaId,
        status: newStatus,
        timestamp
      });

      let signature: string;
      let publicKey: string;

      const keeper = (window as any).KeeperWallet || (window as any).WavesKeeper;
      if (keeper) {
        try {
          const encoder = new TextEncoder();
          const messageBytes = encoder.encode(message);
          const base64Message = btoa(String.fromCharCode.apply(null, Array.from(messageBytes)));

          const signResult = await keeper.signCustomData({
            version: 1,
            binary: "base64:" + base64Message
          });
          signature = signResult.signature;
          publicKey = signResult.publicKey;
        } catch (keeperError: any) {
          throw new Error("Failed to sign message. Please check your Keeper Wallet.");
        }
      } else if (accountStore.signer) {
        try {
          const signResult = await accountStore.signer.signMessage(message);
          signature = (signResult as any)[0]?.signature || (signResult as any).signature || String(signResult);
          publicKey = (signResult as any)[0]?.publicKey || (signResult as any).publicKey || "";
        } catch (signerError: any) {
          throw new Error("Failed to sign message. Please reconnect your wallet.");
        }
      } else {
        accountStore.setWalletModalOpened(true);
        throw new Error("Please connect your wallet first");
      }

      const body: any = {
        address,
        status: newStatus,
        signature,
        publicKey,
        message
      };

      // Only include bonusPoints and paidAmount when closing idea (status = DONE)
      if (newStatus === IDEA_STATUS.DONE) {
        if (typeof bonusPoints === 'number' && bonusPoints >= 0) {
          body.bonusPoints = bonusPoints;
        }
        if (typeof paidAmount === 'number' && paidAmount >= 0) {
          body.paidAmount = paidAmount;
        }
      }

      const response = await fetch(`${IDEAS_API_URL}/ideas/${ideaId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update status");
      }

      notificationStore.notify(`Status updated to ${this.getStatusLabel(newStatus)}`, {
        type: "success",
        title: "Updated"
      });

      await this.fetchIdeas();
      await this.fetchMyIdeas();
      await this.fetchGlobalStats();
      return true;
    } catch (error: any) {
      notificationStore.notify(error.message, {
        type: "danger",
        title: "Error"
      });
      return false;
    }
  };

  deleteIdea = async (ideaId: string): Promise<boolean> => {
    const { accountStore, notificationStore } = this.rootStore;
    const { address } = accountStore;

    if (!address || !this.isAdmin) {
      notificationStore.notify("Admin access required", {
        type: "warning",
        title: "Access Denied"
      });
      return false;
    }

    try {
      const timestamp = Date.now();
      const message = JSON.stringify({
        action: "delete_idea",
        address,
        ideaId,
        timestamp
      });

      let signature: string;
      let publicKey: string;

      const keeper = (window as any).KeeperWallet || (window as any).WavesKeeper;
      if (keeper) {
        try {
          const encoder = new TextEncoder();
          const messageBytes = encoder.encode(message);
          const base64Message = btoa(String.fromCharCode.apply(null, Array.from(messageBytes)));

          const signResult = await keeper.signCustomData({
            version: 1,
            binary: "base64:" + base64Message
          });
          signature = signResult.signature;
          publicKey = signResult.publicKey;
        } catch (keeperError: any) {
          throw new Error("Failed to sign message. Please check your Keeper Wallet.");
        }
      } else if (accountStore.signer) {
        try {
          const signResult = await accountStore.signer.signMessage(message);
          signature = (signResult as any)[0]?.signature || (signResult as any).signature || String(signResult);
          publicKey = (signResult as any)[0]?.publicKey || (signResult as any).publicKey || "";
        } catch (signerError: any) {
          throw new Error("Failed to sign message. Please reconnect your wallet.");
        }
      } else {
        accountStore.setWalletModalOpened(true);
        throw new Error("Please connect your wallet first");
      }

      const response = await fetch(`${IDEAS_API_URL}/ideas/${ideaId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, signature, publicKey, message })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete idea");
      }

      notificationStore.notify("Idea deleted", {
        type: "success",
        title: "Deleted"
      });

      await this.fetchIdeas();
      await this.fetchMyIdeas();
      await this.fetchGlobalStats();
      return true;
    } catch (error: any) {
      notificationStore.notify(error.message, {
        type: "danger",
        title: "Error"
      });
      return false;
    }
  };

  // Voting
  votingIdeaId: string | null = null;
  setVotingIdeaId = (id: string | null) => (this.votingIdeaId = id);

  voteIdea = async (ideaId: string, voteType: "like" | "dislike"): Promise<boolean> => {
    const { accountStore, notificationStore } = this.rootStore;
    const { address } = accountStore;

    if (!address) {
      notificationStore.notify("Please connect your wallet first", {
        type: "warning",
        title: "Wallet Required"
      });
      return false;
    }

    this.setVotingIdeaId(ideaId);
    try {
      const timestamp = Date.now();
      const message = JSON.stringify({
        action: "vote_idea",
        address,
        ideaId,
        voteType,
        timestamp
      });

      let signature: string;
      let publicKey: string;

      const keeper = (window as any).KeeperWallet || (window as any).WavesKeeper;
      if (keeper) {
        try {
          const encoder = new TextEncoder();
          const messageBytes = encoder.encode(message);
          const base64Message = btoa(String.fromCharCode.apply(null, Array.from(messageBytes)));

          const signResult = await keeper.signCustomData({
            version: 1,
            binary: "base64:" + base64Message
          });
          signature = signResult.signature;
          publicKey = signResult.publicKey;
        } catch (keeperError: any) {
          throw new Error("Failed to sign vote. Please check your Keeper Wallet.");
        }
      } else if (accountStore.signer) {
        try {
          const signResult = await accountStore.signer.signMessage(message);
          signature = (signResult as any)[0]?.signature || (signResult as any).signature || String(signResult);
          publicKey = (signResult as any)[0]?.publicKey || (signResult as any).publicKey || "";
        } catch (signerError: any) {
          throw new Error("Failed to sign vote. Please reconnect your wallet.");
        }
      } else {
        accountStore.setWalletModalOpened(true);
        throw new Error("Please connect your wallet first");
      }

      const response = await fetch(`${IDEAS_API_URL}/ideas/${ideaId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address,
          voteType,
          signature,
          publicKey,
          message
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to vote");
      }

      const data = await response.json();

      // Update idea in local state
      runInAction(() => {
        const updateIdea = (ideas: IIdea[]) => {
          const index = ideas.findIndex(i => i.id === ideaId);
          if (index !== -1 && data.idea) {
            ideas[index] = data.idea;
          }
        };
        updateIdea(this.ideas);
        updateIdea(this.myIdeas);
      });

      return true;
    } catch (error: any) {
      notificationStore.notify(error.message || "Failed to vote", {
        type: "danger",
        title: "Error"
      });
      return false;
    } finally {
      this.setVotingIdeaId(null);
    }
  };

  getUserVote = (idea: IIdea): "like" | "dislike" | null => {
    const { address } = this.rootStore.accountStore;
    if (!address) return null;

    const addrLower = address.toLowerCase();
    if (idea.likes?.some(a => a.toLowerCase() === addrLower)) return "like";
    if (idea.dislikes?.some(a => a.toLowerCase() === addrLower)) return "dislike";
    return null;
  };
}

export default IdeasStore;
