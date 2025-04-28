import { SxProps, useTheme } from '@mui/material';
import ReactEchart from 'components/base/ReactEchart';
import EChartsReactCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import { PieChart } from 'echarts/charts';
import { TooltipComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { useMemo } from 'react';

interface PiChartDataItem {
  id: number;
  name: string;
  value: number; // Percentage
  visible: boolean;
}

interface PiChartProps {
  sx?: SxProps;
  chartRef: React.RefObject<EChartsReactCore>;
  data: PiChartDataItem[];
}

echarts.use([PieChart, TooltipComponent, CanvasRenderer]);

const PiChart = ({ chartRef, data, ...rest }: PiChartProps) => {
  const theme = useTheme();

  // Define a palette of distinct colors
  const colorPalette = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.error.main,
    theme.palette.info.main,
    theme.palette.primary.light,
    theme.palette.secondary.light,
    theme.palette.success.light,
    theme.palette.warning.light,
  ];

  const option = useMemo(
    () => ({
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {d}%',
      },
      series: [
        {
          name: '',
          type: 'pie',
          radius: '80%',
          data: data.map((item, index) => ({
            value: item.value,
            name: item.name,
            itemStyle: {
              // Assign a unique color from the palette, cycling if needed
              color: colorPalette[index % colorPalette.length],
            },
          })),
          emphasis: {
            label: {
              show: false,
            },
            itemStyle: {
              shadowBlur: 5,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
          label: {
            show: false,
          },
        },
      ],
    }),
    [theme, data],
  );

  return <ReactEchart ref={chartRef} echarts={echarts} option={option} {...rest} />;
};

export default PiChart;