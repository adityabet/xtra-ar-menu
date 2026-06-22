export default function VegBadge({ type, size = 'sm' }) {
  const isVeg = type === 'veg';
  const isMocktail = type === 'mocktail';
  const isBeverage = type === 'beverage';

  const color = isVeg || isMocktail || isBeverage ? '#22C55E' : '#EF4444';
  const s = size === 'sm' ? 12 : 16;

  return (
    <div
      className="flex-shrink-0 rounded"
      style={{
        width: s,
        height: s,
        border: `1.5px solid ${color}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        className="rounded-full"
        style={{ width: s * 0.45, height: s * 0.45, background: color }}
      />
    </div>
  );
}
