import axios from "axios";

interface IPool {
  id: string;
}

const poolService = {
  getPuzzlePools: async (): Promise<IPool[]> => {
    const res = await axios.get("https://localhost:5000/api/v1/pools");
    return [];
  },
};
export default poolService;
