'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, ResponsiveContainer } from 'recharts';

// Custom hook for incrementing counter animation
const useCounter = (end: number, duration: number = 2000) => {
  const [count, setCount] = useState(0);
  const previousEnd = useRef(end);

  useEffect(() => {
    if (previousEnd.current !== end) {
      let startTimestamp: number | null = null;
      const startValue = count;
      const step = (timestamp: number) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        setCount(Math.floor(startValue + (end - startValue) * progress));
        
        if (progress < 1) {
          window.requestAnimationFrame(step);
        }
      };
      
      window.requestAnimationFrame(step);
      previousEnd.current = end;
    }
  }, [end, duration, count]);

  return count;
};

interface MetricCardProps {
  title: string;
  value: number;
  unit: string;
  color: string;
  delay: number;
  chart?: 'bar' | 'line' | 'pie';
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, unit, color, delay, chart }) => {
  const count = useCounter(value);
  const chartData = getChartData(value, chart);
  
  return (
    <motion.div
      className="rounded-lg shadow-md p-5 bg-white"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 20, delay }}
    >
      <h3 className="text-lg font-semibold text-gray-700 mb-2">{title}</h3>
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-baseline">
            <span className={`text-3xl font-bold ${color}`}>{count}</span>
            <span className="ml-1 text-gray-500">{unit}</span>
          </div>
          <p className="text-sm text-gray-500 mt-1">vs. previous baseline</p>
        </div>
        
        <div className="w-16 h-16">
          {chart && renderChart(chart, chartData, color)}
        </div>
      </div>
    </motion.div>
  );
};

// Helper function to generate chart data
const getChartData = (value: number, chartType?: string) => {
  switch (chartType) {
    case 'bar':
      return [
        { name: 'Before', value: 100 - value },
        { name: 'After', value: 100 }
      ];
    case 'line':
      return [
        { name: 'Q1', value: 100 - value },
        { name: 'Q2', value: 100 - value / 2 },
        { name: 'Q3', value: 100 - value / 3 },
        { name: 'Q4', value: 100 }
      ];
    case 'pie':
      return [
        { name: 'Improved', value: value },
        { name: 'Remaining', value: 100 - value }
      ];
    default:
      return [];
  }
};

// Helper function to render chart based on type
const renderChart = (chartType: string, data: any[], color: string) => {
  const COLORS = [color.replace('text-', ''), '#e5e7eb'];
  const colorCode = getColorCode(color);
  
  switch (chartType) {
    case 'bar':
      return (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" hide domain={[0, 100]} />
            <YAxis type="category" dataKey="name" hide />
            <Bar dataKey="value" fill={colorCode} />
          </BarChart>
        </ResponsiveContainer>
      );
    case 'line':
      return (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <Line type="monotone" dataKey="value" stroke={colorCode} strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      );
    case 'pie':
      return (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={15}
              outerRadius={25}
              paddingAngle={2}
              dataKey="value"
              startAngle={90}
              endAngle={-270}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      );
    default:
      return null;
  }
};

// Helper to convert Tailwind color classes to hex codes
const getColorCode = (tailwindColor: string) => {
  const colorMap: { [key: string]: string } = {
    'text-green-600': '#059669',
    'text-blue-600': '#2563eb',
    'text-red-600': '#dc2626',
    'text-purple-600': '#9333ea',
    'text-amber-600': '#d97706',
  };
  
  return colorMap[tailwindColor] || '#6366f1';
};

interface ProjectionChartProps {
  title: string;
  timeframe: string;
  data: any[];
  color: string;
}

const ProjectionChart: React.FC<ProjectionChartProps> = ({ title, timeframe, data, color }) => {
  return (
    <motion.div
      className="bg-white p-5 rounded-lg shadow-md"
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.4 }}
    >
      <h3 className="text-lg font-semibold text-gray-700 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 mb-4">{timeframe}</p>
      
      <div className="h-60">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="traditional" stroke="#94a3b8" strokeWidth={2} name="Traditional Process" />
            <Line type="monotone" dataKey="agentic" stroke={getColorCode(color)} strokeWidth={3} name="Agentic AI Process" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

interface BusinessImpactMetricsProps {
  useCase: any;
}

const BusinessImpactMetrics: React.FC<BusinessImpactMetricsProps> = ({ useCase }) => {
  // Demo data for business metrics
  const metrics = [
    { title: 'Time Savings', value: 40, unit: '%', color: 'text-blue-600', delay: 0.1, chart: 'line' },
    { title: 'Cost Reduction', value: 65, unit: '%', color: 'text-green-600', delay: 0.2, chart: 'bar' },
    { title: 'Error Reduction', value: 82, unit: '%', color: 'text-red-600', delay: 0.3, chart: 'pie' },
  ];
  
  // Projection data for ROI over time
  const projectionData = [
    { name: 'Week 1', traditional: 100, agentic: 80 },
    { name: 'Week 2', traditional: 100, agentic: 60 },
    { name: 'Week 4', traditional: 100, agentic: 45 },
    { name: 'Week 8', traditional: 100, agentic: 35 },
    { name: 'Week 12', traditional: 100, agentic: 35 },
  ];
  
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800">Business Impact</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {metrics.map((metric, index) => (
          <MetricCard
            key={index}
            title={metric.title}
            value={metric.value}
            unit={metric.unit}
            color={metric.color}
            delay={metric.delay}
            chart={metric.chart as any}
          />
        ))}
      </div>
      
      <ProjectionChart
        title="Process Efficiency Projection"
        timeframe="12-week forecast"
        data={projectionData}
        color="text-blue-600"
      />
    </div>
  );
};

export default BusinessImpactMetrics; 