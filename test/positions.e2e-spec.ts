import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import { Position } from '../src/positions/entities/position.entity';

describe('Positions API (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    dataSource = app.get(DataSource);
  });

  afterAll(async () => {
    // Clean up test data
    if (dataSource?.isInitialized) {
      await dataSource.getRepository(Position).clear();
    }
    await app.close();
  });

  beforeEach(async () => {
    // Clear database before each test
    if (dataSource?.isInitialized) {
      await dataSource.getRepository(Position).clear();
    }
  });

  describe('POST /positions', () => {
    it('should create a root position (CEO)', async () => {
      const payload = {
        name: 'CEO',
        description: 'Chief Executive Officer',
        parentId: null,
      };

      return request(app.getHttpServer())
        .post('/positions')
        .send(payload)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.name).toBe('CEO');
          expect(res.body.parentId).toBeNull();
        });
    });

    it('should reject creating a second root position', async () => {
      // First, create the root
      await request(app.getHttpServer())
        .post('/positions')
        .send({ name: 'CEO', description: 'Root', parentId: null });

      // Try to create another root
      return request(app.getHttpServer())
        .post('/positions')
        .send({ name: 'Fake CEO', description: 'Duplicate', parentId: null })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('root position');
        });
    });
  });

  describe('GET /positions/tree', () => {
    it('should return empty array when no positions exist', async () => {
      return request(app.getHttpServer())
        .get('/positions/tree')
        .expect(200)
        .expect([]);
    });

    it('should return nested tree structure', async () => {
      // Create CEO
      const ceoRes = await request(app.getHttpServer())
        .post('/positions')
        .send({ name: 'CEO', description: 'Root', parentId: null });
      const ceoId = ceoRes.body.id;

      // Create CTO reporting to CEO
      await request(app.getHttpServer())
        .post('/positions')
        .send({ name: 'CTO', description: 'Tech lead', parentId: ceoId });

      return request(app.getHttpServer())
        .get('/positions/tree')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body[0].name).toBe('CEO');
          expect(res.body[0].children).toHaveLength(1);
          expect(res.body[0].children[0].name).toBe('CTO');
        });
    });
  });

  describe('GET /positions/:id', () => {
    it('should return position details', async () => {
      // Create a position first
      const createRes = await request(app.getHttpServer())
        .post('/positions')
        .send({ name: 'Manager', description: 'Team lead', parentId: null });
      const id = createRes.body.id;

      return request(app.getHttpServer())
        .get(`/positions/${id}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(id);
          expect(res.body.name).toBe('Manager');
        });
    });

    it('should return 404 for non-existent position', async () => {
      return request(app.getHttpServer())
        .get('/positions/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });
  });

  describe('PUT /positions/:id', () => {
    it('should update position name', async () => {
      // Create position
      const createRes = await request(app.getHttpServer())
        .post('/positions')
        .send({ name: 'Old Name', description: 'Desc', parentId: null });
      const id = createRes.body.id;

      // Update it
      return request(app.getHttpServer())
        .put(`/positions/${id}`)
        .send({ name: 'New Name' })
        .expect(200)
        .expect((res) => {
          expect(res.body.name).toBe('New Name');
          expect(res.body.description).toBe('Desc'); // Unchanged
        });
    });
  });

  describe('DELETE /positions/:id', () => {
    it('should soft-delete a position', async () => {
      // Create position
      const createRes = await request(app.getHttpServer())
        .post('/positions')
        .send({
          name: 'ToDelete',
          description: 'Will be deleted',
          parentId: null,
        });
      const id = createRes.body.id;

      // Delete it
      await request(app.getHttpServer()).delete(`/positions/${id}`).expect(204);

      // Verify it's gone from normal queries
      return request(app.getHttpServer()).get(`/positions/${id}`).expect(404);
    });

    it('should reject deleting root with children', async () => {
      // Create CEO
      const ceoRes = await request(app.getHttpServer())
        .post('/positions')
        .send({ name: 'CEO', description: 'Root', parentId: null });
      const ceoId = ceoRes.body.id;

      // Create child
      await request(app.getHttpServer())
        .post('/positions')
        .send({ name: 'CTO', description: 'Tech', parentId: ceoId });

      // Try to delete CEO
      return request(app.getHttpServer())
        .delete(`/positions/${ceoId}`)
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('children');
        });
    });
  });
});
