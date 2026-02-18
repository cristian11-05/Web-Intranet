import { useState, useEffect } from 'react';
import { Layout } from './Layout';
import { justificationService } from '../services/justification.service';
import { suggestionService } from '../services/suggestion.service';
import { Loader2, FileDown } from 'lucide-react';
import { toast } from 'sonner';

import ExcelJS from 'exceljs';

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

            const workbook = new ExcelJS.Workbook();

            // ========== HOJA 1: JUSTIFICACIONES ==========
            const wsJustif = workbook.addWorksheet('Justificaciones');

            wsJustif.columns = [
                { header: '#', key: 'index', width: 5 },
                { header: 'Colaborador', key: 'colaborador', width: 25 },
                { header: 'Documento', key: 'documento', width: 15 },
                { header: 'Área', key: 'area', width: 20 },
                { header: 'Título', key: 'titulo', width: 30 },
                { header: 'Descripción', key: 'descripcion', width: 50 },
                { header: 'Fecha Evento', key: 'fecha', width: 15 },
                { header: 'H. Inicio', key: 'h_inicio', width: 10 },
                { header: 'H. Fin', key: 'h_fin', width: 10 },
                { header: 'Estado', key: 'estado', width: 15 },
                { header: 'Razón Rechazo', key: 'rechazo', width: 30 },
                { header: 'Registro', key: 'registro', width: 15 }
            ];

            // Estilo de cabeceras
            const headerRowJ = wsJustif.getRow(1);
            headerRowJ.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 };
            headerRowJ.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E40AF' } }; // Blue-800
            headerRowJ.alignment = { vertical: 'middle', horizontal: 'center' };

            justifications.forEach((j, index) => {
                const row = wsJustif.addRow({
                    index: index + 1,
                    colaborador: j.usuario_nombre || 'N/A',
                    documento: j.usuario_documento || 'N/A',
                    area: j.area_nombre || 'N/A',
                    titulo: j.titulo || '',
                    descripcion: j.descripcion || '',
                    fecha: j.fecha_evento || '',
                    h_inicio: j.hora_inicio || '',
                    h_fin: j.hora_fin || '',
                    estado: j.estado?.toUpperCase() || 'PENDIENTE',
                    rechazo: j.razon_rechazo || '',
                    registro: j.fecha_creacion ? new Date(j.fecha_creacion).toLocaleDateString('es-PE') : ''
                });

                // Estilo alternado
                if (index % 2 !== 0) {
                    row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0F9FF' } };
                }

                // Color por estado
                const estadoCell = row.getCell('estado');
                const estado = j.estado?.toLowerCase();
                if (estado === 'aprobado') {
                    estadoCell.font = { bold: true, color: { argb: 'FF065F46' } };
                    estadoCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD1FAE5' } };
                } else if (estado === 'rechazado') {
                    estadoCell.font = { bold: true, color: { argb: 'FF991B1B' } };
                    estadoCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEE2E2' } };
                } else if (estado === 'pendiente') {
                    estadoCell.font = { bold: true, color: { argb: 'FF92400E' } };
                    estadoCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF3C7' } };
                }
            });

            // ========== HOJA 2: REPORTES Y CONSULTAS ==========
            const wsSuggestions = workbook.addWorksheet('Reportes y Consultas');
            wsSuggestions.columns = [
                { header: '#', key: 'index', width: 5 },
                { header: 'Colaborador', key: 'colaborador', width: 25 },
                { header: 'Área', key: 'area', width: 20 },
                { header: 'Tipo', key: 'tipo', width: 25 },
                { header: 'Título', key: 'titulo', width: 30 },
                { header: 'Descripción', key: 'descripcion', width: 50 },
                { header: 'Estado', key: 'estado', width: 15 },
                { header: 'Registro', key: 'registro', width: 15 }
            ];

            const headerRowS = wsSuggestions.getRow(1);
            headerRowS.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 };
            headerRowS.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF059669' } }; // Emerald-600
            headerRowS.alignment = { vertical: 'middle', horizontal: 'center' };

            suggestions.forEach((s, index) => {
                const row = wsSuggestions.addRow({
                    index: index + 1,
                    colaborador: s.usuario_nombre || 'N/A',
                    area: s.area_nombre || 'N/A',
                    tipo: s.tipo === 'sugerencia' ? 'REPORTE DE SITUACIÓN' : 'TE ESCUCHAMOS',
                    titulo: s.titulo || '',
                    descripcion: s.descripcion || '',
                    estado: s.estado?.toUpperCase() || 'PENDIENTE',
                    registro: s.fecha_creacion ? new Date(s.fecha_creacion).toLocaleDateString('es-PE') : ''
                });

                if (index % 2 !== 0) {
                    row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0FDF4' } };
                }

                // Estilos por tipo
                const tipoCell = row.getCell('tipo');
                if (s.tipo === 'sugerencia') {
                    tipoCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDBEAFE' } };
                    tipoCell.font = { bold: true, color: { argb: 'FF1E40AF' } };
                } else {
                    tipoCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEE2E2' } };
                    tipoCell.font = { bold: true, color: { argb: 'FF991B1B' } };
                }
            });

            // Descarga Nativa
            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = window.URL.createObjectURL(blob);
            const anchor = document.createElement('a');
            const fecha = new Date().toLocaleDateString('es-PE').replace(/\//g, '-');
            anchor.href = url;
            anchor.download = `Reporte_RRHH_MASTER_${fecha}.xlsx`;
            anchor.click();
            window.URL.revokeObjectURL(url);

        } catch (error) {
            console.error('Error exportando a Excel:', error);
            toast.error('Error de exportación', { description: 'No se pudo generar el reporte maestro.' });
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

