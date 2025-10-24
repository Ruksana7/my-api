async function loginAs(email) {
  await global.request.post('/auth/signup')
    .send({ email, password: 'secret123' })
    .set('Content-Type', 'application/json');
  const res = await global.request.post('/auth/login')
    .send({ email, password: 'secret123' })
    .set('Content-Type', 'application/json');
  return res.body.token;
}

describe('Todos', () => {
  beforeEach(async () => {
    await global.resetDb();
    token = await loginAs('owner@example.com');
  });

  test('create -> 201 and returns priority default or provided', async () => {
    const res = await global.request
      .post('/api/todos')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'A' });
    expect(res.status).toBe(201);
    expect(res.body.title).toBe('A');
    expect([1,2,3]).toContain(res.body.priority);
  });

  test('list -> returns only user-owned', async () => {
    await global.request.post('/api/todos')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'mine', priority: 1 });

    const other = await loginAs('other@example.com');
    await global.request.post('/api/todos')
      .set('Authorization', `Bearer ${other}`)
      .send({ title: 'not mine', priority: 3 });

    const res = await global.request
      .get('/api/todos?page=1&limit=10')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    const titles = res.body.items.map(x => x.title);
    expect(titles).toContain('mine');
    expect(titles).not.toContain('not mine');
  });

  test('update validation -> 400 on wrong type', async () => {
    const created = await global.request.post('/api/todos')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'B', priority: 1 });

    const res = await global.request
      .patch(`/api/todos/${created.body.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ done: 'yes' });

    expect(res.status).toBe(400);
  });

  test('patch -> 200 and updates fields', async () => {
    const created = await global.request.post('/api/todos')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'C', priority: 1 });

    const res = await global.request
      .patch(`/api/todos/${created.body.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ done: true, priority: 3 });

    expect(res.status).toBe(200);
    expect(res.body.done).toBe(true);
    expect(res.body.priority).toBe(3);
  });

  test('delete -> 200 removes item', async () => {
    const created = await global.request.post('/api/todos')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'D', priority: 2 });

    const res = await global.request
      .delete(`/api/todos/${created.body.id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);

    const list = await global.request
      .get('/api/todos?page=1&limit=10')
      .set('Authorization', `Bearer ${token}`);
    const ids = list.body.items.map(x => x.id);
    expect(ids).not.toContain(created.body.id);
  });
});
