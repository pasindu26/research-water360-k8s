import React, { useEffect, useState, useCallback, useContext } from 'react';
import {
  Row,
  Col,
  Form,
  Button,
  Table,
  Spinner,
  Alert,
  Modal,
  Pagination,
} from 'react-bootstrap';
import axios from 'axios';
import moment from 'moment';
import { ThemeContext } from '../context/ThemeContext';
import '../AdminPage.css';

function AdminPage() {
  const [allData, setAllData] = useState([]);
  const [displayedData, setDisplayedData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newRecord, setNewRecord] = useState({
    location: '',
    ph_value: '',
    temperature: '',
    turbidity: '',
  });
  const [editRecord, setEditRecord] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const BACKEND_URL = window._env_?.REACT_APP_BACKEND_URL;

  const { theme } = useContext(ThemeContext);

  const fetchAllData = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(`${BACKEND_URL}/all-data`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAllData(response.data);
    } catch (err) {
      console.error('Error fetching all data:', err);
      setError('Failed to fetch data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, [BACKEND_URL]);

  const applyFilters = useCallback(() => {
    let data = allData;
    if (filterDate) {
      const formattedDate = moment(filterDate).format('YYYY-MM-DD');
      data = data.filter((row) => row.date === formattedDate);
    }
    if (filterLocation) {
      data = data.filter((row) =>
        row.location.toLowerCase().includes(filterLocation.toLowerCase())
      );
    }
    setCurrentPage(1);
    setDisplayedData(data);
  }, [allData, filterDate, filterLocation]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  useEffect(() => {
    applyFilters();
  }, [allData, applyFilters]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        const token = localStorage.getItem('authToken');
        await axios.delete(`${BACKEND_URL}/delete-data/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSuccessMessage('Record deleted successfully!');
        fetchAllData();
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (err) {
        console.error('Error deleting record:', err);
        alert('Failed to delete the record. Please try again later.');
      }
    }
  };

  const handleCreate = async () => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('authToken');
      await axios.post(`${BACKEND_URL}/create-data`, newRecord, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShowCreateModal(false);
      setNewRecord({ location: '', ph_value: '', temperature: '', turbidity: '' });
      setSuccessMessage('Record added successfully!');
      fetchAllData();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error creating new record:', err);
      alert('Failed to create new record. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (record) => {
    setEditRecord(record);
    setShowEditModal(true);
  };

  const handleUpdate = async () => {
    if (!editRecord) return;
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('authToken');
      await axios.put(`${BACKEND_URL}/update-data/${editRecord.id}`, editRecord, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShowEditModal(false);
      setEditRecord(null);
      setSuccessMessage('Record updated successfully!');
      fetchAllData();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error updating record:', err);
      alert('Failed to update the record. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentData = displayedData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(displayedData.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const visiblePaginationItems = 5;
  const paginationStart = Math.max(currentPage - Math.floor(visiblePaginationItems / 2), 1);
  const paginationEnd = Math.min(paginationStart + visiblePaginationItems - 1, totalPages);

  const paginationItems = [];
  for (let number = paginationStart; number <= paginationEnd; number++) {
    paginationItems.push(
      <Pagination.Item
        key={number}
        active={number === currentPage}
        onClick={() => paginate(number)}
      >
        {number}
      </Pagination.Item>
    );
  }

  return (
    <div className={`${theme === 'dark' ? 'bg-dark text-light' : 'bg-light text-dark'} p-4`}>
      <h2 className="text-center mb-4">Admin Data Management</h2>
      {successMessage && (
        <Alert
          variant={theme === 'dark' ? 'dark' : 'success'}
          onClose={() => setSuccessMessage('')}
          dismissible
        >
          {successMessage}
        </Alert>
      )}
      <Row className="mb-4 align-items-end">
        <Col xs={12} md={4}>
          <Form.Group>
            <Form.Label>Filter by Date</Form.Label>
            <Form.Control
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
          </Form.Group>
        </Col>
        <Col xs={12} md={4}>
          <Form.Group>
            <Form.Label>Filter by Location</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter location"
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
            />
          </Form.Group>
        </Col>
        <Col xs={12} md={4} className="d-flex justify-content-end">
          <Button variant="primary" onClick={applyFilters} className="mr-2">
            Apply Filters
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              setFilterDate('');
              setFilterLocation('');
              setDisplayedData(allData);
              setCurrentPage(1);
            }}
          >
            Clear Filters
          </Button>
        </Col>
      </Row>

      <div className="text-right mb-3">
        <Button variant="success" onClick={() => setShowCreateModal(true)}>
          Create New Record
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center my-5">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : (
        <>
          <Table
            striped
            bordered
            hover
            responsive
            className={`${theme === 'dark' ? 'table-dark' : 'table-light'}`}
          >
            <thead>
              <tr>
                <th>Location</th>
                <th>pH Value</th>
                <th>Temperature (°C)</th>
                <th>Turbidity (NTU)</th>
                <th>Date</th>
                <th>Time</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentData.map((row) => (
                <tr key={row.id}>
                  <td>{row.location}</td>
                  <td>{parseFloat(row.ph_value).toFixed(2)}</td>
                  <td>{parseFloat(row.temperature).toFixed(2)}</td>
                  <td>{parseFloat(row.turbidity).toFixed(2)}</td>
                  <td>{moment(row.date).format('YYYY-MM-DD')}</td>
                  <td>{moment(row.time, 'HH:mm:ss').format('HH:mm:ss')}</td>
                  <td>
                    <Button
                      variant="warning"
                      size="sm"
                      onClick={() => handleEdit(row)}
                      className="mr-2"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(row.id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          {totalPages > 1 && (
            <Pagination className="justify-content-center">
              {paginationStart > 1 && (
                <Pagination.Item onClick={() => paginate(1)}>1</Pagination.Item>
              )}
              {paginationStart > 2 && <Pagination.Ellipsis />}
              {paginationItems}
              {paginationEnd < totalPages - 1 && <Pagination.Ellipsis />}
              {paginationEnd < totalPages && (
                <Pagination.Item onClick={() => paginate(totalPages)}>
                  {totalPages}
                </Pagination.Item>
              )}
            </Pagination>
          )}
        </>
      )}

      {/* Create Modal */}
      <Modal
        show={showCreateModal}
        onHide={() => setShowCreateModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Create New Record</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Location</Form.Label>
              <Form.Control
                type="text"
                value={newRecord.location}
                onChange={(e) =>
                  setNewRecord({ ...newRecord, location: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>pH Value</Form.Label>
              <Form.Control
                type="number"
                value={newRecord.ph_value}
                onChange={(e) =>
                  setNewRecord({ ...newRecord, ph_value: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Temperature (°C)</Form.Label>
              <Form.Control
                type="number"
                value={newRecord.temperature}
                onChange={(e) =>
                  setNewRecord({ ...newRecord, temperature: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Turbidity (NTU)</Form.Label>
              <Form.Control
                type="number"
                value={newRecord.turbidity}
                onChange={(e) =>
                  setNewRecord({ ...newRecord, turbidity: e.target.value })
                }
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowCreateModal(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button variant="primary" onClick={handleCreate} disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Modal */}
      <Modal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Edit Record</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editRecord && (
            <Form>
              <Form.Group>
                <Form.Label>Location</Form.Label>
                <Form.Control
                  type="text"
                  value={editRecord.location}
                  onChange={(e) =>
                    setEditRecord({ ...editRecord, location: e.target.value })
                  }
                />
              </Form.Group>
              <Form.Group>
                <Form.Label>pH Value</Form.Label>
                <Form.Control
                  type="number"
                  value={editRecord.ph_value}
                  onChange={(e) =>
                    setEditRecord({ ...editRecord, ph_value: e.target.value })
                  }
                />
              </Form.Group>
              <Form.Group>
                <Form.Label>Temperature (°C)</Form.Label>
                <Form.Control
                  type="number"
                  value={editRecord.temperature}
                  onChange={(e) =>
                    setEditRecord({ ...editRecord, temperature: e.target.value })
                  }
                />
              </Form.Group>
              <Form.Group>
                <Form.Label>Turbidity (NTU)</Form.Label>
                <Form.Control
                  type="number"
                  value={editRecord.turbidity}
                  onChange={(e) =>
                    setEditRecord({ ...editRecord, turbidity: e.target.value })
                  }
                />
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowEditModal(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button variant="primary" onClick={handleUpdate} disabled={isSubmitting}>
            {isSubmitting ? 'Updating...' : 'Update'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default AdminPage;
