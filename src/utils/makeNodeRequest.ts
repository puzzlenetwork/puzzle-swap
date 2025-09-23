import axios from "axios";

const testnetNodes = ["https://nodes-testnet.wavesnodes.com"];

const mainnetNodes = [
  "https://nodes.wx.network",
  "https://nodes-puzzle.wavesnodes.com",
  "https://wavesducks.wavesnodes.com",
  "https://nodes.swop.fi",
  "https://nodes.wavesnodes.com"
];

interface IParams {
  chainId?: "T" | "W";
  postData?: any;
}

const makeNodeRequest = async (request: string, params?: IParams): Promise<any> => {
  const userSettings = localStorage.getItem("puzzle-user-settings");
  const customNode = userSettings ? JSON.parse(userSettings)?.customNode : null;
  
  let nodes: string[];
  if (customNode && customNode.trim()) {
    let nodeUrl = customNode.trim();
    if (!nodeUrl.startsWith('http://') && !nodeUrl.startsWith('https://')) {
      nodeUrl = 'https://' + nodeUrl;
    }
    if (nodeUrl.endsWith('/')) {
      nodeUrl = nodeUrl.slice(0, -1);
    }
    nodes = [nodeUrl];
  } else {
    nodes = params?.chainId == null || params.chainId === "W" ? mainnetNodes : testnetNodes;
  }
  
  return new Promise(async (resolve, reject) => {
    let nodeIndex = 0;
    let success = false;
    while (!success) {
      const url = nodes[nodeIndex] + request;
      try {
        const response = await (params?.postData == null ? axios.get(url) : axios.post(url, params.postData));
        success = true;
        resolve(response);
      } catch (reason) {
        if (nodeIndex === nodes.length - 1) {
          success = true;
          reject(reason);
        } else {
          nodeIndex = nodeIndex + 1;
        }
      }
    }
  });
};

export default makeNodeRequest;
