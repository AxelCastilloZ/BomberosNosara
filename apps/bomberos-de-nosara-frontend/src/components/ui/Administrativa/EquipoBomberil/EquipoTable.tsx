import { useState } from 'react';
import {
  useEquiposBomberiles,
  useActualizarEstadoActual,
  useDarDeBaja,
} from '../../../../hooks/useEquiposBomberiles';
import { EquipoBomberil } from '../../../../interfaces/EquipoBomberil/equipoBomberil';
import { CatalogoEquipo } from '../../../../interfaces/EquipoBomberil/catalogoEquipo';
import ModalDarDeBaja from './Modals/ModalDarDeBaja';

interface Props {
  onEdit?: (equipo: EquipoBomberil) => void;
}

export default function EquipoTable({ onEdit }: Props) {
  const [equipoSeleccionado, setEquipoSeleccionado] = useState<EquipoBomberil | null>(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [expandido, setExpandido] = useState<Record<string, boolean>>({});
  const [mostrarBajas, setMostrarBajas] = useState<Record<string, boolean>>({});

  const { data: equipos = [], isLoading, isError } = useEquiposBomberiles();
  const actualizarEstado = useActualizarEstadoActual();
  const darDeBaja = useDarDeBaja();

  const toggleExpandido = (catalogoId: string) => {
    setExpandido((prev) => ({ ...prev, [catalogoId]: !prev[catalogoId] }));
  };

  const toggleMostrarBajas = (catalogoId: string) => {
    setMostrarBajas((prev) => ({ ...prev, [catalogoId]: !prev[catalogoId] }));
  };

  if (isLoading) return <p>Cargando equipos...</p>;
  if (isError) return <p>Ocurrió un error al cargar los equipos.</p>;

  const agrupados = equipos.reduce((acc, equipo) => {
    const key = equipo.catalogo?.id;
    if (!key) return acc;

    if (!acc[key]) {
      acc[key] = {
        catalogo: equipo.catalogo,
        activos: [],
        dadosDeBaja: [],
      };
    }

    if (equipo.estadoActual === 'dado de baja') {
      acc[key].dadosDeBaja.push(equipo);
    } else {
      acc[key].activos.push(equipo);
    }

    return acc;
  }, {} as Record<string, { catalogo: CatalogoEquipo; activos: EquipoBomberil[]; dadosDeBaja: EquipoBomberil[] }>);

  return (
    <table className="min-w-full border text-sm text-left">
      <thead className="bg-gray-100">
        <tr>
          <th className="px-4 py-2">Tipo</th>
          <th className="px-4 py-2">Fecha de adquisición</th>
          <th className="px-4 py-2">Estado inicial</th>
          <th className="px-4 py-2">Estado actual</th>
          <th className="px-4 py-2">Cantidad</th>
          <th className="px-4 py-2">Acciones</th>
        </tr>
      </thead>
      <tbody>
        {Object.entries(agrupados).map(([catalogoId, grupo]) => {
          const isOpen = expandido[catalogoId] || false;
          const showBajas = mostrarBajas[catalogoId] || false;
          const totalActivos = grupo.activos.reduce((sum, eq) => sum + eq.cantidad, 0);
          const totalBajas = grupo.dadosDeBaja.reduce((sum, eq) => sum + eq.cantidad, 0);

          return (
            <>
              <tr key={catalogoId}>
                <td
                  colSpan={6}
                  className="bg-gray-100 font-bold px-4 py-2 cursor-pointer border-t"
                  onClick={() => toggleExpandido(catalogoId)}
                >
                  {isOpen ? '▼' : '▶'} {grupo.catalogo.nombre} ({grupo.catalogo.tipo}) — Activos: {totalActivos} — De baja: {totalBajas}
                </td>
              </tr>

              {isOpen && (
                <>
                  {grupo.activos.map((equipo) => (
                    <tr key={equipo.id} className="border-t">
                      <td className="px-4 py-2">{equipo.catalogo.nombre}</td>
                      <td className="px-4 py-2">{equipo.fechaAdquisicion}</td>
                      <td className="px-4 py-2">{equipo.estadoInicial}</td>
                      <td className="px-4 py-2">
                        <select
                          value={equipo.estadoActual}
                        onChange={(e) =>
                        actualizarEstado.mutate({
                        id: equipo.id,
                        estadoActual: e.target.value as EquipoBomberil['estadoActual'],
                             })
                               }
                          className="border px-2 py-1 rounded">
                          <option value="activo">Activo</option>
                          <option value="dado de baja">Dado de baja</option>
                        </select>
                      </td>
                      <td className="px-4 py-2">{equipo.cantidad}</td>
                      <td className="px-4 py-2 space-x-2">
                        <button
                          className="text-blue-600 hover:underline"
                          onClick={() => onEdit?.(equipo)}
                        >
                          Editar
                        </button>
                        <button
                          className="text-red-600 hover:underline"
                          onClick={() => {
                            setEquipoSeleccionado(equipo);
                            setMostrarModal(true);
                          }}
                        >
                          Dar de baja
                        </button>
                      </td>
                    </tr>
                  ))}

                  {grupo.dadosDeBaja.length > 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-2 bg-gray-50">
                        <button
                          onClick={() => toggleMostrarBajas(catalogoId)}
                          className="text-sm text-blue-700 hover:underline"
                        >
                          {showBajas ? 'Ocultar' : 'Ver'} equipos dados de baja
                        </button>
                      </td>
                    </tr>
                  )}

                  {showBajas &&
                    grupo.dadosDeBaja.map((equipo) => (
                      <tr key={equipo.id} className="border-t bg-red-50">
                        <td className="px-4 py-2">{equipo.catalogo.nombre}</td>
                        <td className="px-4 py-2">{equipo.fechaAdquisicion}</td>
                        <td className="px-4 py-2">{equipo.estadoInicial}</td>
                        <td className="px-4 py-2">{equipo.estadoActual}</td>
                        <td className="px-4 py-2">{equipo.cantidad}</td>
                        <td className="px-4 py-2 text-gray-400 italic">No editable</td>
                      </tr>
                    ))}
                </>
              )}
            </>
          );
        })}
      </tbody>

      {mostrarModal && equipoSeleccionado && (
        <ModalDarDeBaja
          equipo={equipoSeleccionado}
          onClose={() => setMostrarModal(false)}
          onConfirm={(cantidad) => {
            darDeBaja.mutate(
              { id: equipoSeleccionado.id, cantidad },
              {
                onSuccess: () => {
                  setMostrarModal(false);
                },
              }
            );
          }}
        />
      )}
    </table>
  );
}