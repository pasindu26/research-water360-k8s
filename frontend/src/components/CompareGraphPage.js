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
import axios from 'axios';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import { ThemeContext } from '../context/ThemeContext';

import 'react-datepicker/dist/react-datepicker.css';

// Register Chart.js components
ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Legend, Tooltip, Filler);

function CompareGraphPage() {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [locations, setLocations] = useState([]);
  const [dataType, setDataType] = useState('ph_value');
  const [chartData, setChartData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [locationInput, setLocationInput] = useState('');
  const [loading, setLoading] = useState(false);
  const BACKEND_URL = window._env_?.REACT_APP_BACKEND_URL;
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);

  const addLocation = () => {
    if (locationInput.trim() && !locations.includes(locationInput.trim())) {
      setLocations([...locations, locationInput.trim()]);
      setLocationInput('');
    }
  };

  const removeLocation = (location) => {
    setLocations(locations.filter((loc) => loc !== location));
  };

  const fetchGraphData = async () => {
    if (!startDate || !endDate || locations.length === 0) {
      setErrorMessage('Please provide start date, end date, and at least one location.');
      return;
    }

    setErrorMessage('');
    setLoading(true);

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setErrorMessage('Unauthorized access. Please log in.');
        navigate('/login');
        return;
      }

      const params = {
        startDate: moment(startDate).format('YYYY-MM-DD'),
        endDate: moment(endDate).format('YYYY-MM-DD'),
        locations: locations.join(','),
        dataType,
      };

      const response = await axios.get(`${BACKEND_URL}/compare-graph-data`, {
        params,
        headers: { Authorization: `Bearer ${token}` },
      });

      const datasets = Object.keys(response.data).map((location, index) => ({
        label: `${getDataTypeLabel(dataType)} for Location: ${location}`,
        data: response.data[location].map((entry) => entry.value),
        borderColor: getColor(index),
        backgroundColor: getColor(index, 0.2),
        tension: 0.4,
        fill: false,
        pointRadius: 3,
        pointHoverRadius: 6,
      }));

      const labels = response.data[Object.keys(response.data)[0]].map((entry) => entry.date);

      setChartData({
        labels,
        datasets,
      });
    } catch (error) {
      console.error('Error fetching graph data:', error);
      setErrorMessage('Failed to fetch graph data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const getDataTypeLabel = (type) => {
    switch (type) {
      case 'ph_value':
        return 'pH Values';
      case 'temperature':
        return 'Temperature';
      case 'turbidity':
        return 'Turbidity';
      default:
        return '';
    }
  };

  const getColor = (index, opacity = 1) => {
    const colors = [
      `rgba(75, 192, 192, ${opacity})`,
      `rgba(255, 99, 132, ${opacity})`,
      `rgba(54, 162, 235, ${opacity})`,
      `rgba(255, 206, 86, ${opacity})`,
      `rgba(153, 102, 255, ${opacity})`,
      `rgba(255, 159, 64, ${opacity})`,
    ];
    return colors[index % colors.length];
  };

  return (
    <Container fluid className={`py-4 ${theme === 'dark' ? 'bg-dark text-light' : 'bg-light text-dark'}`}>
      <h2 className="text-center mb-4">Compare Values Across Locations</h2>
      {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}

      <Form>
        {/* Start Date, End Date, Location Input, and Data Type - Same Level */}
        <Row className="mb-3">
          <Col md={3}>
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
          <Col md={3}>
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
          <Col md={3}>
            <Form.Group>
              <Form.Label>Location</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter location"
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group>
              <Form.Label>Data Type</Form.Label>
              <Form.Control as="select" value={dataType} onChange={(e) => setDataType(e.target.value)}>
                <option value="ph_value">pH Value</option>
                <option value="temperature">Temperature</option>
                <option value="turbidity">Turbidity</option>
              </Form.Control>
            </Form.Group>
          </Col>
        </Row>

        {/* Add Location Button */}
        <Row className="mb-3">
          <Col md={3}>
            <Button variant="secondary" onClick={addLocation} className="w-100 mt-2">
              Add Location
            </Button>
          </Col>
        </Row>

        {/* List of Locations */}
        {locations.length > 0 && (
          <div className="mb-3">
            <h5>Locations:</h5>
            <ul className="list-inline">
              {locations.map((loc, index) => (
                <li key={index} className="list-inline-item mb-2">
                  <span className="me-2">{loc}</span>
                  <Button variant="danger" size="sm" onClick={() => removeLocation(loc)}>
                    Remove
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <Button variant="primary" onClick={fetchGraphData} disabled={loading}>
          {loading ? (
            <>
              <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> Loading...
            </>
          ) : (
            'Generate Comparison Graph'
          )}
        </Button>
      </Form>

      {/* Graph Section */}
      {chartData && (
        <div className="mt-4" style={{ height: '70vh', width: '100%', margin: '0 auto' }}>
          <Line
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
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
                  title: { display: true, text: 'Date', color: theme === 'dark' ? '#FFF' : '#000' },
                  ticks: { color: theme === 'dark' ? '#FFF' : '#000' },
                },
                y: {
                  title: {
                    display: true,
                    text: getYAxisLabel(dataType),
                    color: theme === 'dark' ? '#FFF' : '#000',
                  },
                  ticks: { color: theme === 'dark' ? '#FFF' : '#000' },
                },
              },
            }}
          />
        </div>
      )}
    </Container>
  );
}

const getYAxisLabel = (dataType) => {
  switch (dataType) {
    case 'ph_value':
      return 'pH Value';
    case 'temperature':
      return 'Temperature (°C)';
    case 'turbidity':
      return 'Turbidity (NTU)';
    default:
      return '';
  }
};

export default CompareGraphPage;
