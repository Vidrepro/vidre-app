'use client';

interface Option {
  readonly value: string;
  readonly label: string;
}

interface Props {
  group: string;
  options: readonly Option[];
  value: string;
  onChange: (value: string) => void;
}

/** Segmented control. Klik op de actieve knop zet hem weer uit (zoals de prototype). */
export default function Segmented({ group, options, value, onChange }: Props) {
  return (
    <div className="segmented" data-group={group}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          data-value={o.value}
          className={value === o.value ? 'active' : undefined}
          onClick={() => onChange(value === o.value ? '' : o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
