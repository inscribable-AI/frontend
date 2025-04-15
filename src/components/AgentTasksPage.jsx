import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import useTaskManager from '../hooks/useTaskManager';
import { Button, Card, Container, Row, Col, Spinner, Alert, Modal, Form } from 'react-bootstrap';

const AgentTasksPage = () => {
  const { agentId } = useParams();
  const {
    loading,
    error,
    clearError,
    getAgentTasks,
    createAgentTask,
    updateAgentTask,
    deleteAgentTask
  } = useTaskManager();

  const [tasks, setTasks] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium',
    assignedTo: ''
  });

  // Fetch agent tasks on component mount and when agentId changes
  useEffect(() => {
    if (agentId) {
      fetchAgentTasks();
    }
  }, [agentId]);

  // Fetch agent tasks
  const fetchAgentTasks = async () => {
    try {
      const result = await getAgentTasks(agentId);
      if (result.data) {
        setTasks(result.data);
      }
    } catch (err) {
      console.error('Error fetching agent tasks:', err);
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
      title: '',
      description: '',
      dueDate: '',
      priority: 'medium',
      assignedTo: ''
    });
    setShowCreateModal(true);
  };

  // Open edit task modal
  const handleOpenEditModal = (task) => {
    setCurrentTask(task);
    setFormData({
      title: task.title || '',
      description: task.description || '',
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : '',
      priority: task.priority || 'medium',
      assignedTo: task.assignedTo || ''
    });
    setShowEditModal(true);
  };

  // Create a new agent task
  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await createAgentTask(agentId, formData);
      setShowCreateModal(false);
      fetchAgentTasks();
    } catch (err) {
      console.error('Error creating agent task:', err);
    }
  };

  // Update an existing agent task
  const handleUpdateTask = async (e) => {
    e.preventDefault();
    try {
      await updateAgentTask(agentId, currentTask.id, formData);
      setShowEditModal(false);
      fetchAgentTasks();
    } catch (err) {
      console.error('Error updating agent task:', err);
    }
  };

  // Delete an agent task
  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteAgentTask(agentId, taskId);
        fetchAgentTasks();
      } catch (err) {
        console.error('Error deleting agent task:', err);
      }
    }
  };

  // Get priority badge color
  const getPriorityBadgeColor = (priority) => {
    switch (priority) {
      case 'high': return 'danger';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'secondary';
    }
  };

  // Get agent type from ID
  const getAgentType = (id) => {
    if (!id) return 'Unknown';
    if (id.startsWith('TA_')) return 'Tool Agent';
    if (id.startsWith('SA_')) return 'Super Agent';
    return 'Agent';
  };

  return (
    <Container className="py-4">
      <h1 className="mb-4">
        {getAgentType(agentId)} Tasks
        <small className="text-muted ms-3 fs-6">{agentId}</small>
      </h1>
      
      {error && (
        <Alert variant="danger" onClose={clearError} dismissible>
          {error}
        </Alert>
      )}
      
      <div className="d-flex justify-content-between mb-4">
        <Button variant="primary" onClick={handleOpenCreateModal}>
          Create New Task
        </Button>
        <Button variant="outline-secondary" onClick={fetchAgentTasks}>
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
        <Alert variant="info">No agent tasks found.</Alert>
      ) : (
        <Row>
          {tasks.map(task => (
            <Col md={6} lg={4} className="mb-4" key={task.id}>
              <Card>
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <span>{task.title}</span>
                  <span className={`badge bg-${getPriorityBadgeColor(task.priority)}`}>
                    {task.priority}
                  </span>
                </Card.Header>
                <Card.Body>
                  <Card.Text>{task.description || 'No description'}</Card.Text>
                  {task.dueDate && (
                    <div className="mb-2">
                      <strong>Due:</strong> {new Date(task.dueDate).toLocaleDateString()}
                    </div>
                  )}
                  {task.assignedTo && (
                    <div className="mb-2">
                      <strong>Assigned to:</strong> {task.assignedTo}
                    </div>
                  )}
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
      )}
      
      {/* Create Task Modal */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Create Agent Task</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleCreateTask}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control 
                type="text" 
                name="title" 
                value={formData.title} 
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={3} 
                name="description" 
                value={formData.description} 
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Due Date</Form.Label>
              <Form.Control 
                type="date" 
                name="dueDate" 
                value={formData.dueDate} 
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Priority</Form.Label>
              <Form.Select 
                name="priority" 
                value={formData.priority} 
                onChange={handleInputChange}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </Form.Select>
            </Form.Group>
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
          <Modal.Title>Edit Agent Task</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleUpdateTask}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control 
                type="text" 
                name="title" 
                value={formData.title} 
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={3} 
                name="description" 
                value={formData.description} 
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Due Date</Form.Label>
              <Form.Control 
                type="date" 
                name="dueDate" 
                value={formData.dueDate} 
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Priority</Form.Label>
              <Form.Select 
                name="priority" 
                value={formData.priority} 
                onChange={handleInputChange}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </Form.Select>
            </Form.Group>
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

export default AgentTasksPage; 