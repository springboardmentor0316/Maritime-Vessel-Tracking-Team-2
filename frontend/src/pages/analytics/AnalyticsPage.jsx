import React, { useState, useEffect } from 'react';
import vesselService from '../../services/vesselService';
import './AnalyticsPage.css';

// React Icons
import { 
  FaGasPump, 
  FaLeaf, 
  FaStopwatch, 
  FaFire, 
  FaBolt, 
  FaTools 
} from "react-icons/fa";

const AnalyticsPage = () => {
  const [stats, setStats] = useState({
    total_vessels: 0,
    by_status: {},
    by_type: {},
  });
  const [loading, setLoading] = useState(true);
  const [timePeriod, setTimePeriod] = useState('30');
  const [showAlertModal, setShowAlertModal] = useState(false);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      const data = await vesselService.getStatistics();
      setStats(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      setLoading(false);
    }
  };

  const getStatusPercentage = (status) => {
    const count = stats.by_status?.[status] || 0;
    return stats.total_vessels > 0 ? Math.round((count / stats.total_vessels) * 100) : 0;
  };

  const getMetricsForPeriod = () => {
    const baseVessels = stats.total_vessels || 1;

    if (timePeriod === '30') {
      return {
        fuel: { value: Math.round(baseVessels * 10.3), change: -4.2, width: 65 },
        co2: { value: 8.2, change: -1.8, width: 78 },
        wait: { value: 18.5, change: 2.1, width: 42 },
        chartDates: ['OCT 01', 'OCT 08', 'OCT 15', 'OCT 22', 'OCT 29'],
        actualPoints: '0,150 150,140 300,180 450,160 600,170 750,145 900,150',
        targetPoints: '0,100 150,120 300,90 450,110 600,95 750,105 900,100',
        tooltip: 'Oct 29: 890 MT'
      };
    } else if (timePeriod === '90') {
      return {
        fuel: { value: Math.round(baseVessels * 28.8), change: -3.8, width: 58 },
        co2: { value: 8.0, change: -2.3, width: 82 },
        wait: { value: 17.2, change: -1.5, width: 38 },
        chartDates: ['AUG 01', 'AUG 29', 'SEP 26', 'OCT 24', 'NOV 21'],
        actualPoints: '0,140 150,135 300,160 450,145 600,155 750,140 900,138',
        targetPoints: '0,100 150,115 300,95 450,108 600,100 750,110 900,105',
        tooltip: 'Nov 21: 2,650 MT'
      };
    } else {
      return {
        fuel: { value: Math.round(baseVessels * 118.7), change: -5.1, width: 72 },
        co2: { value: 7.9, change: -3.5, width: 85 },
        wait: { value: 16.8, change: -3.2, width: 35 },
        chartDates: ['JAN', 'MAR', 'MAY', 'JUL', 'SEP', 'NOV'],
        actualPoints: '0,160 180,145 360,170 540,150 720,165 900,142',
        targetPoints: '0,110 180,120 360,105 540,115 720,108 900,112',
        tooltip: 'Nov: 10,890 MT'
      };
    }
  };

  const metrics = getMetricsForPeriod();
  const underway = getStatusPercentage('underway') + getStatusPercentage('active');
  const moored = getStatusPercentage('moored') + getStatusPercentage('anchored');

  const allAlerts = [
    {
      id: 1,
      vessel: 'EVER GLORY',
      type: 'fuel',
      icon: <FaFire />,
      description: 'Engine Load > 90% for 4 hours',
      value: '+15% Fuel',
    },
    {
      id: 2,
      vessel: 'HMM ALGECIRAS',
      type: 'speed',
      icon: <FaBolt />,
      description: 'Speed anomaly detected in Zone B',
      value: '+8% Fuel',
    },
    {
      id: 3,
      vessel: 'ONE APUS',
      type: 'maintenance',
      icon: <FaTools />,
      description: 'Auxiliary boiler maintenance due',
      value: 'Maintenance',
    },
  ];

  if (loading) {
    return (
      <div className="analytics-loading">
        <div className="loading-spinner"></div>
        <p>Loading Analytics...</p>
      </div>
    );
  }

  return (
    <div className="analytics-page">

      {/* ---------------- HEADER (Cleaned) ---------------- */}
      <div className="analytics-header">
        <div className="header-left">
          <h1>Operational Analytics</h1>
        </div>

        {/* Search, View as Admin, Notification removed */}
      </div>
      {/* ------------------------------------------------- */}

      <div className="analytics-content">
        <div className="analytics-section">
          <div className="section-header-analytics">
            <div>
              <h2>Fleet Operations Analytics</h2>
              <p className="section-subtitle">Operational efficiency and fuel consumption metrics</p>
            </div>

            <div className="time-period-toggle">
              <button 
                className={timePeriod === '30' ? 'active' : ''} 
                onClick={() => setTimePeriod('30')}
              >
                30 Days
              </button>
              <button 
                className={timePeriod === '90' ? 'active' : ''} 
                onClick={() => setTimePeriod('90')}
              >
                90 Days
              </button>
              <button 
                className={timePeriod === 'year' ? 'active' : ''} 
                onClick={() => setTimePeriod('year')}
              >
                Year
              </button>
            </div>
          </div>

          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-icon fuel"><FaGasPump /></div>
              <div className="metric-content">
                <div className="metric-label">FUEL CONSUMPTION</div>
                <div className="metric-value">
                  {metrics.fuel.value.toLocaleString()} <span className="metric-unit">MT</span>
                  <span className={`metric-change ${metrics.fuel.change < 0 ? 'positive' : 'negative'}`}>
                    {metrics.fuel.change}%
                  </span>
                </div>
                <div className="metric-bar">
                  <div className="metric-bar-fill fuel" style={{ width: `${metrics.fuel.width}%` }}></div>
                </div>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon efficiency"><FaLeaf /></div>
              <div className="metric-content">
                <div className="metric-label">CO2 EFFICIENCY</div>
                <div className="metric-value">
                  {metrics.co2.value} <span className="metric-unit">g/TEU-km</span>
                  <span className="metric-change positive">
                    {metrics.co2.change}%
                  </span>
                </div>
                <div className="metric-bar">
                  <div className="metric-bar-fill efficiency" style={{ width: `${metrics.co2.width}%` }}></div>
                </div>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon wait"><FaStopwatch /></div>
              <div className="metric-content">
                <div className="metric-label">AVG PORT WAIT</div>
                <div className="metric-value">
                  {metrics.wait.value} <span className="metric-unit">Hrs</span>
                  <span className={`metric-change ${metrics.wait.change < 0 ? 'positive' : 'negative'}`}>
                    {metrics.wait.change > 0 ? '+' : ''}{metrics.wait.change}%
                  </span>
                </div>
                <div className="metric-bar">
                  <div className="metric-bar-fill wait" style={{ width: `${metrics.wait.width}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ---------- Charts Section ---------- */}
        <div className="charts-section">
          <div className="chart-card">
            <div className="chart-header">
              <h3>Fleet Emissions vs Target</h3>
              <div className="chart-legend">
                <span className="legend-item">
                  <span className="legend-dot actual"></span>
                  Actual
                </span>
                <span className="legend-item">
                  <span className="legend-dot target"></span>
                  Target
                </span>
              </div>
            </div>

            <div className="chart-container">
              <div className="chart-tooltip">{metrics.tooltip}</div>

              <svg className="emissions-chart" viewBox="0 0 900 300" preserveAspectRatio="none">
                <polyline fill="none" stroke="#64748b" strokeWidth="2" strokeDasharray="8,4" points={metrics.targetPoints} />
                <polyline fill="none" stroke="#4f46e5" strokeWidth="3" points={metrics.actualPoints} />
                <polygon fill="rgba(79, 70, 229, 0.1)" points={`${metrics.actualPoints} 900,300 0,300`} />
              </svg>

              <div className="chart-x-axis">
                {metrics.chartDates.map((date, idx) => (
                  <span key={idx}>{date}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="chart-card distribution">
            <div className="chart-header">
              <h3>Fleet Status Distribution</h3>
            </div>

            <div className="donut-chart-container">
              <div className="donut-chart">
                <svg viewBox="0 0 200 200">
                  <circle cx="100" cy="100" r="80" fill="none" stroke="#1e293b" strokeWidth="40"/>
                  <circle cx="100" cy="100" r="80" fill="none" stroke="#10b981" strokeWidth="40"
                    strokeDasharray={`${underway * 5.03} 503`} transform="rotate(-90 100 100)" />
                  <circle cx="100" cy="100" r="80" fill="none" stroke="#f59e0b" strokeWidth="40"
                    strokeDasharray="110 503" strokeDashoffset={`-${underway * 5.03}`}
                    transform="rotate(-90 100 100)" />
                  <circle cx="100" cy="100" r="80" fill="none" stroke="#64748b" strokeWidth="40"
                    strokeDasharray={`${moored * 5.03} 503`} strokeDashoffset={`-${(underway * 5.03) + 110}`}
                    transform="rotate(-90 100 100)" />
                </svg>

                <div className="donut-center">
                  <div className="donut-value">{stats.total_vessels}</div>
                  <div className="donut-label">TOTAL VESSELS</div>
                </div>
              </div>

              <div className="donut-legend">
                <div className="donut-legend-item">
                  <span className="donut-dot underway"></span>
                  <span>Underway (Efficient)</span>
                  <span className="donut-percent">{underway}%</span>
                </div>

                <div className="donut-legend-item">
                  <span className="donut-dot reduced"></span>
                  <span>Reduced Speed</span>
                  <span className="donut-percent">22%</span>
                </div>

                <div className="donut-legend-item">
                  <span className="donut-dot moored"></span>
                  <span>Moored / Idle</span>
                  <span className="donut-percent">{moored}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ---------- Bottom Section ---------- */}
        <div className="bottom-section">
          <div className="congestion-card">
            <h3>Port Congestion Levels</h3>
            <div className="congestion-list">
              
              <div className="congestion-item">
                <div className="congestion-info">
                  <span className="port-name">Singapore (SIN)</span>
                  <span className="congestion-status high">High (48h)</span>
                </div>
                <div className="congestion-bar-wrapper">
                  <div className="congestion-bar high" style={{ width: '85%' }}></div>
                </div>
              </div>

              <div className="congestion-item">
                <div className="congestion-info">
                  <span className="port-name">Rotterdam (RTM)</span>
                  <span className="congestion-status moderate">Moderate (24h)</span>
                </div>
                <div className="congestion-bar-wrapper">
                  <div className="congestion-bar moderate" style={{ width: '55%' }}></div>
                </div>
              </div>

              <div className="congestion-item">
                <div className="congestion-info">
                  <span className="port-name">Los Angeles (LAX)</span>
                  <span className="congestion-status low">Low (6h)</span>
                </div>
                <div className="congestion-bar-wrapper">
                  <div className="congestion-bar low" style={{ width: '25%' }}></div>
                </div>
              </div>

              <div className="congestion-item">
                <div className="congestion-info">
                  <span className="port-name">Shanghai (SHA)</span>
                  <span className="congestion-status moderate">Moderate (18h)</span>
                </div>
                <div className="congestion-bar-wrapper">
                  <div className="congestion-bar moderate" style={{ width: '48%' }}></div>
                </div>
              </div>

            </div>
          </div>

          <div className="alerts-card">
            <div className="alerts-card-header">
              <h3>High Consumption Alerts</h3>
              <button className="view-all-btn" onClick={() => setShowAlertModal(true)}>
                View All
              </button>
            </div>

            <div className="alerts-list">
              {allAlerts.map(alert => (
                <div key={alert.id} className="alert-item">
                  <div className={`alert-icon-circle ${alert.type}-alert`}>
                    {alert.icon}
                  </div>
                  <div className="alert-info">
                    <div className="alert-name">{alert.vessel}</div>
                    <div className="alert-description">{alert.description}</div>
                  </div>
                  <div className={`alert-value ${alert.type === 'maintenance' ? 'maintenance' : 'fuel-high'}`}>
                    {alert.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {showAlertModal && (
        <div className="modal-overlay" onClick={() => setShowAlertModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>All High Consumption Alerts</h2>
              <button className="modal-close" onClick={() => setShowAlertModal(false)}>Close</button>
            </div>

            <div className="modal-body">
              {allAlerts.map(alert => (
                <div key={alert.id} className="modal-alert-item">
                  <div className="modal-alert-header">
                    <span className="modal-alert-icon">{alert.icon}</span>
                    <div>
                      <div className="modal-alert-vessel">{alert.vessel}</div>
                    </div>
                  </div>

                  <div className="modal-alert-body">
                    <p>{alert.description}</p>
                    <div className="modal-alert-impact">{alert.value}</div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default AnalyticsPage;
