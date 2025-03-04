// src/components/HomePage.js
import React, { useEffect, useState, useCallback, useContext } from 'react';
import {
  Card,
  Row,
  Col,
  Alert,
  Form,
  Button,
  Table,
  Spinner,
} from 'react-bootstrap';
import { Scatter } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ThemeContext } from '../context/ThemeContext';
import apiService from '../utils/api';
import useAuth from '../hooks/useAuth';
import moment from 'moment';

ChartJS.register(LinearScale, PointElement, Tooltip, Legend);

function HomePage() {
  const [summary, setSummary] = useState(null);
  const [warnings, setWarnings] = useState([]);
  const [location, setLocation] = useState('US');
  const [tempLocation, setTempLocation] = useState('US'); // Temporary location for typing
  const [correlationData, setCorrelationData] = useState(null);
  const [isLoadingCorrelation, setIsLoadingCorrelation] = useState(false);
  const [recentData, setRecentData] = useState([]);
  const [sortField, setSortField] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [refreshInterval, setRefreshInterval] = useState(0);
  const [isLoadingPage, setIsLoadingPage] = useState(false);
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);
  const { isAuthenticated } = useAuth();

  const checkAuth = useCallback(async () => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [navigate, isAuthenticated]);

  const fetchSummaryInsights = useCallback(async () => {
    try {
      const response = await apiService.data.getSummaryInsights();
      setSummary(response.data);
    } catch (error) {
      console.error('Error fetching summary insights:', error);
      setSummary(null);
    }
  }, []);

  const fetchWarnings = useCallback(async () => {
    try {
      const response = await apiService.data.getWarnings();
      setWarnings(response.data);
    } catch (error) {
      console.error('Error fetching warnings:', error);
      setWarnings([]);
    }
  }, []);

  const fetchCorrelationData = useCallback(async () => {
    setIsLoadingCorrelation(true);
    try {
      const response = await apiService.data.getCorrelationData(location);
      setCorrelationData({
        temperature: response.data.temperature,
        turbidity: response.data.turbidity,
        ph_value: response.data.ph_value,
      });
    } catch (error) {
      console.error('Error fetching correlation data:', error);
      setCorrelationData(null);
    } finally {
      setIsLoadingCorrelation(false);
    }
  }, [location]);

  const fetchRecentData = useCallback(async () => {
    try {
      const response = await apiService.data.getRecentData();
      setRecentData(response.data);
    } catch (error) {
      console.error('Error fetching recent data:', error);
      setRecentData([]);
    }
  }, []);

  const fetchAllData = useCallback(async () => {
    setIsLoadingPage(true);
    await Promise.all([
      fetchSummaryInsights(),
      fetchWarnings(),
      fetchCorrelationData(),
      fetchRecentData(),
    ]);
    setIsLoadingPage(false);
  }, [fetchSummaryInsights, fetchWarnings, fetchCorrelationData, fetchRecentData]);

  const handleSort = (field) => {
    const order = sortField === field && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortOrder(order);
  };

  const prepareChartData = (xData, yData, xLabel, yLabel) => ({
    datasets: [
      {
        label: `${yLabel} vs ${xLabel}`,
        data: xData.map((x, index) => ({ x, y: yData[index] })),
        backgroundColor:
          theme === 'dark' ? 'rgba(255, 215, 0, 1)' : 'rgba(75, 192, 192, 1)',
        borderColor:
          theme === 'dark' ? 'rgba(255, 215, 0, 0.8)' : 'rgba(75, 192, 192, 0.8)',
        pointRadius: 6,
      },
    ],
  });

  const sortedData = [...recentData].sort((a, b) => {
    if (sortField === 'location') {
      return sortOrder === 'asc'
        ? a.location.localeCompare(b.location)
        : b.location.localeCompare(a.location);
    } else {
      return sortOrder === 'asc'
        ? a[sortField] - b[sortField]
        : b[sortField] - a[sortField];
    }
  });

  const limitedData = sortedData.slice(0, 5);

  useEffect(() => {
    checkAuth();
    fetchAllData();

    let intervalId;
    if (refreshInterval > 0) {
      intervalId = setInterval(() => {
        fetchAllData();
      }, refreshInterval);
    }
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [refreshInterval, checkAuth, fetchAllData]);

  useEffect(() => {
    fetchCorrelationData();
  }, [fetchCorrelationData]);

  const handleLocationChange = (e) => {
    setTempLocation(e.target.value); // Update temporary location value
  };

  const applyLocationChange = () => {
    setLocation(tempLocation); // Apply the location for fetching data
  };

  return (
    <motion.div
      className={`container mt-4 ${
        theme === 'dark' ? 'bg-dark text-light' : 'bg-light text-dark'
      }`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap">
        <h2 className="mb-3">Summary of Last 24 Hours</h2>
        <Form className="d-flex align-items-center">
          <Form.Label className="me-2 mb-0">Auto Refresh:</Form.Label>
          <Form.Control
            as="select"
            value={refreshInterval}
            onChange={(e) => setRefreshInterval(Number(e.target.value))}
          >
            <option value={0}>No Auto Refresh</option>
            <option value={10000}>Every 10 seconds</option>
            <option value={60000}>Every 1 minute</option>
          </Form.Control>
        </Form>
      </div>

      {isLoadingPage ? (
        <div className="text-center my-5">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : (
        <>
          {/* Top Insights */}
          <div className="mb-4">
            <h3 className="mb-3">Top Insights</h3>
            {warnings && warnings.length > 0 ? (
              <Alert variant="danger">
                <ul className="mb-0">
                  {warnings.map((warning, index) => (
                    <li key={index}>
                      <strong>{warning.parameter.toUpperCase()} Alert:</strong> {warning.message} at{' '}
                      <span className="text-danger">{warning.location}</span>
                    </li>
                  ))}
                </ul>
              </Alert>
            ) : (
              <Alert variant="success">All parameters are within safe limits.</Alert>
            )}
            {summary && Object.keys(summary).length > 0 ? (
              <Row>
                {Object.keys(summary).map((param, index) => (
                  <Col md={4} sm={6} xs={12} key={index}>
                    <motion.div whileHover={{ scale: 1.05 }}>
                      <Card
                        className={`mb-3 shadow ${
                          theme === 'dark' ? 'bg-secondary text-white' : 'bg-light text-dark'
                        }`}
                      >
                        <Card.Body>
                          <Card.Title className="text-center">
                            {param.replace('_', ' ').toUpperCase()}
                          </Card.Title>
                          <hr />
                          <Card.Text>
                            <strong>Highest Value:</strong>{' '}
                            {summary[param].highest[0]?.value ?? 'N/A'}{' '}
                            {param === 'temperature' ? '°C' : param === 'turbidity' ? 'NTU' : ''} at{' '}
                            <span className="text-danger">
                              {summary[param].highest
                                .map((item) => item.location)
                                .join(', ')}
                            </span>
                          </Card.Text>
                          <Card.Text>
                            <strong>Lowest Value:</strong>{' '}
                            {summary[param].lowest[0]?.value ?? 'N/A'}{' '}
                            {param === 'temperature' ? '°C' : param === 'turbidity' ? 'NTU' : ''} at{' '}
                            <span className="text-danger">
                              {summary[param].lowest.map((item) => item.location).join(', ')}
                            </span>
                          </Card.Text>
                        </Card.Body>
                      </Card>
                    </motion.div>
                  </Col>
                ))}
              </Row>
            ) : (
              <Alert variant="info">No data available for the last 24 hours.</Alert>
            )}
          </div>

          {/* Correlation Graphs */}
          <div className="mb-4">
            <h3 className="mb-3">Correlation Graphs</h3>
            <Form className="mb-3 d-flex align-items-center flex-wrap">
              <Form.Label className="me-2 mb-0">Select Location:</Form.Label>
              <Form.Control
                type="text"
                value={tempLocation}
                onChange={handleLocationChange}
                className="me-3 mb-2"
                style={{ maxWidth: '200px' }}
              />
              <Button type="button" variant="primary" onClick={applyLocationChange} className="mb-2">
                Refresh
              </Button>
            </Form>
            {isLoadingCorrelation ? (
              <div className="text-center my-5">
                <Spinner animation="border" variant="primary" />
              </div>
            ) : correlationData && correlationData.temperature.length > 0 ? (
              <Row>
                <Col md={6} className="mb-4">
                  <Scatter
                    data={prepareChartData(
                      correlationData.temperature,
                      correlationData.ph_value,
                      'Temperature (°C)',
                      'pH Value'
                    )}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        x: {
                          title: {
                            display: true,
                            text: 'Temperature (°C)',
                            color: theme === 'dark' ? '#FFF' : '#000',
                          },
                          ticks: { color: theme === 'dark' ? '#FFF' : '#000' },
                        },
                        y: {
                          title: {
                            display: true,
                            text: 'pH Value',
                            color: theme === 'dark' ? '#FFF' : '#000',
                          },
                          ticks: { color: theme === 'dark' ? '#FFF' : '#000' },
                        },
                      },
                      plugins: {
                        legend: { labels: { color: theme === 'dark' ? '#FFF' : '#000' } },
                      },
                    }}
                    height={300}
                  />
                </Col>
                <Col md={6} className="mb-4">
                  <Scatter
                    data={prepareChartData(
                      correlationData.turbidity,
                      correlationData.ph_value,
                      'Turbidity (NTU)',
                      'pH Value'
                    )}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                          x: {
                            title: {
                              display: true,
                              text: 'Turbidity (NTU)',
                              color: theme === 'dark' ? '#FFF' : '#000',
                            },
                            ticks: { color: theme === 'dark' ? '#FFF' : '#000' },
                          },
                          y: {
                            title: {
                              display: true,
                              text: 'pH Value',
                              color: theme === 'dark' ? '#FFF' : '#000',
                            },
                            ticks: { color: theme === 'dark' ? '#FFF' : '#000' },
                          },
                      },
                      plugins: {
                        legend: { labels: { color: theme === 'dark' ? '#FFF' : '#000' } },
                      },
                    }}
                    height={300}
                  />
                </Col>
              </Row>
            ) : (
              <Alert variant="info">No correlation data available for the selected location.</Alert>
            )}
          </div>

          {/* Recent Data */}
          <div>
            <h3 className="mb-3">Recent Data</h3>
            {recentData && recentData.length > 0 ? (
              <>
                <Table
                  striped
                  bordered
                  hover
                  responsive
                  className={`${
                    theme === 'dark' ? 'table-dark' : 'table-light'
                  } text-center`}
                >
                  <thead>
                    <tr>
                      <th onClick={() => handleSort('location')} style={{ cursor: 'pointer' }}>
                        Location {sortField === 'location' && (sortOrder === 'asc' ? '▲' : '▼')}
                      </th>
                      <th onClick={() => handleSort('ph_value')} style={{ cursor: 'pointer' }}>
                        pH Value {sortField === 'ph_value' && (sortOrder === 'asc' ? '▲' : '▼')}
                      </th>
                      <th onClick={() => handleSort('temperature')} style={{ cursor: 'pointer' }}>
                        Temperature (°C){' '}
                        {sortField === 'temperature' && (sortOrder === 'asc' ? '▲' : '▼')}
                      </th>
                      <th onClick={() => handleSort('turbidity')} style={{ cursor: 'pointer' }}>
                        Turbidity (NTU){' '}
                        {sortField === 'turbidity' && (sortOrder === 'asc' ? '▲' : '▼')}
                      </th>
                      <th>Date</th>
                      <th>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {limitedData.map((row, index) => (
                      <tr key={index}>
                        <td>{row.location}</td>
                        <td>{parseFloat(row.ph_value).toFixed(2)}</td>
                        <td>{parseFloat(row.temperature).toFixed(2)}</td>
                        <td>{parseFloat(row.turbidity).toFixed(2)}</td>
                        <td>{moment(row.date).format('YYYY-MM-DD')}</td>
                        <td>{moment(row.time, 'HH:mm').format('hh:mm A')}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
                <div className="text-center mt-3 mb-5">
                  <Link to="/DataTable">
                    <Button variant="outline-primary">View All Data</Button>
                  </Link>
                </div>
              </>
            ) : (
              <Alert variant="info">No recent data available.</Alert>
            )}
          </div>
        </>
      )}
    </motion.div>
  );
}

export default HomePage;
