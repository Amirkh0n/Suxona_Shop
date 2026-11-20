// Tiny dependency-free bar chart (SVG). `data`: [{ label, value }].
export default function BarChart({ data, height = 140, format = (v) => v }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const barW = 100 / Math.max(1, data.length);
  return (
    <svg viewBox={`0 0 100 ${height / 4}`} preserveAspectRatio="none" role="img" style={{ width: '100%', height }}>
      {data.map((d, i) => {
        const h = (d.value / max) * (height / 4 - 2);
        return (
          <rect key={d.label} x={i * barW + barW * 0.15} y={height / 4 - h} width={barW * 0.7} height={h} rx="0.6" fill="var(--color-primary)" opacity={d.value ? 1 : 0.25}>
            <title>{`${d.label}: ${format(d.value)}`}</title>
          </rect>
        );
      })}
    </svg>
  );
}
