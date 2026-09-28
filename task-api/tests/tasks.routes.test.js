const request = require('supertest');
const app = require('../src/app');
const taskService = require('../src/services/taskService');

describe('Task API Integration Tests', () => {
  // Clear the in-memory array before every single test so they don't interfere with each other
  beforeEach(() => {
    taskService._reset();
  });

  describe('POST /tasks', () => {
    it('should create a valid task', async () => {
      const res = await request(app)
        .post('/tasks')
        .send({ title: 'Build React UI', priority: 'high' });
      
      expect(res.status).toBe(201);
      expect(res.body.title).toBe('Build React UI');
      expect(res.body.priority).toBe('high');
      expect(res.body.status).toBe('todo');
    });

    it('should fail if title is missing', async () => {
      const res = await request(app).post('/tasks').send({ priority: 'low' });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/title is required/);
    });

    it('should fail if priority is invalid', async () => {
      const res = await request(app)
        .post('/tasks')
        .send({ title: 'Test', priority: 'super-urgent' });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/priority must be one of/);
    });
  });

  describe('GET /tasks', () => {
    it('should return all tasks', async () => {
      taskService.create({ title: 'Task 1' });
      taskService.create({ title: 'Task 2' });

      const res = await request(app).get('/tasks');
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
    });

    it('should filter by status', async () => {
      taskService.create({ title: 'Task 1', status: 'done' });
      taskService.create({ title: 'Task 2', status: 'todo' });

      const res = await request(app).get('/tasks?status=done');
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].title).toBe('Task 1');
    });

    it('should handle pagination queries correctly', async () => {
      taskService.create({ title: 'Task A' });
      taskService.create({ title: 'Task B' });

      const res = await request(app).get('/tasks?page=1&limit=1');
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
    });
  });

  describe('PUT /tasks/:id', () => {
    it('should update an existing task successfully', async () => {
      const task = taskService.create({ title: 'Old Title' });
      
      const res = await request(app)
        .put(`/tasks/${task.id}`)
        .send({ title: 'New Title', status: 'in_progress' });
      
      expect(res.status).toBe(200);
      expect(res.body.title).toBe('New Title');
      expect(res.body.status).toBe('in_progress');
    });

    it('should return 404 for a non-existent task', async () => {
      const res = await request(app).put('/tasks/fake-id-123').send({ title: 'Valid' });
      expect(res.status).toBe(404);
    });
  });

  describe('PATCH /tasks/:id/complete', () => {
    it('should mark a task as done without changing priority', async () => {
      const task = taskService.create({ title: 'Important', priority: 'high' });
      
      const res = await request(app).patch(`/tasks/${task.id}/complete`);
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('done');
      expect(res.body.priority).toBe('high'); // Proves our bug fix worked
      expect(res.body.completedAt).not.toBeNull();
    });
  });

  describe('PATCH /tasks/:id/assign', () => {
    it('should assign a task to a user', async () => {
      const task = taskService.create({ title: 'Needs Owner' });
      
      const res = await request(app)
        .patch(`/tasks/${task.id}/assign`)
        .send({ assignee: 'Jane Doe' });
      
      expect(res.status).toBe(200);
      expect(res.body.assignee).toBe('Jane Doe');
    });

    it('should fail if assignee is invalid', async () => {
      const task = taskService.create({ title: 'Needs Owner' });
      
      const res = await request(app)
        .patch(`/tasks/${task.id}/assign`)
        .send({ assignee: '   ' }); // Empty spaces
      
      expect(res.status).toBe(400);
    });
  });

  describe('DELETE /tasks/:id', () => {
    it('should delete a task', async () => {
      const task = taskService.create({ title: 'Delete me' });
      
      const res = await request(app).delete(`/tasks/${task.id}`);
      expect(res.status).toBe(204);
      
      const check = taskService.findById(task.id);
      expect(check).toBeUndefined();
    });
  });

  describe('GET /tasks/stats', () => {
    it('should return correct task statistics including overdue', async () => {
      // Create a task that was due in the past
      taskService.create({ 
        title: 'Overdue Task', 
        status: 'todo',
        dueDate: '2020-01-01T00:00:00.000Z' 
      });
      taskService.create({ title: 'Done Task', status: 'done' });

      const res = await request(app).get('/tasks/stats');
      
      expect(res.status).toBe(200);
      expect(res.body.todo).toBe(1);
      expect(res.body.done).toBe(1);
      expect(res.body.overdue).toBe(1);
    });
  });
});