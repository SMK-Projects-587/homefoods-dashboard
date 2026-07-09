import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCategories } from '@/features/categories';

interface CategorySelectProps {
  value: string;
  onChange: (value: string) => void;
}

const NONE = 'none';

export default function CategorySelect({
  value,
  onChange,
}: CategorySelectProps) {
  const { data: categories, isPending } = useCategories();

  return (
    <Select
      value={value || NONE}
      onValueChange={(next) => onChange(next === NONE ? '' : next)}
      disabled={isPending}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select a category" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={NONE}>No category</SelectItem>
        {categories?.map((category) => (
          <SelectItem key={category.id} value={String(category.id)}>
            {category.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
