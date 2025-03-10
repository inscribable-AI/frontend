import React from 'react';
import { Line } from 'react-chartjs-2';

function ChartCard({
  title = 'Chart Data',
  subtitle = '',
  period = '',
  data,
  height = 400,
  chartType = 'line',
  options = {},
  className = '',
}) {
  // Default chart options based on the inspiration image
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        padding: 12,
        titleFont: {
          size: 14,
          weight: 'bold',
        },
        bodyFont: {
          size: 13,
        },
        borderColor: 'rgba(0, 0, 0, 0.1)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD'
              }).format(context.parsed.y);
            }
            
            // Add percentage change if available
            const dataIndex = context.dataIndex;
            if (dataIndex > 0) {
              const currentValue = context.parsed.y;
              const previousValue = context.dataset.data[dataIndex - 1];
              const percentChange = ((currentValue - previousValue) / previousValue) * 100;
              
              if (!isNaN(percentChange)) {
                const sign = percentChange >= 0 ? '+' : '';
                label += ` ${sign}${percentChange.toFixed(1)}%`;
              }
            }
            
            return label;
          }
        }
      },
    },
    scales: {
      x: {
        grid: {
          display: true,
          drawBorder: false,
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          color: 'rgb(156, 163, 175)',
          maxRotation: 0,
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false,
        },
        ticks: {
          color: 'rgb(156, 163, 175)',
          callback: function(value) {
            if (value >= 1000) {
              return value / 1000 + 'k';
            }
            return value;
          }
        }
      },
    },
    elements: {
      line: {
        tension: 0.4,
        borderWidth: 2,
      },
      point: {
        radius: 0,
        hitRadius: 10,
        hoverRadius: 5,
      }
    },
  };

  // Merge default options with passed options
  const chartOptions = { ...defaultOptions, ...options };

  // Generate sample data if none provided
  const chartData = data || {
    labels: Array.from({ length: 30 }, (_, i) => `${i + 1}`),
    datasets: [
      {
        label: title,
        data: Array.from({ length: 30 }, () => Math.floor(Math.random() * 8000) + 1000),
        borderColor: 'rgb(37, 99, 235)',
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        fill: true,
        tension: 0.4,
      }
    ]
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm ${className}`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs text-gray-400 dark:text-gray-500">
              {subtitle}
            </p>
          )}
          {period && (
            <p className="text-xs text-gray-400 dark:text-gray-500">
              {period}
            </p>
          )}
        </div>
        <button className="text-gray-400 hover:text-gray-500">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </div>
      <div style={{ height: `${height}px` }} className="w-full">
        <Line 
          data={chartData} 
          options={chartOptions}
          className="w-full h-full"
        />
      </div>
    </div>
  );
}

export default ChartCard; 