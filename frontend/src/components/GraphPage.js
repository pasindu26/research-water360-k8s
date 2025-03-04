import React, { useState, useContext } from 'react';
import { Form, Button, Spinner, Row, Col, Container } from 'react-bootstrap';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Legend,
  Tooltip,
  Filler,
} from 'chart.js';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import 'react-datepicker/dist/react-datepicker.css';
import { ThemeContext } from '../context/ThemeContext';
import apiService from '../utils/api';

// Register Chart.js components
ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Legend, Tooltip, Filler);

function GraphPage() {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [location, setLocation] = useState('');
  const [dataType, setDataType] = useState('ph_value');
  const [chartData, setChartData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const { theme } = useContext(ThemeContext);

  const fetchGraphData = async () => {
    if (!startDate || !endDate || !location) {
      setErrorMessage('Please provide start date, end date, and location.');
      return;
    }

    setErrorMessage('');
    setLoading(true);

    try {
      const params = {
        startDate: moment(startDate).format('YYYY-MM-DD'),
        endDate: moment(endDate).format('YYYY-MM-DD'),
        location,
        dataType,
      };

      const response = await apiService.graphs.getGraphData(params);

      const labels = response.data.map((entry) => entry.date);
      const data = response.data.map((entry) => entry.value);

      setChartData({
        labels,
        datasets: [
          {
            label: `${
              dataType === 'ph_value'
                ? 'pH Values'
                : dataType === 'temperature'
                ? 'Temperature'
                : 'Turbidity'
            } for Location: ${location}`,
            data,
            borderColor: theme === 'dark' ? 'rgba(144, 202, 249, 1)' : 'rgba(75, 192, 192, 1)',
            backgroundColor: theme === 'dark' ? 'rgba(144, 202, 249, 0.2)' : 'rgba(75, 192, 192, 0.2)',
            tension: 0.3,
            fill: true,
          },
        ],
      });
    } catch (error) {
      console.error('Error fetching graph data:', error);
      setErrorMessage('Failed to fetch graph data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid className={`py-4 ${theme === 'dark' ? 'bg-dark text-light' : 'bg-light text-dark'}`}>
      <h2 className="text-center mb-4">Graph Viewer</h2>
      {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
      <Form>
        <Row className="align-items-end mb-3">
          <Col md={3} sm={6} xs={12}>
            <Form.Group>
              <Form.Label>Start Date</Form.Label>
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                dateFormat="yyyy-MM-dd"
                className="form-control"
                placeholderText="Select start date"
              />
            </Form.Group>
          </Col>
          <Col md={3} sm={6} xs={12}>
            <Form.Group>
              <Form.Label>End Date</Form.Label>
              <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                dateFormat="yyyy-MM-dd"
                className="form-control"
                placeholderText="Select end date"
              />
            </Form.Group>
          </Col>
          <Col md={3} sm={6} xs={12}>
            <Form.Group>
              <Form.Label>Location</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={3} sm={6} xs={12}>
            <Form.Group>
              <Form.Label>Data Type</Form.Label>
              <Form.Control
                as="select"
                value={dataType}
                onChange={(e) => setDataType(e.target.value)}
              >
                <option value="ph_value">pH Value</option>
                <option value="temperature">Temperature</option>
                <option value="turbidity">Turbidity</option>
              </Form.Control>
            </Form.Group>
          </Col>
        </Row>
        <Row>
          <Col className="text-center">
            <Button variant="primary" onClick={fetchGraphData} disabled={loading}>
              {loading ? (
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
              ) : (
                'Generate Graph'
              )}
            </Button>
          </Col>
        </Row>
      </Form>
      {chartData && (
        <div
          className="d-flex justify-content-center align-items-center"
          style={{
            height: '70vh', // Full height for better visibility
            marginTop: '50px', // Separation from inputs
          }}
        >
          <div style={{ width: '90%', height: '100%' }}>
            <Line
              data={chartData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    display: true,
                    position: 'top',
                    labels: { color: theme === 'dark' ? '#FFF' : '#000' },
                  },
                  tooltip: { mode: 'index', intersect: false },
                },
                scales: {
                  x: {
                    title: {
                      display: true,
                      text: 'Date',
                      color: theme === 'dark' ? '#FFF' : '#000',
                    },
                    ticks: { color: theme === 'dark' ? '#FFF' : '#000' },
                  },
                  y: {
                    title: {
                      display: true,
                      text:
                        dataType === 'ph_value'
                          ? 'pH Value'
                          : dataType === 'temperature'
                          ? 'Temperature (°C)'
                          : 'Turbidity (NTU)',
                      color: theme === 'dark' ? '#FFF' : '#000',
                    },
                    ticks: { color: theme === 'dark' ? '#FFF' : '#000' },
                  },
                },
              }}
            />
          </div>
        </div>
      )}
    </Container>
  );
}

export default GraphPage;
