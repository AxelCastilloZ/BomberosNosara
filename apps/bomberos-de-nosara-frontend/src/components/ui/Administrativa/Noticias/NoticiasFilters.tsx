import { useState } from 'react';
import { FiSearch, FiCalendar } from 'react-icons/fi';

interface NoticiasFiltersProps {
  onFilter: (filters: {
    search: string;
    fechaDesde: string;
    fechaHasta: string;
  }) => void;
  onClear: () => void;
}

export const NoticiasFilters: React.FC<NoticiasFiltersProps> = ({ onFilter, onClear }) => {
  const [search, setSearch] = useState('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilter({ search, fechaDesde, fechaHasta });
  };

  const handleClear = () => {
    setSearch('');
    setFechaDesde('');
    setFechaHasta('');
    onClear();
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FiSearch className="inline mr-2" />
            Buscar
          </label>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por título o descripción..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FiCalendar className="inline mr-2" />
            Fecha desde
          </label>
          <input
            type="date"
            value={fechaDesde}
            onChange={(e) => setFechaDesde(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FiCalendar className="inline mr-2" />
            Fecha hasta
          </label>
          <input
            type="date"
            value={fechaHasta}
            onChange={(e) => setFechaHasta(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-4">
        <button
          type="button"
          onClick={handleClear}
          className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Limpiar filtros
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
        >
          Aplicar filtros
        </button>
      </div>
    </form>
  );
};