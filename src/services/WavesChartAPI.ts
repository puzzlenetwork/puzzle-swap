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
  static async checkPairExists(asset0: string, asset1?: string, retries: number = 3): Promise<PairData | null> {
    if (!asset1) {
      for (let i = 0; i < retries; i++) {
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
          if (i === retries - 1) {
            return null;
          }
          await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        }
      }
      return null;
    }

    for (let i = 0; i < retries; i++) {
      try {
        const response0 = await axios.get<PairsResponse>(`${WAVES_API_BASE}/pairs`, {
          params: {
            search_by_asset: asset0,
          },
        });

        if (response0.data.data && response0.data.data.length > 0) {
          const pair = response0.data.data.find(
            p => (p.amountAsset === asset0 && p.priceAsset === asset1) || 
                 (p.amountAsset === asset1 && p.priceAsset === asset0)
          );
          if (pair) return pair;
        }

        const response1 = await axios.get<PairsResponse>(`${WAVES_API_BASE}/pairs`, {
          params: {
            search_by_asset: asset1,
          },
        });

        if (response1.data.data && response1.data.data.length > 0) {
          const pair = response1.data.data.find(
            p => (p.amountAsset === asset0 && p.priceAsset === asset1) || 
                 (p.amountAsset === asset1 && p.priceAsset === asset0)
          );
          if (pair) return pair;
        }

        return null;
      } catch (error) {
        if (i === retries - 1) {
          return null;
        }
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
    return null;
  }

  static async getCandles(
    amountAsset: string, 
    priceAsset: string, 
    interval: string = '1h'
  ): Promise<CandleData[]> {
    try {
      const timeEnd = new Date();
      const timeStart = new Date(timeEnd.getTime() - 90 * 24 * 60 * 60 * 1000);
      
      const allCandles: CandleData[] = [];
      const chunkSize = 30 * 24 * 60 * 60 * 1000;
      let currentEnd = timeEnd;
      
      while (currentEnd > timeStart) {
        const currentStart = new Date(Math.max(currentEnd.getTime() - chunkSize, timeStart.getTime()));
        
        const candles = await this.getCandlesWithTimeRange(
          amountAsset, 
          priceAsset, 
          interval, 
          currentStart, 
          currentEnd
        );
        
        allCandles.unshift(...candles);
        currentEnd = currentStart;
        
        if (currentStart.getTime() <= timeStart.getTime()) {
          break;
        }
      }
      
      return allCandles;
    } catch (error) {
      return [];
    }
  }

  static async getCandlesWithTimeRange(
    amountAsset: string, 
    priceAsset: string, 
    interval: string,
    timeStart: Date,
    timeEnd: Date,
    retries: number = 3
  ): Promise<CandleData[]> {
    for (let i = 0; i < retries; i++) {
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
        if (i === retries - 1) {
          return [];
        }
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
    return [];
  }

  static convertToCandlestickData(candles: CandleData[], isInverted: boolean = false) {
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
          
          if (isInverted) {
            const open = 1 / candle.data.open;
            const close = 1 / candle.data.close;
            const high = 1 / candle.data.low;
            const low = 1 / candle.data.high;
            
            return {
              time: Math.floor(date.getTime() / 1000) as any,
              open,
              high,
              low,
              close,
            };
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