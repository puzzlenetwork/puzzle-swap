import { CONTRACT_ADDRESSES } from "@src/constants";
import DcaSession from "@src/entities/DcaSession";
import BN from "@src/utils/BN";
import makeNodeRequest from "@src/utils/makeNodeRequest";
import nodeService from "@src/services/nodeService";

/** The contract also writes boolean entries, which INodeData does not cover. */
interface IDcaNodeData {
  key: string;
  type: "integer" | "string" | "boolean";
  value: number | string | boolean;
}

const DCA_CONTRACT = CONTRACT_ADDRESSES.dcaBot;

/** Per-session state keys written by the contract. */
const SESSION_KEY_PREFIXES = [
  "active",
  "owner",
  "from",
  "to",
  "blocks",
  "minout",
  "amount",
  "remaining",
  "total",
  "lastblock",
  "balance",
  "execwaves",
  "created",
  "paused",
  "received",
] as const;

const sessionKeys = (sessionId: string) => SESSION_KEY_PREFIXES.map((prefix) => `${prefix}_${sessionId}`);

const toMap = (entries: IDcaNodeData[]): Record<string, string | number | boolean> =>
  entries.reduce((acc, { key, value }) => ({ ...acc, [key]: value }), {});

const readInt = (map: Record<string, any>, key: string): number => {
  const value = map[key];
  return typeof value === "number" ? value : 0;
};

const readBN = (map: Record<string, any>, key: string): BN => new BN(readInt(map, key));

const readString = (map: Record<string, any>, key: string, fallback = ""): string => {
  const value = map[key];
  return typeof value === "string" ? value : fallback;
};

const readBool = (map: Record<string, any>, key: string): boolean => map[key] === true;

/**
 * Reads an arbitrary amount of exact keys. The node caps the query string length,
 * so the keys go through POST instead of the `?key=` form used elsewhere.
 */
const fetchKeys = async (keys: string[]): Promise<IDcaNodeData[]> => {
  if (keys.length === 0) return [];
  const { data } = await makeNodeRequest(`/addresses/data/${DCA_CONTRACT}`, { postData: { keys } });
  return data;
};

const dcaService = {
  /** The admin can pause the whole service; `start` throws while it is off. */
  isServiceEnabled: async (): Promise<boolean> => {
    const entries = await fetchKeys(["enabled"]);
    const entry = entries.find(({ key }) => key === "enabled");
    // the contract defaults to enabled when the key was never written
    return entry == null ? true : entry.value === true;
  },

  /**
   * Session ids owned by a user, newest first. The contract keeps an explicit
   * `session_index_<address>_<n>` list, so there is no need to scan the whole state.
   */
  getUserSessionIds: async (address: string): Promise<string[]> => {
    const countEntries = await fetchKeys([`session_count_${address}`]);
    const count = countEntries.length > 0 ? Number(countEntries[0].value) : 0;
    if (!count || Number.isNaN(count)) return [];

    const indexKeys = Array.from({ length: count }, (_, i) => `session_index_${address}_${i + 1}`);
    const indexEntries = await fetchKeys(indexKeys);

    const byIndex = new Map<number, string>();
    indexEntries.forEach(({ key, value }) => {
      const index = Number(key.split("_").pop());
      if (!Number.isNaN(index) && typeof value === "string") byIndex.set(index, value);
    });

    return Array.from(byIndex.keys())
      .sort((a, b) => b - a)
      .map((index) => byIndex.get(index)!)
      .filter((id, i, all) => all.indexOf(id) === i);
  },

  getSessions: async (sessionIds: string[], height?: number): Promise<DcaSession[]> => {
    if (sessionIds.length === 0) return [];

    const [entries, currentHeight] = await Promise.all([
      fetchKeys(sessionIds.flatMap(sessionKeys)),
      height != null ? Promise.resolve(height) : nodeService.blocksHeight().then(({ height: h }) => h),
    ]);
    const map = toMap(entries);

    return sessionIds
      .map((id) => {
        const owner = readString(map, `owner_${id}`);
        if (owner === "") return null;
        return new DcaSession({
          id,
          owner,
          active: readBool(map, `active_${id}`),
          paused: readBool(map, `paused_${id}`),
          fromAssetId: readString(map, `from_${id}`, "WAVES"),
          toAssetId: readString(map, `to_${id}`, "WAVES"),
          blocksPerTrade: readInt(map, `blocks_${id}`),
          minOut: readBN(map, `minout_${id}`),
          amountPerSwap: readBN(map, `amount_${id}`),
          remaining: readInt(map, `remaining_${id}`),
          total: readInt(map, `total_${id}`),
          lastBlock: readInt(map, `lastblock_${id}`),
          balance: readBN(map, `balance_${id}`),
          execWaves: readBN(map, `execwaves_${id}`),
          created: readInt(map, `created_${id}`),
          totalReceived: readBN(map, `received_${id}`),
          currentHeight,
        });
      })
      .filter((session): session is DcaSession => session != null);
  },

  getUserSessions: async (address: string): Promise<DcaSession[]> => {
    const [ids, { height }] = await Promise.all([dcaService.getUserSessionIds(address), nodeService.blocksHeight()]);
    return dcaService.getSessions(ids, height);
  },
};

export default dcaService;
