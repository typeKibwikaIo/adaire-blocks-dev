import { __ } from '@wordpress/i18n';

export default function PresetIcon({ widths }) {
  const totalWidth = 60;
  const totalHeight = 32;
  const gap = 3;
  
  // Calculate widths based on percentages
  const calculateWidth = (percentage) => {
    return (percentage / 100) * (totalWidth - ((widths.length - 1) * gap));
  };

  return (
    <svg width={totalWidth} height={totalHeight} viewBox={`0 0 ${totalWidth} ${totalHeight}`}>
      {widths.map((width, index) => {
        const rectWidth = calculateWidth(width);
        const x = index === 0 ? 0 : calculateWidth(widths.slice(0, index).reduce((sum, w) => sum + w, 0)) + (index * gap);
        
        return (
          <rect
            key={index}
            x={x}
            y={0}
            width={rectWidth}
            height={totalHeight}
            rx={2}
            fill="#c5bef5"
          />
        );
      })}
    </svg>
  );
}