import React from 'react';
import { Input } from '../../../components/ui/input';
import { Select } from '../../../components/ui/select';
import { Button } from '../../../components/ui/button';
import { Search, X } from 'lucide-react';

interface FilterOption {
  value: string;
  label: string;
}

interface EntityFiltersProps {
  searchPlaceholder: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  
  statusValue: string;
  statusOptions: FilterOption[];
  onStatusChange: (value: string) => void;
  
  typeValue: string;
  typeOptions: FilterOption[];
  onTypeChange: (value: string) => void;
  
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

export const EntityFilters: React.FC<EntityFiltersProps> = ({
  searchPlaceholder,
  searchValue,
  onSearchChange,
  statusValue,
  statusOptions,
  onStatusChange,
  typeValue,
  typeOptions,
  onTypeChange,
  onClearFilters,
  hasActiveFilters,
}) => {
  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Búsqueda */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        <Input
          type="text"
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 h-10 sm:h-11"
        />
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        {/* Filtro de Estado */}
        <div className="flex-1 min-w-0">
          <Select
            value={statusValue}
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-full h-10 sm:h-11"
          >
            <option value="">Todos los estados</option>
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>

        {/* Filtro de Tipo */}
        <div className="flex-1 min-w-0">
          <Select
            value={typeValue}
            onChange={(e) => onTypeChange(e.target.value)}
            className="w-full h-10 sm:h-11"
          >
            <option value="">Todos los tipos</option>
            {typeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>

        {/* Botón Limpiar Filtros */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            onClick={onClearFilters}
            className="w-full sm:w-auto h-10 sm:h-11 flex-shrink-0"
          >
            <X className="h-4 w-4 sm:mr-2" />
            <span className="sm:inline">Limpiar</span>
          </Button>
        )}
      </div>
    </div>
  );
};