import { useState, useEffect } from 'react';
import { Layout } from './Layout';
import { justificationService } from '../services/justification.service';
import { suggestionService } from '../services/suggestion.service';
import { Loader2, FileDown } from 'lucide-react';
import * as XLSX from 'xlsx-js-style';

const StatCard = ({ title, count, subtitle, type }: { title: string; count: number; subtitle: string; type?: 'default' | 'success' | 'warning' | 'danger' }) => {
    const colorClasses = {
        success: {
            bg: 'bg-emerald-500/10',
            text: 'text-emerald-500',
            border: 'border-emerald-500/20',
            shadow: 'shadow-emerald-200/40',
            dot: 'bg-emerald-500'
        },
        warning: {
            bg: 'bg-amber-500/10',
            text: 'text-amber-500',
            border: 'border-amber-500/20',
            shadow: 'shadow-amber-200/40',
            dot: 'bg-amber-500'
        },
        danger: {
            bg: 'bg-rose-500/10',
            text: 'text-rose-500',
            border: 'border-rose-500/20',
            shadow: 'shadow-rose-200/40',
            dot: 'bg-rose-500'
        },
        default: {
            bg: 'bg-blue-500/10',
            text: 'text-blue-500',
            border: 'border-blue-500/20',
            shadow: 'shadow-blue-200/40',
            dot: 'bg-blue-500'
        }
    };

    const colors = colorClasses[type || 'default'];

    return (
        <div className={`relative group bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/30 hover:shadow-2xl hoverShadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] hover:-translate-y-2 transition-all duration-500 overflow-hidden`}>
            {/* Background Accent */}
            <div className={`absolute top-0 right-0 w-32 h-32 ${colors.bg} rounded-full -mr-16 -mt-16 blur-3xl opacity-50 group-hover:scale-150 transition-transform duration-700`}></div>

            <div className="relative z-10 flex flex-col items-center">
                <div className={`flex items-center space-x-2 mb-4 px-4 py-1.5 rounded-full ${colors.bg} ${colors.border} border ring-4 ring-white shadow-sm`}>
                    <div className={`w-2 h-2 rounded-full ${colors.dot} animate-pulse`}></div>
                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${colors.text}`}>{title}</span>
                </div>

                <span className={`text-6xl font-black mb-1 tracking-tighter ${type === 'danger' ? 'text-rose-500' : type === 'success' ? 'text-emerald-500' : type === 'warning' ? 'text-amber-500' : 'text-slate-900'} font-mono tabular-nums group-hover:scale-110 transition-transform duration-500`}>
                    {count}
                </span>

                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-2 opacity-70 group-hover:opacity-100 transition-opacity">
                    {subtitle}
                </p>

                {/* Decorative Data Indicator */}
                <div className="w-full h-1.5 bg-slate-50 rounded-full mt-6 overflow-hidden border border-slate-100 shadow-inner">
                    <div className={`h-full ${colors.dot} rounded-full opacity-60 group-hover:opacity-100 transition-all duration-700 w-3/4 shadow-[0_0_10px_rgba(0,0,0,0.1)] group-hover:w-[85%]`}></div>
                </div>
            </div>

            {/* Bottom Glow */}
            <div className={`absolute -bottom-2 lg:-bottom-6 left-1/2 -translate-x-1/2 w-1/2 h-4 ${colors.bg} blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
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
                <div className="relative overflow-hidden bg-white p-10 rounded-[3rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-slate-100 mb-12">
                    {/* Abstract Shapes for Premium Background */}
                    <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-br from-aquanqa-blue/5 to-transparent rounded-full -mr-32 -mt-32 blur-3xl -z-10"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-50 rounded-full -ml-20 -mb-20 blur-3xl opacity-30 -z-10"></div>

                    <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                        <div className="flex items-center space-x-6">
                            <div className="w-1.5 h-16 bg-gradient-to-b from-aquanqa-blue to-blue-600 rounded-full"></div>
                            <div>
                                <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-none mb-3">Panel Informativo</h2>
                                <div className="flex items-center space-x-3">
                                    <span className="w-2 h-2 bg-aquanqa-green rounded-full animate-pulse"></span>
                                    <p className="text-slate-400 text-xs font-black uppercase tracking-[0.2em]">Resumen general de gestión estratégica</p>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={exportToExcel}
                            disabled={exporting}
                            className={`group relative overflow-hidden bg-aquanqa-blue text-white hover:bg-aquanqa-dark hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-200/60 transition-all active:scale-95 font-black px-10 py-5 rounded-[2rem] text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-blue-100/50 flex items-center justify-center space-x-4 disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                            {exporting ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} />
                                    <span>Generando Reporte Estratégico...</span>
                                </>
                            ) : (
                                <>
                                    <div className="p-2 bg-white/10 rounded-xl group-hover:scale-110 transition-transform">
                                        <FileDown size={22} strokeWidth={2.5} />
                                    </div>
                                    <div className="flex flex-col items-start leading-tight">
                                        <span className="text-[12px]">Descargar Reporte Master</span>
                                        <span className="text-[9px] opacity-60 font-bold">FORMATO EXCEL PROFESIONAL</span>
                                    </div>
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Sección Justificaciones */}
                <div className="mb-16">
                    <div className="flex items-center space-x-4 mb-10">
                        <div className="w-10 h-1 bg-slate-200 rounded-full"></div>
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Resumen de Justificaciones</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        <StatCard count={stats.totalJustif} title="TOTAL" subtitle="TOTAL DE JUSTIFICACIONES" />
                        <StatCard count={stats.aprobadas} title="APROBADAS" subtitle="SOLICITUDES APROBADAS" type="success" />
                        <StatCard count={stats.pendientes} title="PENDIENTES" subtitle="POR REVISAR" type="warning" />
                        <StatCard count={stats.rechazadas} title="RECHAZADAS" subtitle="SOLICITUDES RECHAZADAS" type="danger" />
                    </div>
                </div>

                <div>
                    <div className="flex items-center space-x-4 mb-10">
                        <div className="w-10 h-1 bg-slate-200 rounded-full"></div>
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Reportes y Consultas</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        <StatCard count={stats.totalSugerencias} title="CONSOLIDADO" subtitle="REPORTES + CONSULTAS" />
                        <StatCard count={stats.sugerencias} title="SITUACIÓN" subtitle="IDEAS Y PROPUESTAS" type="success" />
                        <StatCard count={stats.reclamos} title="INCIDENCIAS" subtitle="REPORTES DE PROBLEMAS" type="danger" />
                    </div>
                </div>
            </div>
        </Layout>
    );
};

