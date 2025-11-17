import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Filter, Grid3X3 } from 'lucide-react';
import { categories } from '@/lib/products';

interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export default function CategoryFilter({ selectedCategory, onCategoryChange }: CategoryFilterProps) {
  return (
    <Card className="sticky top-24">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Filter className="h-5 w-5" />
          Categories
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "ghost"}
            className={`w-full justify-start text-left h-auto py-3 px-4 ${
              selectedCategory === category 
                ? "bg-primary text-primary-foreground shadow-sm" 
                : "hover:bg-gray-50 text-gray-700"
            }`}
            onClick={() => onCategoryChange(category)}
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                <Grid3X3 className="h-4 w-4" />
                <span className="font-medium">{category}</span>
              </div>
              {selectedCategory === category && (
                <Badge variant="secondary" className="ml-2 bg-primary-foreground text-primary">
                  Active
                </Badge>
              )}
            </div>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}