import React, { useMemo } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

interface ChartPreviewProps {
    jsonInput: string;
    chartType: 'line' | 'bar' | 'pie';
    exportWidth?: string;
    exportHeight?: string;
    onDimensionsChange?: (width: number, height: number) => void;
    previewRef?: React.RefObject<HTMLDivElement | null>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export const ChartPreview: React.FC<ChartPreviewProps> = ({
    jsonInput,
    chartType,
    exportWidth,
    exportHeight,
}) => {
    const data = useMemo(() => {
        try {
            const parsed = JSON.parse(jsonInput);
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            return [];
        }
    }, [jsonInput]);

    const { xKey, valueKey, dataKeys } = useMemo(() => {
        if (data.length === 0) return { xKey: '', valueKey: '', dataKeys: [] };
        const keys = data.length > 0 && typeof data[0] === 'object' ? Object.keys(data[0]) : [];
        if (keys.length === 0) return { xKey: '', valueKey: '', dataKeys: [] };

        const x = keys.find(k => k.toLowerCase() === 'name' || k.toLowerCase() === 'label' || k.toLowerCase() === 'x') || keys[0];
        const d = keys.filter(k => k !== x && k.toLowerCase() !== 'color' && k.toLowerCase() !== 'fill');
        return { xKey: x, valueKey: d[0], dataKeys: d };
    }, [data]);

    const sortedPieData = useMemo(() => {
        if (chartType !== 'pie' || !valueKey) return [];
        return [...data].sort((a, b) => {
            const va = Number(a[valueKey]) || 0;
            const vb = Number(b[valueKey]) || 0;
            return vb - va;
        });
    }, [data, chartType, valueKey]);

    const randomColors = useMemo(() => {
        return sortedPieData.map(() => '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'));
    }, [sortedPieData]);

    const renderChart = () => {
        if (data.length === 0) return <div style={{ color: '#888', padding: '20px' }}>No data or invalid JSON</div>;
        if (!xKey) return <div style={{ color: '#888', padding: '20px' }}>Invalid data format</div>;

        if (chartType === 'line') {
            return (
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey={xKey} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        {dataKeys.map((key, i) => (
                            <Line key={key} type="monotone" dataKey={key} stroke={COLORS[i % COLORS.length]} />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            );
        } else if (chartType === 'bar') {
            return (
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey={xKey} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        {dataKeys.map((key, i) => (
                            <Bar key={key} dataKey={key} fill={COLORS[i % COLORS.length]} />
                        ))}
                    </BarChart>
                </ResponsiveContainer>
            );
        } else if (chartType === 'pie') {
            if (!valueKey) return <div>Not enough data for pie chart</div>;

            const total = sortedPieData.reduce((sum, item) => sum + (Number(item[valueKey]) || 0), 0);

            const renderLegend = (value: string) => {
                // value corresponds to nameKey (xKey)
                const item = sortedPieData.find(d => d[xKey] === value);
                const val = item ? (Number(item[valueKey]) || 0) : 0;
                const percent = total > 0 ? ((val / total) * 100).toFixed(1) : '0';
                return <span style={{ color: '#333' }}>{value} ({percent}%)</span>;
            };

            return (
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={sortedPieData}
                            dataKey={valueKey}
                            nameKey={xKey}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            fill="#8884d8"
                            label={(entry) => entry.name}
                        >
                            {sortedPieData.map((entry: any, index) => {
                                const rawColor = entry.fill || entry.color;
                                const color = rawColor === 'random' ? randomColors[index] : (rawColor || COLORS[index % COLORS.length]);
                                return <Cell key={`cell-${index}`} fill={color} />;
                            })}
                        </Pie>
                        <Tooltip />
                        <Legend
                            verticalAlign="bottom"
                            align="center"
                            formatter={renderLegend}
                        />
                    </PieChart>
                </ResponsiveContainer>
            );
        }
    };

    return (
        <div style={{
            width: exportWidth ? `${parseInt(exportWidth)}px` : '100%',
            height: exportHeight ? `${parseInt(exportHeight)}px` : '400px',
            minWidth: exportWidth ? undefined : '600px',
        }}>
            {renderChart()}
        </div>
    );
};
