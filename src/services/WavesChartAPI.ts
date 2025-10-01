import axios from 'axios';

const WAVES_API_BASE = 'https://api.wavesplatform.com/v0';

export interface PairData {
  __type: 'pair';
  data: {
    firstPrice: number;
    lastPrice: number;
    volume: number;
    quoteVolume: number;
    high: number;
    low: number;
    weightedAveragePrice: number;
    txsCount: number;
    volumeWaves: number;
  };
  amountAsset: string;
  priceAsset: string;
}

export interface PairsResponse {
  __type: 'list';
  isLastPage: boolean;
  data: PairData[];
}

export interface CandleData {
  __type: 'candle';
  data: {
    open: number | null;
    high: number | null;
    low: number | null;
    close: number | null;
    volume: number | null;
    quoteVolume: number | null;
    weightedAveragePrice: number | null;
    maxHeight: number | null;
    txsCount: number;
    time: string;
    timeClose: string;
  };
}

export interface CandlesResponse {
  __type: 'list';
  isLastPage: boolean;
  data: CandleData[];
}

export class WavesChartAPI {
  static async checkPairExists(asset0: string): Promise<PairData | null> {
    try {
      const response = await axios.get<PairsResponse>(`${WAVES_API_BASE}/pairs`, {
        params: {
          search_by_asset: asset0,
        },
      });

      if (response.data.data && response.data.data.length > 0) {
        return response.data.data[0];
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  static async getCandles(
    amountAsset: string, 
    priceAsset: string, 
    interval: string = '1h'
  ): Promise<CandleData[]> {
    try {
      // Get data for last 30 days to find actual trades
      const timeEnd = new Date();
      const timeStart = new Date(timeEnd.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
      
      return this.getCandlesWithTimeRange(amountAsset, priceAsset, interval, timeStart, timeEnd);
    } catch (error) {
      return [];
    }
  }

  static async getCandlesWithTimeRange(
    amountAsset: string, 
    priceAsset: string, 
    interval: string,
    timeStart: Date,
    timeEnd: Date
  ): Promise<CandleData[]> {
    try {
      const params = {
        interval,
        timeStart: timeStart.toISOString(),
        timeEnd: timeEnd.toISOString(),
        limit: 100,
      };
      
      const url = `${WAVES_API_BASE}/candles/${amountAsset}/${priceAsset}`;
      const response = await axios.get<CandlesResponse>(url, { params });
      const candlesData = response.data.data || [];
      
      return candlesData;
    } catch (error: any) {
      return [];
    }
  }

  static convertToCandlestickData(candles: CandleData[]) {
    const result = candles
      .map(candle => {
        try {
          let timeValue = candle.data.time;
          
          if (candle.data.open === null || candle.data.high === null || 
              candle.data.low === null || candle.data.close === null) {
            return null;
          }
          
          let date = new Date(timeValue);
          
          if (isNaN(date.getTime())) {
            return null;
          }
          
          return {
            time: Math.floor(date.getTime() / 1000) as any,
            open: candle.data.open,
            high: candle.data.high,
            low: candle.data.low,
            close: candle.data.close,
          };
        } catch (error) {
          return null;
        }
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .sort((a, b) => a.time - b.time)
      .filter((item, index, array) => {
        if (index === 0) return true;
        return item.time !== array[index - 1].time;
      });
    
    return result;
  }
}