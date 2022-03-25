import axios from "axios";

interface IPool {
  id: string;
}

const poolService = {
  getPuzzlePools: async (): Promise<IPool[]> => {
    await axios.get("https://localhost:5000/api/v1/pools");
    return [];
  },
  checkDomain: async (domain: string): Promise<boolean> => {
    await axios("http://localhost:5000/api/v1/pools/check-domain", {
      method: "POST",
      headers: { "Content-type": "application/json" },
      data: { domain },
    });
    return true;
  },
};
export default poolService;
