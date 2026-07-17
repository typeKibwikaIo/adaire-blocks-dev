/**
 * Small CSS-grid thumbnail preview for a bento layout preset, used by the
 * preset picker in edit.js. Purely illustrative — the real grid placement
 * lives in style.scss.
 */
const BentoPresetIcon = ({ columns, rows, cells }) => (
    <div
        className="adaire-bento-preset-icon"
        style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            gridTemplateRows: `repeat(${rows}, 1fr)`,
            gap: '2px',
            width: '48px',
            height: '36px',
            flexShrink: 0,
        }}
    >
        {cells.map((cell, index) => (
            <div
                key={index}
                style={{
                    gridColumn: `${cell.col} / span ${cell.colSpan}`,
                    gridRow: `${cell.row} / span ${cell.rowSpan}`,
                    background: 'currentColor',
                    opacity: index === 0 && cells.length > 1 ? 0.9 : 0.35,
                    borderRadius: '1px',
                }}
            />
        ))}
    </div>
);

export default BentoPresetIcon;
