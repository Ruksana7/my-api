describe('Auth', () => {
  beforeEach(async () => { await global.resetDb(); });

  test('signup -> returns token', async () => {
    const res = await global.request
      .post('/auth/signup')
      .send({ email: 't1@example.com', password: 'secret123' })
      .set('Content-Type', 'application/json');
    expect(res.status).toBe(201);
    expect(res.body.token).toBeTruthy();
    expect(res.body.user.email).toBe('t1@example.com');
  });

  test('login -> returns token', async () => {
    await global.request.post('/auth/signup')
      .send({ email: 't2@example.com', password: 'secret123' })
      .set('Content-Type', 'application/json');

    const res = await global.request
      .post('/auth/login')
      .send({ email: 't2@example.com', password: 'secret123' })
      .set('Content-Type', 'application/json');

    expect(res.status).toBe(200);
    expect(res.body.token).toBeTruthy();
  });

  test('login invalid email format -> 400', async () => {
    const res = await global.request
      .post('/auth/login')
      .send({ email: 'bad', password: '' })
      .set('Content-Type', 'application/json');
    expect(res.status).toBe(400);
  });
});
