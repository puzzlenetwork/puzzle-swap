import React, { useEffect, useRef, useState } from "react";
import { createChart, CandlestickData, CandlestickSeries, UTCTimestamp } from "lightweight-charts";
import styled from "@emotion/styled";
import { observer } from "mobx-react-lite";
import { useTokenChartVM } from "./TokenChartVM";
import { Row } from "@components/Flex";
import Text from "@components/Text";
import Spinner from "@components/Spinner";
import { WavesChartAPI } from "@src/services/WavesChartAPI";

interface IProps {
  height?: number;
  interval?: string;
}

const Root = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  box-sizing: border-box;
  padding-top: 24px;
  flex: 1;
  min-height: 400px;
`;

const ChartContainer = styled.div<{ height: number }>`
  width: 100%;
  height: ${props => props.height}px;
  position: relative;
  min-height: ${props => props.height}px;
  background: transparent;
  box-sizing: border-box;
`;



// Hook to check if chart data is available for current pair
export const useTradingViewChartAvailability = () => {
  const vm = useTokenChartVM();
  const [hasChartData, setHasChartData] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    if (!vm.asset0?.assetId || !vm.asset1?.assetId) {
      setHasChartData(false);
      return;
    }

    const checkDataAvailability = async () => {
      setIsChecking(true);
      
      const pairData = await WavesChartAPI.checkPairExists(vm.asset0.assetId, vm.asset1.assetId);
      if (!pairData) {
        setHasChartData(false);
        setIsChecking(false);
        return;
      }

      const candles = await WavesChartAPI.getCandles(
        pairData.amountAsset,
        pairData.priceAsset,
        '1h'
      );

      if (candles.length > 0) {
        const formattedData = WavesChartAPI.convertToCandlestickData(candles);
        setHasChartData(formattedData.length > 0);
      } else {
        setHasChartData(false);
      }
      
      setIsChecking(false);
    };

    checkDataAvailability();
  }, [vm.asset0?.assetId, vm.asset1?.assetId]);

  return { hasChartData, isChecking };
};

const TradingViewChart: React.FC<IProps> = observer(({ height = 350, interval = '1h' }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const seriesRef = useRef<any>(null);
  const vm = useTokenChartVM();
  const [loading, setLoading] = useState(false);
  const [candlestickData, setCandlestickData] = useState<CandlestickData<UTCTimestamp>[]>([]);
  const candlestickDataRef = useRef<CandlestickData<UTCTimestamp>[]>([]);
  const [, setHasChartData] = useState(false);
  const isLoadingMoreRef = useRef(false);
  const currentPairDataRef = useRef<any>(null);
  const hasReachedEndOfDataRef = useRef(false);

  const loadMoreHistoricalData = async (requestedTime: number) => {
    if (isLoadingMoreRef.current || !currentPairDataRef.current || hasReachedEndOfDataRef.current) {
      return;
    }

    isLoadingMoreRef.current = true;
    
    try {
      const earliestDataTime = candlestickDataRef.current.length > 0 ? 
        new Date((candlestickDataRef.current[0].time as number) * 1000) : 
        new Date(requestedTime * 1000);
      
      const timeEnd = earliestDataTime;
      const timeStart = new Date(timeEnd.getTime() - 90 * 24 * 60 * 60 * 1000);
      
      const allCandles: any[] = [];
      const chunkSize = 30 * 24 * 60 * 60 * 1000;
      let currentEnd = timeEnd;
      
      while (currentEnd > timeStart) {
        const currentStart = new Date(Math.max(currentEnd.getTime() - chunkSize, timeStart.getTime()));
        
        const candles = await WavesChartAPI.getCandlesWithTimeRange(
          currentPairDataRef.current.amountAsset,
          currentPairDataRef.current.priceAsset,
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
      
      if (allCandles.length > 0) {
        const formattedHistoricalData = WavesChartAPI.convertToCandlestickData(allCandles);
        
        if (formattedHistoricalData.length > 0) {
          const existingTimes = new Set(candlestickDataRef.current.map(item => item.time));
          const newData = formattedHistoricalData.filter(item => !existingTimes.has(item.time));
          
          if (newData.length > 0) {
            const combinedData = [...newData, ...candlestickDataRef.current]
              .sort((a, b) => (a.time as number) - (b.time as number));

            candlestickDataRef.current = combinedData;
            
            if (seriesRef.current && chartRef.current) {
              const timeScale = chartRef.current.timeScale();
              const scrollPosition = timeScale.scrollPosition();
              
              seriesRef.current.setData(combinedData);
              
              setTimeout(() => {
                if (chartRef.current) {
                  chartRef.current.timeScale().scrollToPosition(scrollPosition, false);
                }
              }, 0);
            }
          } else {
            hasReachedEndOfDataRef.current = true;
          }
        }
      } else {
        hasReachedEndOfDataRef.current = true;
      }
    } catch (error: any) {
    }
    
    isLoadingMoreRef.current = false;
  };

  // Load candlestick data from API
  useEffect(() => {
    if (!vm.asset0?.assetId || !vm.asset1?.assetId) return;

    const loadData = async () => {
      setLoading(true);
      hasReachedEndOfDataRef.current = false;

      const pairData = await WavesChartAPI.checkPairExists(vm.asset0.assetId, vm.asset1.assetId);
      if (!pairData) {
        setHasChartData(false);
        setLoading(false);
        return;
      }

      currentPairDataRef.current = pairData;

      const candles = await WavesChartAPI.getCandles(
        pairData.amountAsset,
        pairData.priceAsset,
        interval
      );

      if (candles.length > 0) {
        const formattedData = WavesChartAPI.convertToCandlestickData(candles);
        
        if (formattedData.length > 0) {
          setCandlestickData(formattedData);
          candlestickDataRef.current = formattedData;
          setHasChartData(true);
        } else {
          setHasChartData(false);
        }
      } else {
        setHasChartData(false);
      }

      setLoading(false);
    };

    loadData();
  }, [vm.asset0?.assetId, vm.asset1?.assetId, interval]);


  useEffect(() => {
    if (!chartContainerRef.current) {
      return;
    }

    const createChartInstance = () => {
      if (!chartContainerRef.current) {
        return;
      }
      
      try {
        if (chartContainerRef.current.clientWidth === 0) {
          setTimeout(createChartInstance, 100);
          return;
        }
        
        if (chartRef.current) {
          chartRef.current.remove();
          chartRef.current = null;
          seriesRef.current = null;
        }
        
        const chart = createChart(chartContainerRef.current, {
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
          layout: {
            background: { color: "transparent" },
            textColor: "#8082c5",
          },
          grid: {
            vertLines: {
              color: "rgba(197, 203, 206, 0.1)",
            },
            horzLines: {
              color: "rgba(197, 203, 206, 0.1)",
            },
          },
          crosshair: {
            mode: 1,
          },
          rightPriceScale: {
            borderColor: "rgba(197, 203, 206, 0.5)",
            visible: true,
          },
          timeScale: {
            borderColor: "rgba(197, 203, 206, 0.5)",
            timeVisible: true,
            secondsVisible: false,
            visible: true,
          },
        });

        const candlestickSeries = chart.addSeries(CandlestickSeries, {
          upColor: '#26a69a',
          downColor: '#ef5350',
          borderVisible: false,
          wickUpColor: '#26a69a',
          wickDownColor: '#ef5350',
        });
        
        chartRef.current = chart;
        seriesRef.current = candlestickSeries;

        chart.timeScale().subscribeVisibleTimeRangeChange((timeRange) => {
          if (timeRange && candlestickDataRef.current.length > 0) {
            const firstDataTime = candlestickDataRef.current[0].time;
            const rangeStart = timeRange.from;
            const buffer = 10;
            
            if (rangeStart <= (firstDataTime as number) + buffer) {
              void loadMoreHistoricalData(rangeStart as number);
            }
          }
        });

        if (candlestickData.length > 0) {
          candlestickSeries.setData(candlestickData);
          chart.timeScale().fitContent();
        }
        
      } catch (error) {
        console.error("Error creating TradingView chart:", error);
      }
    };

    createChartInstance();
    const timer = setTimeout(createChartInstance, 50);

    return () => {
      clearTimeout(timer);
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
        seriesRef.current = null;
      }
    };
  }, [height, candlestickData]);

  useEffect(() => {
    if (chartRef.current && seriesRef.current && candlestickData.length > 0) {
      try {
        seriesRef.current.setData(candlestickData);
        setTimeout(() => {
          if (chartRef.current) {
            chartRef.current.timeScale().fitContent();
          }
        }, 100);
      } catch (error) {
      }
    }
  }, [candlestickData]);


  if (loading) {
    return (
      <Root>
        <Row alignItems="center" justifyContent="center" style={{ height: height }}>
          <Spinner />
          <Text style={{ marginLeft: 8 }}>Loading chart data...</Text>
        </Row>
      </Root>
    );
  }

  return (
    <Root>
      <ChartContainer ref={chartContainerRef} height={height} />
    </Root>
  );
});

export default TradingViewChart;