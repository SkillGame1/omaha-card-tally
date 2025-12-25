import { OmahaVariant } from '@/lib/poker/types';
import { cn } from '@/lib/utils';

interface VariantTabsProps {
  variant: OmahaVariant;
  onChange: (variant: OmahaVariant) => void;
}

const variants: { id: OmahaVariant; label: string; cards: number }[] = [
  { id: 'PLO4', label: '4-Card PLO', cards: 4 },
  { id: 'PLO5', label: '5-Card PLO', cards: 5 },
  { id: 'PLO6', label: '6-Card PLO', cards: 6 },
];

export function VariantTabs({ variant, onChange }: VariantTabsProps) {
  return (
    <div className="flex gap-1 p-1 bg-muted rounded-lg">
      {variants.map(v => (
        <button
          key={v.id}
          onClick={() => onChange(v.id)}
          className={cn(
            'flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200',
            variant === v.id
              ? 'bg-primary text-primary-foreground shadow-md'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/80'
          )}
        >
          {v.label}
        </button>
      ))}
    </div>
  );
}