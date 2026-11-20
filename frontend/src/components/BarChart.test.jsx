import { render } from '@testing-library/react';
import BarChart from './BarChart';

it('renders one bar per data point and scales to the max', () => {
  const { container } = render(<BarChart data={[{ label: 'a', value: 5 }, { label: 'b', value: 10 }, { label: 'c', value: 0 }]} />);
  const bars = container.querySelectorAll('rect');
  expect(bars).toHaveLength(3);
  expect(Number(bars[1].getAttribute('height'))).toBeGreaterThan(Number(bars[0].getAttribute('height')));
  expect(bars[2].getAttribute('opacity')).toBe('0.25');
});
