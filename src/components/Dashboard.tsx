import { useState, useEffect } from 'react';
import { Layout } from './Layout';
import { justificationService } from '../services/justification.service';
import { suggestionService } from '../services/suggestion.service';
import { Loader2, FileDown } from 'lucide-react';
import * as XLSX from 'xlsx-js-style';

const StatCard = ({ title, count, subtitle, type }: { title: string; count: number; subtitle: string; type?: 'default' | 'success' | 'warning' | 'danger' }) => {
    return (
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
            <div className={`absolute top-0 left-0 w-2 h-full ${type === 'success' ? 'bg-aquanqa-green' : type === 'warning' ? 'bg-amber-400' : type === 'danger' ? 'bg-rose-500' : 'bg-aquanqa-blue'}`}></div>
            <div className="flex flex-col items-center relative z-10">
                <span className={`text-5xl font-black mb-3 tracking-tighter ${type === 'success' ? 'text-aquanqa-green' :
                    type === 'warning' ? 'text-amber-500' :
                        type === 'danger' ? 'text-rose-500' : 'text-slate-800'
                    }`}>
                    {count}
                </span>
                <h3 className="text-slate-800 font-extrabold text-sm mb-1 uppercase tracking-widest">{title}</h3>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{subtitle}</p>
            </div>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-slate-50 rounded-full group-hover:scale-150 transition-transform duration-500 -z-0 opacity-50"></div>
        </div>
    );
};

export const Dashboard = () => {
    const [stats, setStats] = useState({
        totalJustif: 0,
        aprobadas: 0,
        pendientes: 0,
        rechazadas: 0,
        totalSugerencias: 0,
        reclamos: 0,
        sugerencias: 0,
    });
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);

    useEffect(() => {
        loadDashboardStats();
    }, []);

    const loadDashboardStats = async () => {
        try {
            setLoading(true);
            const [justif, sug] = await Promise.all([
                justificationService.getAllJustifications(),
                suggestionService.getAllSuggestions(),
            ]);

            setStats({
                totalJustif: justif.length,
                aprobadas: justif.filter(j => j.estado?.toLowerCase() === 'aprobado').length,
                pendientes: justif.filter(j => j.estado?.toLowerCase() === 'pendiente').length,
                rechazadas: justif.filter(j => j.estado?.toLowerCase() === 'rechazado').length,
                totalSugerencias: sug.length,
                reclamos: sug.filter(s => {
                    const tipo = s.tipo?.toLowerCase() || '';
                    return tipo.includes('reclamo') || tipo.includes('escuchamos');
                }).length,
                sugerencias: sug.filter(s => {
                    const tipo = s.tipo?.toLowerCase() || '';
                    return !tipo.includes('reclamo') && !tipo.includes('escuchamos');
                }).length,
            });
        } catch (error) {
            console.error('Error cargando estadísticas:', error);
        } finally {
            setLoading(false);
        }
    };

    const exportToExcel = async () => {
        try {
            setExporting(true);

            // Obtener todos los datos
            const [justifications, suggestions] = await Promise.all([
                justificationService.getAllJustifications(),
                suggestionService.getAllSuggestions(),
            ]);

            // Preparar datos de Justificaciones
            const justifData = justifications.map((j, index) => ({
                '#': index + 1,
                'Colaborador': j.usuario_nombre || 'N/A',
                'Documento': j.usuario_documento || 'N/A',
                'Área': j.area_nombre || 'N/A',
                'Título': j.titulo || '',
                'Descripción': j.descripcion || '',
                'Fecha Evento': j.fecha_evento || '',
                'Hora Inicio': j.hora_inicio || '',
                'Hora Fin': j.hora_fin || '',
                'Estado': j.estado === 'aprobado' ? 'Aprobado' :
                    j.estado === 'rechazado' ? 'Rechazado' :
                        j.estado === 'en_proceso' ? 'En Proceso' : 'Pendiente',
                'Razón Rechazo': j.razon_rechazo || '',
                'Fecha Creación': j.fecha_creacion ? new Date(j.fecha_creacion).toLocaleDateString('es-PE') : '',
                'Fecha Actualización': j.fecha_actualizacion ? new Date(j.fecha_actualizacion).toLocaleDateString('es-PE') : '',
            }));

            // Preparar datos de Reportes y Consultas
            const suggestionsData = suggestions.map((s, index) => ({
                '#': index + 1,
                'Colaborador': s.usuario_nombre || 'N/A',
                'Área': s.area_nombre || 'N/A',
                'Tipo': s.tipo === 'sugerencia' ? 'Reporte de Situación' : 'Te Escuchamos',
                'Título': s.titulo || '',
                'Descripción': s.descripcion || '',
                'Estado': s.estado === 'revisada' ? 'Revisada' : 'Pendiente',
                'Comentario Admin': s.comentario_admin || '',
                'Fecha Creación': s.fecha_creacion ? new Date(s.fecha_creacion).toLocaleDateString('es-PE') : '',
                'Fecha Actualización': s.fecha_actualizacion ? new Date(s.fecha_actualizacion).toLocaleDateString('es-PE') : '',
            }));

            // Crear libro de Excel
            const wb = XLSX.utils.book_new();

            // ========== HOJA 1: JUSTIFICACIONES ==========
            const wsJustif = XLSX.utils.json_to_sheet(justifData);

            // Ajustar ancho de columnas
            const justifColWidths = [
                { wch: 5 }, { wch: 25 }, { wch: 12 }, { wch: 20 }, { wch: 30 },
                { wch: 50 }, { wch: 12 }, { wch: 10 }, { wch: 10 }, { wch: 14 },
                { wch: 30 }, { wch: 15 }, { wch: 15 },
            ];
            wsJustif['!cols'] = justifColWidths;

            // Definir columnas para la hoja de Justificaciones
            const justifAlphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M'];

            // Aplicar estilos a encabezados (fila 1)
            justifAlphabet.forEach(col => {
                const cellRef = `${col}1`;
                if (wsJustif[cellRef]) {
                    wsJustif[cellRef].s = {
                        fill: { fgColor: { rgb: "1E40AF" } }, // Azul oscuro (Tailwind blue-800)
                        font: { bold: true, color: { rgb: "FFFFFF" }, sz: 12 },
                        alignment: { horizontal: "center", vertical: "center" },
                        border: {
                            top: { style: "thin", color: { rgb: "000000" } },
                            bottom: { style: "thin", color: { rgb: "000000" } },
                            left: { style: "thin", color: { rgb: "000000" } },
                            right: { style: "thin", color: { rgb: "000000" } }
                        }
                    };
                }
            });

            // Aplicar estilos a datos y colores alternados
            const justifRowCount = justifData.length;
            for (let row = 2; row <= justifRowCount + 1; row++) {
                const isEven = row % 2 === 0;

                justifAlphabet.forEach((col) => {
                    const cellRef = `${col}${row}`;
                    if (!wsJustif[cellRef]) wsJustif[cellRef] = { v: '' };

                    // Color de fondo alternado
                    const bgColor = isEven ? "F0F9FF" : "FFFFFF"; // Azul muy claro / Blanco

                    // Estilo base
                    wsJustif[cellRef].s = {
                        fill: { fgColor: { rgb: bgColor } },
                        font: { sz: 10, color: { rgb: "1E293B" } }, // Slate-800
                        alignment: { vertical: "center", wrapText: true },
                        border: {
                            top: { style: "thin", color: { rgb: "E5E7EB" } },
                            bottom: { style: "thin", color: { rgb: "E5E7EB" } },
                            left: { style: "thin", color: { rgb: "E5E7EB" } },
                            right: { style: "thin", color: { rgb: "E5E7EB" } }
                        }
                    };

                    // Centrar columnas específicas
                    if (col === 'A' || col === 'C' || col === 'G' || col === 'H' || col === 'I' || col === 'J' || col === 'L' || col === 'M') {
                        wsJustif[cellRef].s.alignment = { ...wsJustif[cellRef].s.alignment, horizontal: "center" };
                    }

                    // Colorear según estado (columna J)
                    if (col === 'J' && wsJustif[cellRef].v) {
                        const estado = wsJustif[cellRef].v.toString();
                        if (estado === 'Aprobado') {
                            wsJustif[cellRef].s.fill = { fgColor: { rgb: "D1FAE5" } }; // Verde claro (Emerald-100)
                            wsJustif[cellRef].s.font = { bold: true, color: { rgb: "065F46" }, sz: 10 }; // Emerald-800
                        } else if (estado === 'Rechazado') {
                            wsJustif[cellRef].s.fill = { fgColor: { rgb: "FEE2E2" } }; // Rojo claro (Rose-100)
                            wsJustif[cellRef].s.font = { bold: true, color: { rgb: "991B1B" }, sz: 10 }; // Rose-800
                        } else if (estado === 'Pendiente') {
                            wsJustif[cellRef].s.fill = { fgColor: { rgb: "FEF3C7" } }; // Amarillo claro (Amber-100)
                            wsJustif[cellRef].s.font = { bold: true, color: { rgb: "92400E" }, sz: 10 }; // Amber-800
                        }
                    }
                });
            }

            // ========== HOJA 2: REPORTES Y CONSULTAS ==========
            const wsSuggestions = XLSX.utils.json_to_sheet(suggestionsData);

            // Ajustar ancho de columnas
            const suggestionsColWidths = [
                { wch: 5 }, { wch: 25 }, { wch: 20 }, { wch: 20 }, { wch: 30 },
                { wch: 50 }, { wch: 12 }, { wch: 40 }, { wch: 15 }, { wch: 15 },
            ];
            wsSuggestions['!cols'] = suggestionsColWidths;

            // Definir columnas para la hoja de Sugerencias
            const sugAlphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

            // Aplicar estilos a encabezados
            sugAlphabet.forEach(col => {
                const cellRef = `${col}1`;
                if (wsSuggestions[cellRef]) {
                    wsSuggestions[cellRef].s = {
                        fill: { fgColor: { rgb: "059669" } }, // Verde oscuro (Emerald-600)
                        font: { bold: true, color: { rgb: "FFFFFF" }, sz: 12 },
                        alignment: { horizontal: "center", vertical: "center" },
                        border: {
                            top: { style: "thin", color: { rgb: "000000" } },
                            bottom: { style: "thin", color: { rgb: "000000" } },
                            left: { style: "thin", color: { rgb: "000000" } },
                            right: { style: "thin", color: { rgb: "000000" } }
                        }
                    };
                }
            });

            // Aplicar estilos a datos
            const sugRowCount = suggestionsData.length;
            for (let row = 2; row <= sugRowCount + 1; row++) {
                const isEven = row % 2 === 0;

                sugAlphabet.forEach((col) => {
                    const cellRef = `${col}${row}`;
                    if (!wsSuggestions[cellRef]) wsSuggestions[cellRef] = { v: '' };

                    const bgColor = isEven ? "F0FDF4" : "FFFFFF"; // Verde muy claro / Blanco

                    wsSuggestions[cellRef].s = {
                        fill: { fgColor: { rgb: bgColor } },
                        font: { sz: 10, color: { rgb: "1E293B" } }, // Slate-800
                        alignment: { vertical: "center", wrapText: true },
                        border: {
                            top: { style: "thin", color: { rgb: "E5E7EB" } },
                            bottom: { style: "thin", color: { rgb: "E5E7EB" } },
                            left: { style: "thin", color: { rgb: "E5E7EB" } },
                            right: { style: "thin", color: { rgb: "E5E7EB" } }
                        }
                    };

                    // Centrar columnas específicas
                    if (col === 'A' || col === 'C' || col === 'D' || col === 'G' || col === 'I' || col === 'J') {
                        wsSuggestions[cellRef].s.alignment = { ...wsSuggestions[cellRef].s.alignment, horizontal: "center" };
                    }

                    // Colorear según estado (columna G)
                    if (col === 'G' && wsSuggestions[cellRef].v) {
                        const estado = wsSuggestions[cellRef].v.toString();
                        if (estado === 'Revisada') {
                            wsSuggestions[cellRef].s.fill = { fgColor: { rgb: "D1FAE5" } };
                            wsSuggestions[cellRef].s.font = { bold: true, color: { rgb: "065F46" }, sz: 10 };
                        } else if (estado === 'Pendiente') {
                            wsSuggestions[cellRef].s.fill = { fgColor: { rgb: "FEF3C7" } };
                            wsSuggestions[cellRef].s.font = { bold: true, color: { rgb: "92400E" }, sz: 10 };
                        }
                    }

                    // Colorear según tipo (columna D)
                    if (col === 'D' && wsSuggestions[cellRef].v) {
                        const tipo = wsSuggestions[cellRef].v.toString();
                        if (tipo === 'Reporte de Situación') {
                            wsSuggestions[cellRef].s.fill = { fgColor: { rgb: "DBEAFE" } }; // Azul claro (Blue-100)
                            wsSuggestions[cellRef].s.font = { bold: true, color: { rgb: "1E40AF" }, sz: 10 }; // Blue-800
                        } else if (tipo === 'Te Escuchamos') {
                            wsSuggestions[cellRef].s.fill = { fgColor: { rgb: "FEE2E2" } }; // Rojo claro (Rose-100)
                            wsSuggestions[cellRef].s.font = { bold: true, color: { rgb: "991B1B" }, sz: 10 }; // Rose-800
                        }
                    }
                });
            }

            // Agregar hojas al libro
            XLSX.utils.book_append_sheet(wb, wsJustif, 'Justificaciones');
            XLSX.utils.book_append_sheet(wb, wsSuggestions, 'Reportes y Consultas');

            // Generar nombre de archivo con fecha actual
            const fecha = new Date().toLocaleDateString('es-PE').replace(/\//g, '-');
            const fileName = `Reporte_RRHH_${fecha}.xlsx`;

            // Descargar archivo
            XLSX.writeFile(wb, fileName);

        } catch (error) {
            console.error('Error exportando a Excel:', error);
            alert('Error al generar el archivo Excel. Por favor intenta nuevamente.');
        } finally {
            setExporting(false);
        }
    };

    if (loading) {
        return (
            <Layout>
                <div className="h-[60vh] flex flex-col items-center justify-center text-slate-400">
                    <Loader2 className="animate-spin mb-4" size={48} />
                    <p className="font-bold">Cargando tablero informativo...</p>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="space-y-8 animate-in fade-in duration-700">
                {/* Header Global del Dashboard con Botón de Descarga Único */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/50 p-6 rounded-[2rem] border border-slate-100 shadow-sm mb-8">
                    <div>
                        <h2 className="text-3xl font-black text-slate-800 tracking-tight">Panel Informativo</h2>
                        <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-1">Resumen general de gestión</p>
                    </div>
                    <button
                        onClick={exportToExcel}
                        disabled={exporting}
                        className="w-full sm:w-auto bg-aquanqa-green text-white hover:bg-emerald-600 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-green-200/50 transition-all active:scale-95 font-black px-8 py-3.5 rounded-2xl text-[11px] uppercase tracking-widest shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-white"
                    >
                        {exporting ? (
                            <>
                                <Loader2 className="animate-spin" size={18} />
                                <span>Generando Reporte...</span>
                            </>
                        ) : (
                            <>
                                <FileDown size={18} />
                                <span>Descargar Reporte Completo Excel</span>
                            </>
                        )}
                    </button>
                </div>

                {/* Sección Justificaciones */}
                <div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Resumen de Justificaciones</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <StatCard count={stats.totalJustif} title="Total" subtitle="Total de Justificaciones" />
                        <StatCard count={stats.aprobadas} title="Aprobadas" subtitle="Solicitudes aprobadas" type="success" />
                        <StatCard count={stats.pendientes} title="Pendientes" subtitle="Por revisar" type="warning" />
                        <StatCard count={stats.rechazadas} title="Rechazadas" subtitle="Solicitudes rechazadas" type="danger" />
                    </div>
                </div>

                <div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Reportes y Consultas</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <StatCard count={stats.totalSugerencias} title="Total General" subtitle="Reportes + Consultas" />
                        <StatCard count={stats.sugerencias} title="Reporte de situación" subtitle="Ideas y propuestas" type="success" />
                        <StatCard count={stats.reclamos} title="Te escuchamos" subtitle="Reportes de problemas" type="danger" />
                    </div>
                </div>
            </div>
        </Layout>
    );
};

