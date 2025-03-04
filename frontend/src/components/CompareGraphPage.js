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
import { useNavigate } from 'react-router-dom';
import { ThemeContext } from '../context/ThemeContext';
import apiService from '../utils/api';

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

  // Add data processing functions
  const processGraphData = (responseData) => {
    if (!responseData) {
      throw new Error('No data received from server');
    }

    // Handle different response formats
    if (Array.isArray(responseData)) {
      return responseData;
    }
    
    if (responseData.data && Array.isArray(responseData.data)) {
      return responseData.data;
    }
    
    if (typeof responseData === "object") {
      return Object.entries(responseData).map(([location, data]) => ({
        location,
        data: Array.isArray(data) ? data : 
              Array.isArray(data.data) ? data.data :
              Object.entries(data).map(([date, value]) => ({
                date,
                value: parseFloat(value)
              }))
      }));
    }
    
    throw new Error('Unsupported data format received from server');
  };

  const createDatasets = (graphData, sortedDates) => {
    return graphData.map((locationData, index) => {
      if (!Array.isArray(locationData.data)) {
        console.warn(`Invalid data format for location ${locationData.location}`);
        return null;
      }

      // Create a map of date to value for easy lookup
      const dateValueMap = locationData.data.reduce((acc, entry) => {
        if (entry?.date && entry?.value !== undefined) {
          acc[entry.date] = parseFloat(entry.value);
        }
        return acc;
      }, {});

      return {
        label: locationData.location,
        data: sortedDates.map(date => dateValueMap[date] ?? null),
        borderColor: getColor(index),
        backgroundColor: getColor(index, 0.2),
        tension: 0.3,
        fill: false,
        pointRadius: 4,
      };
    }).filter(Boolean); // Remove null datasets
  };

  const fetchGraphData = async () => {
    if (!startDate || !endDate || locations.length === 0) {
      setErrorMessage('Please provide start date, end date, and at least one location.');
      return;
    }

    setErrorMessage('');
    setLoading(true);

    try {
      const params = {
        startDate: moment(startDate).format('YYYY-MM-DD'),
        endDate: moment(endDate).format('YYYY-MM-DD'),
        locations: locations.join(','),
        dataType,
      };

      console.log('Fetching data with params:', params);
      const response = await apiService.graphs.getCompareGraphData(params);
      console.log('Raw response:', response);

      const graphData = processGraphData(response.data);

      // Extract all unique dates
      const allDates = new Set();
      graphData.forEach(locationData => {
        if (Array.isArray(locationData.data)) {
          locationData.data.forEach(entry => {
            if (entry?.date) allDates.add(entry.date);
          });
        }
      });

      if (allDates.size === 0) {
        throw new Error('No valid dates found in the data');
      }

      // Sort dates chronologically
      const sortedDates = Array.from(allDates).sort();

      // Create datasets for each location
      const datasets = createDatasets(graphData, sortedDates);

      if (datasets.length === 0) {
        throw new Error('No valid data available for the selected parameters');
      }

      setChartData({
        labels: sortedDates,
        datasets,
      });
    } catch (error) {
      console.error('Error in fetchGraphData:', error);
      setErrorMessage(error.message || 'Failed to fetch comparison data. Please try again later.');
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

  // Memoize chart options
  const chartOptions = React.useMemo(() => ({
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
  }), [theme, dataType]);

  return (
    <Container fluid className={`py-4 ${theme === 'dark' ? 'bg-dark text-light' : 'bg-light text-dark'}`}>
      <h2 className="text-center mb-4">Compare Values Across Locations</h2>
      {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}

      <Form>
        {/* Start Date, End Date, Location Input, and Data Type */}
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
            options={chartOptions}
          />
        </div>
      )}
    </Container>
  );
}

// Move helper functions outside component
const getYAxisLabel = (dataType) => {
  const labels = {
    ph_value: 'pH Value',
    temperature: 'Temperature (°C)',
    turbidity: 'Turbidity (NTU)',
  };
  return labels[dataType] || '';
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

export default CompareGraphPage;