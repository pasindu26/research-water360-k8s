// src/components/DataTable.js
import React, { useState, useEffect, useContext } from 'react';
import { Table, Form, Button, Row, Col, InputGroup, Alert } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import 'react-datepicker/dist/react-datepicker.css';
import { ThemeContext } from '../context/ThemeContext';
import apiService from '../utils/api';

function DataTable() {
  const [data, setData] = useState([]);
  const [date, setDate] = useState(null);
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isPolling, setIsPolling] = useState(false);

  const { theme } = useContext(ThemeContext);

  // Fetch data from the backend
  const fetchData = async (params = {}) => {
    setLoading(true);
    setError('');
    try {
      const response = await apiService.data.getData(params);
      setData(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to fetch data');
      setData([]); // Clear data on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isPolling) {
      const interval = setInterval(() => {
        const params = {};
        if (date) {
          params.date = moment(date).format('YYYY-MM-DD'); // Format date properly
        }
        if (location) {
          params.location = location;
        }
        fetchData(params);
      }, 5000); // Fetch data every 5 seconds

      return () => clearInterval(interval); // Cleanup interval on unmount or when polling stops
    }
  }, [isPolling, date, location]);

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!date || !location) {
      setError('Please select both date and location');
      setData([]); // Clear data
      return;
    }
    setError(''); // Clear any previous error
    const params = {
      date: moment(date).format('YYYY-MM-DD'), // Send date in proper format
      location: location,
    };
    fetchData(params);
  };

  const handleReset = () => {
    setDate(null);
    setLocation('');
    setError(''); // Clear error
    fetchData();
  };

  const togglePolling = () => {
    setIsPolling((prev) => !prev); // Toggle polling state
  };

  return (
    <div className={`${theme === 'dark' ? 'bg-dark text-light' : 'bg-light text-dark'} p-3`}>
      <Form onSubmit={handleSearch} className="mb-4">
        <Row>
          <Col xs={12} md={4}>
            <Form.Group controlId="formDate">
              <Form.Label>Date</Form.Label>
              <InputGroup>
                <DatePicker
                  selected={date}
                  onChange={(date) => setDate(date)}
                  dateFormat="yyyy-MM-dd"
                  className="form-control"
                  placeholderText="Select date"
                />
                <Button variant="outline-secondary" onClick={() => setDate(null)}>
                  Clear
                </Button>
              </InputGroup>
            </Form.Group>
          </Col>
          <Col xs={12} md={4}>
            <Form.Group controlId="formLocation">
              <Form.Label>Location</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col xs={12} md={4} className="d-flex align-items-end">
            <div className="w-100">
              <Button variant="primary" type="submit" className="mr-2 mb-2 w-100">
                Search
              </Button>
              <Button variant="secondary" onClick={handleReset} className="w-100">
                Reset
              </Button>
            </div>
          </Col>
        </Row>
      </Form>

      <div className="mb-3">
        <Button
          variant={isPolling ? 'danger' : 'success'}
          onClick={togglePolling}
        >
          {isPolling ? 'Stop Refreshing Data' : 'Start Refreshing Data'}
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {loading ? (
        <div className="text-center">Loading...</div>
      ) : (
        <>
          {data.length > 0 ? (
            <div className="table-responsive">
              <Table
                striped
                bordered
                hover
                className={`${theme === 'dark' ? 'table-dark' : 'table-light'}`}
              >
                <thead className={theme === 'dark' ? 'thead-light' : 'thead-dark'}>
                  <tr>
                    <th>ID</th>
                    <th>pH Value</th>
                    <th>Temperature [°C]</th>
                    <th>Turbidity [NTU]</th>
                    <th>Location</th>
                    <th>Time</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item) => (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <td>{parseFloat(item.ph_value).toFixed(2)}</td>
                      <td>{parseFloat(item.temperature).toFixed(2)}</td>
                      <td>{parseFloat(item.turbidity).toFixed(2)}</td>
                      <td>{item.location}</td>
                      <td>{moment(item.time, 'HH:mm:ss').format('HH:mm:ss')}</td>
                      <td>{moment(item.date, 'YYYY-MM-DD').format('MMM Do, YYYY')}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          ) : (
            <div className="text-center">
              <p>No data available</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default DataTable;
