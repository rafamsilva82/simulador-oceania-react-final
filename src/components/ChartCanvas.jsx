import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

export default function ChartCanvas({ type = 'line', data, options }) {
  const ref = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!ref.current || !data) return undefined;
    if (chartRef.current) chartRef.current.destroy();
    chartRef.current = new Chart(ref.current, { type, data, options });
    return () => chartRef.current?.destroy();
  }, [type, data, options]);

  return <canvas ref={ref} />;
}
