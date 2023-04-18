import axios from "axios";
import BN from "@src/utils/BN";

export type TCalcRouteExchangeItem = {
  amountIn: number;
  amountOut: number;
  from: string;
  pool: string;
  to: string;
  type: string;
};

export type TCalcRoute = {
  exchanges: Array<TCalcRouteExchangeItem>;
  in: number;
};

export interface ICalcResponse {
  aggregatedProfit: number;
  estimatedOut: number;
  priceImpact: number;
  parameters: string;
  routes: Array<TCalcRoute>;
}

const aggregatorService = {
  calc: async (
    assetId0: string,
    assetId1: string,
    amount: BN
  ): Promise<ICalcResponse> => {
    const url = `${
      process.env.REACT_APP_AGG_API
    }/aggregator/calc?token0=${assetId0}&token1=${assetId1}&amountIn=${amount.toString()}`;
    const { data } = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${process.env.REACT_APP_AGGREGATOR_KEY}`,
      },
    });

    // const stablesLi = ["9wc3LXNA4TEBsXyKtoLE9mrbDD7WMHXvXrCjZvabLAsi", "HGgabTqUS8WtVFUJzfmrTDMgEccJuZLBPhFgQFxvnsoW"]
    // if (stablesLi.indexOf(assetId0) != -1 && stablesLi.indexOf(assetId1) != -1) {
    //   const url = `https://nodes-puzzle.wavesnodes.com/addresses/data/3P6H3u6gEvsXtBxsE2ynEN4Ja8DoShNe9DX/${assetId1}_balance`;
    //   const resp = (await axios.get(url)).data;
    //   const data2 = (resp.value > amount.toNumber()) ?
    //       {routes: new Array<TCalcRoute>(), aggregatedProfit: amount.toNumber(), estimatedOut: amount.multipliedBy(1).toNumber(), parameters: `${amount}/3P6H3u6gEvsXtBxsE2ynEN4Ja8DoShNe9DX,puzzle,${assetId0},${assetId1}`, priceImpact: 0}
    //       : {routes: new Array<TCalcRoute>(), aggregatedProfit: 0, estimatedOut: 0, parameters: "", priceImpact: 0};
    //
    //   if (data2.estimatedOut > data.estimatedOut) {return data2}
    // }

    return data;
  },
};
export default aggregatorService;
