import axios from "axios";

const transactionsService = {
  getTransactions: async (
    params: Array<[string, string | number | boolean]>
  ) => {
    const search =
      params.length > 0
        ? `?${params.map(([k, v]) => `${k}=${String(v)}`).join("&")}`
        : "";
    const url =
      `https://puzzle-js-back-dev-bba0bd77a60c.herokuapp.com/api/v1/transactions` + search;
    const { data } = await axios.get(url);
    return data;
  },
};

export default transactionsService;
