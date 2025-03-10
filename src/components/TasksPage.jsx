import React, { useState, useEffect } from 'react';
import useTaskManager from '../hooks/useTaskManager';
import { Button, Card, Container, Row, Col, Spinner, Alert, Modal, Form } from 'react-bootstrap';
import { format } from 'date-fns';

const TasksPage = () => {
  const {
    loading,
    error,
    clearError,
    getUserTasks,
    getUserScheduledTasks,
    createScheduledTask,
    updateScheduledTask,
    deleteScheduledTask
  } = useTaskManager();

  const [tasks, setTasks] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [formData, setFormData] = useState({
    agentId: '',
    taskMessage: '',
    description: '',
    scheduledTime: '',
    recurrenceInterval: '',
    recurrenceEndTime: ''
  });
  const [lastTaskId, setLastTaskId] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  // Fetch tasks on component mount
  useEffect(() => {
    fetchTasks();
  }, []);

  // Fetch tasks with pagination
  const fetchTasks = async (reset = false) => {
    try {
      if (reset) {
        setLastTaskId(null);
      }
      
      // Don't fetch if already loading
      if (loading) return;
      
      // Get current user ID from your auth context
      const userId = "current-user-id"; // Replace with actual user ID
      const taskId = reset ? null : lastTaskId;
      
      // Pass explicit page size that matches your UI (not the default 10)
      const pageSize = 5; // Or whatever size you want to display
      const result = await getUserScheduledTasks(userId, pageSize, taskId);
      
      if (result && result.length > 0) {
        if (reset) {
          setTasks(result);
        } else {
          setTasks(prev => [...prev, ...result]);
        }
        
        setLastTaskId(result[result.length - 1].id);
        setHasMore(result.length === pageSize);
      } else {
        setHasMore(false);
        if (reset) {
          setTasks([]);
        }
      }
    } catch (err) {
      console.error('Error fetching tasks:', err);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Open create task modal
  const handleOpenCreateModal = () => {
    setFormData({
      agentId: '',
      taskMessage: '',
      description: '',
      scheduledTime: '',
      recurrenceInterval: '',
      recurrenceEndTime: ''
    });
    setShowCreateModal(true);
  };

  // Open edit task modal
  const handleOpenEditModal = (task) => {
    setCurrentTask(task);
    setFormData({
      agentId: task.agentId,
      taskMessage: task.taskMessage || '',
      description: task.taskDescription || '',
      scheduledTime: task.scheduledTime ? new Date(task.scheduledTime).toISOString().slice(0, 16) : '',
      recurrenceInterval: task.recurrenceInterval || '',
      recurrenceEndTime: task.recurrenceEndTime ? new Date(task.recurrenceEndTime).toISOString().slice(0, 16) : ''
    });
    setShowEditModal(true);
  };

  // Create a new task
  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await createScheduledTask(formData);
      setShowCreateModal(false);
      fetchTasks(true);
    } catch (err) {
      console.error('Error creating task:', err);
    }
  };

  // Update an existing task
  const handleUpdateTask = async (e) => {
    e.preventDefault();
    try {
      await updateScheduledTask(currentTask.id, formData);
      setShowEditModal(false);
      fetchTasks(true);
    } catch (err) {
      console.error('Error updating task:', err);
    }
  };

  // Delete a task
  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteScheduledTask(taskId);
        fetchTasks(true);
      } catch (err) {
        console.error('Error deleting task:', err);
      }
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'PPpp');
    } catch (err) {
      return 'Invalid date';
    }
  };

  return (
    <Container className="py-4">
      <h1 className="mb-4">Scheduled Tasks</h1>
      
      {error && (
        <Alert variant="danger" onClose={clearError} dismissible>
          {error}
        </Alert>
      )}
      
      <div className="d-flex justify-content-between mb-4">
        <Button variant="primary" onClick={handleOpenCreateModal}>
          Create New Task
        </Button>
        <Button variant="outline-secondary" onClick={() => fetchTasks(true)}>
          Refresh
        </Button>
      </div>
      
      {loading && tasks.length === 0 ? (
        <div className="text-center py-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      ) : tasks.length === 0 ? (
        <Alert variant="info">No scheduled tasks found.</Alert>
      ) : (
        <>
          <Row>
            {tasks.map(task => (
              <Col md={6} lg={4} className="mb-4" key={task.id}>
                <Card>
                  <Card.Header className="d-flex justify-content-between align-items-center">
                    <span>Task #{task.id.substring(0, 8)}</span>
                    <span className={`badge bg-${task.status === 'completed' ? 'success' : task.status === 'failed' ? 'danger' : 'warning'}`}>
                      {task.status}
                    </span>
                  </Card.Header>
                  <Card.Body>
                    <Card.Title>{task.taskDescription || 'No description'}</Card.Title>
                    <Card.Text>
                      <strong>Agent:</strong> {task.agentId}<br />
                      <strong>Scheduled:</strong> {formatDate(task.scheduledTime)}<br />
                      {task.recurrenceInterval && (
                        <>
                          <strong>Recurrence:</strong> {task.recurrenceInterval}<br />
                          {task.recurrenceEndTime && (
                            <><strong>Until:</strong> {formatDate(task.recurrenceEndTime)}<br /></>
                          )}
                        </>
                      )}
                    </Card.Text>
                    <div className="d-flex justify-content-end">
                      <Button 
                        variant="outline-primary" 
                        size="sm" 
                        className="me-2"
                        onClick={() => handleOpenEditModal(task)}
                      >
                        Edit
                      </Button>
                      <Button 
                        variant="outline-danger" 
                        size="sm"
                        onClick={() => handleDeleteTask(task.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
          
          {hasMore && (
            <div className="text-center mt-3 mb-5">
              <Button 
                variant="outline-primary" 
                onClick={() => fetchTasks(false)}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                    <span className="ms-2">Loading...</span>
                  </>
                ) : (
                  'Load More'
                )}
              </Button>
            </div>
          )}
        </>
      )}
      
      {/* Create Task Modal */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Create New Task</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleCreateTask}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Agent ID</Form.Label>
              <Form.Control 
                type="text" 
                name="agentId" 
                value={formData.agentId} 
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Task Message</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={3} 
                name="taskMessage" 
                value={formData.taskMessage} 
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control 
                type="text" 
                name="description" 
                value={formData.description} 
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Scheduled Time</Form.Label>
              <Form.Control 
                type="datetime-local" 
                name="scheduledTime" 
                value={formData.scheduledTime} 
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Recurrence Interval (optional)</Form.Label>
              <Form.Select 
                name="recurrenceInterval" 
                value={formData.recurrenceInterval} 
                onChange={handleInputChange}
              >
                <option value="">None</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </Form.Select>
            </Form.Group>
            {formData.recurrenceInterval && (
              <Form.Group className="mb-3">
                <Form.Label>Recurrence End Time (optional)</Form.Label>
                <Form.Control 
                  type="datetime-local" 
                  name="recurrenceEndTime" 
                  value={formData.recurrenceEndTime} 
                  onChange={handleInputChange}
                />
              </Form.Group>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Task'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
      
      {/* Edit Task Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Task</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleUpdateTask}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Agent ID</Form.Label>
              <Form.Control 
                type="text" 
                name="agentId" 
                value={formData.agentId} 
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Task Message</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={3} 
                name="taskMessage" 
                value={formData.taskMessage} 
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control 
                type="text" 
                name="description" 
                value={formData.description} 
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Scheduled Time</Form.Label>
              <Form.Control 
                type="datetime-local" 
                name="scheduledTime" 
                value={formData.scheduledTime} 
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Recurrence Interval (optional)</Form.Label>
              <Form.Select 
                name="recurrenceInterval" 
                value={formData.recurrenceInterval} 
                onChange={handleInputChange}
              >
                <option value="">None</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </Form.Select>
            </Form.Group>
            {formData.recurrenceInterval && (
              <Form.Group className="mb-3">
                <Form.Label>Recurrence End Time (optional)</Form.Label>
                <Form.Control 
                  type="datetime-local" 
                  name="recurrenceEndTime" 
                  value={formData.recurrenceEndTime} 
                  onChange={handleInputChange}
                />
              </Form.Group>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update Task'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default TasksPage; 