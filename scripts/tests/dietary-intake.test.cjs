const assert = require('node:assert/strict');
const { readFile } = require('node:fs/promises');
const path = require('node:path');
const { test } = require('node:test');
const vm = require('node:vm');

const sourceRoot = path.resolve(__dirname, '../../src');

async function createFixture({
  tickets,
  identityStatus = 200,
  identityError = '',
  shouldFailUpdate = false,
  shouldFailLookup = false,
  shouldFailIdentity = false,
} = {}) {
  const ticket = {
    id: 'recOwnedTicket',
    fields: {
      Name: 'Test Guest',
      Status: 'Ticket Purchased',
      'Email Address': 'guest@example.invalid',
      'Firebase UID': 'verified-uid',
      Notes: 'Unrelated ticket note',
      Cabin: ['recCabin'],
    },
  };
  const updates = [];
  const lookups = [];
  const identityRequests = [];
  const reports = [];
  const table = {
    select(options) {
      lookups.push(options);
      return {
        async all() {
          if (shouldFailLookup) throw new Error('Airtable lookup failed');
          return tickets || [ticket];
        },
      };
    },
    async update(changes) {
      updates.push(changes);
      if (shouldFailUpdate) throw new Error('Airtable update failed');
      return changes.map(change => ({
        id: change.id,
        fields: { ...ticket.fields, ...change.fields },
      }));
    },
  };
  class Airtable {
    base(baseId) {
      assert.equal(baseId, 'isolated-test-base');
      return tableName => {
        assert.equal(tableName, 'Ticket Purchases');
        return table;
      };
    }
  }
  const context = vm.createContext({
    process: {
      env: {
        AIRTABLE_BASE: 'isolated-test-base',
        AIRTABLE_PERSONAL_ACCESS_TOKEN: 'mock-token',
        NEXT_PUBLIC_FIREBASE_API_KEY: 'mock-key',
      },
    },
    AbortSignal,
    async fetch(url, options) {
      assert.ok(url.startsWith('https://identitytoolkit.googleapis.com/'));
      identityRequests.push(JSON.parse(options.body));
      if (shouldFailIdentity) throw new Error('Firebase unavailable');
      return {
        ok: identityStatus === 200,
        status: identityStatus,
        async json() {
          return identityStatus === 200
            ? {
                users: [
                  { localId: 'verified-uid', email: 'guest@example.invalid' },
                ],
              }
            : { error: { message: identityError } };
        },
      };
    },
  });
  const modules = new Map();
  async function loadModule(identifier) {
    if (modules.has(identifier)) return modules.get(identifier);
    let module;
    if (identifier === 'airtable') {
      module = new vm.SyntheticModule(
        ['default'],
        function () {
          this.setExport('default', Airtable);
        },
        { context },
      );
    } else if (identifier === '@/utils/sentry-utils') {
      module = new vm.SyntheticModule(
        ['logSentryError'],
        function () {
          this.setExport('logSentryError', (error, extra) =>
            reports.push({ error, extra }),
          );
        },
        { context },
      );
    } else {
      const filename = path.join(sourceRoot, `${identifier.slice(2)}.js`);
      module = new vm.SourceTextModule(await readFile(filename, 'utf8'), {
        context,
        identifier,
      });
    }
    modules.set(identifier, module);
    await module.link(loadModule);
    return module;
  }
  const route = await loadModule('@/pages/api/platform/dietary-intake');
  await route.evaluate();

  async function request(method = 'PATCH', body = {}) {
    const response = {
      headers: {},
      setHeader(name, value) {
        this.headers[name] = value;
      },
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(value) {
        this.body = JSON.parse(JSON.stringify(value));
        return this;
      },
      end(value) {
        this.body = value;
        return this;
      },
    };
    await route.namespace.default(
      {
        method,
        body: {
          idToken: 'verified-token',
          dietaryRequirements: ['Vegan'],
          dietaryNotes: '',
          ...body,
        },
      },
      response,
    );
    return response;
  }
  return { request, updates, lookups, reports, identityRequests };
}

test('saves multiple selections and trimmed notes in one owned-ticket update', async () => {
  const fixture = await createFixture();
  const response = await fixture.request('PATCH', {
    dietaryRequirements: ['Vegan', 'Peanut Allergy', 'Vegan'],
    dietaryNotes: '  Separate utensils please.  ',
    recordId: 'recSomeoneElse',
  });
  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.body, {
    dietaryRequirements: ['Vegan', 'Peanut Allergy'],
    dietaryNotes: 'Separate utensils please.',
  });
  assert.equal(fixture.updates.length, 1);
  assert.deepEqual(JSON.parse(JSON.stringify(fixture.updates[0])), [
    {
      id: 'recOwnedTicket',
      fields: {
        'Dietary Requirements': ['Vegan', 'Peanut Allergy'],
        'Dietary Notes': 'Separate utensils please.',
        'Dietary Restrictions': true,
      },
    },
  ]);
  assert.equal(
    fixture.lookups[0].filterByFormula,
    '{Firebase UID} = "verified-uid"',
  );
  assert.deepEqual(fixture.identityRequests, [{ idToken: 'verified-token' }]);
  assert.equal(response.headers['Cache-Control'], 'no-store');
  assert.equal(fixture.reports.length, 0);
});

for (const [label, requirements, notes, expectedCheckbox] of [
  ['explicit no restrictions', [], 'None', true],
  ['notes only', [], 'Other dietary need', true],
  ['selections only', ['Vegetarian'], '', true],
  ['clearing a response', [], '   ', false],
]) {
  test(`handles ${label}`, async () => {
    const fixture = await createFixture();
    const response = await fixture.request('PATCH', {
      dietaryRequirements: requirements,
      dietaryNotes: notes,
    });
    assert.equal(response.statusCode, 200);
    assert.equal(
      fixture.updates[0][0].fields['Dietary Restrictions'],
      expectedCheckbox,
    );
    assert.equal(response.body.dietaryNotes, notes.trim());
    assert.deepEqual(response.body.dietaryRequirements, requirements);
  });
}

test('POST reads saved dietary data without writing', async () => {
  const fixture = await createFixture({
    tickets: [
      {
        id: 'recOwnedTicket',
        fields: {
          Status: 'Ticket Purchased',
          'Email Address': ' GUEST@EXAMPLE.INVALID ',
          'Dietary Requirements': ['Halal'],
          'Dietary Notes': 'No pork',
        },
      },
    ],
  });
  const response = await fixture.request('POST');
  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.body, {
    dietaryRequirements: ['Halal'],
    dietaryNotes: 'No pork',
  });
  assert.equal(fixture.updates.length, 0);
});

test('POST returns empty fields for an unanswered ticket', async () => {
  const fixture = await createFixture();
  const response = await fixture.request('POST');
  assert.deepEqual(response.body, {
    dietaryRequirements: [],
    dietaryNotes: '',
  });
  assert.equal(fixture.updates.length, 0);
});

for (const [label, body] of [
  ['unknown option', { dietaryRequirements: ['Not an option'] }],
  ['non-array selections', { dietaryRequirements: 'Vegan' }],
  ['null selections', { dietaryRequirements: null }],
  ['non-string option', { dietaryRequirements: [true] }],
  ['excess selections', { dietaryRequirements: Array(31).fill('Vegan') }],
  ['non-string notes', { dietaryNotes: null }],
  ['overlong notes', { dietaryNotes: 'a'.repeat(5001) }],
]) {
  test(`rejects ${label} before service calls`, async () => {
    const fixture = await createFixture();
    const response = await fixture.request('PATCH', body);
    assert.equal(response.statusCode, 422);
    assert.ok(response.body.message);
    assert.equal(fixture.identityRequests.length, 0);
    assert.equal(fixture.updates.length, 0);
    assert.equal(fixture.reports.length, 0);
  });
}

test('accepts notes at the exact 5000-character limit', async () => {
  const fixture = await createFixture();
  const response = await fixture.request('PATCH', {
    dietaryNotes: 'a'.repeat(5000),
  });
  assert.equal(response.statusCode, 200);
  assert.equal(response.body.dietaryNotes.length, 5000);
});

for (const method of ['GET', 'DELETE', 'PUT']) {
  test(`rejects unsupported ${method} requests`, async () => {
    const fixture = await createFixture();
    const response = await fixture.request(method);
    assert.equal(response.statusCode, 405);
    assert.equal(response.headers.Allow, 'POST, PATCH');
    assert.equal(fixture.identityRequests.length, 0);
    assert.equal(fixture.updates.length, 0);
  });
}

test('requires an ID token', async () => {
  const fixture = await createFixture();
  const response = await fixture.request('PATCH', { idToken: undefined });
  assert.equal(response.statusCode, 401);
  assert.equal(fixture.identityRequests.length, 0);
  assert.equal(fixture.lookups.length, 0);
  assert.equal(fixture.updates.length, 0);
});

for (const identityError of [
  'INVALID_ID_TOKEN',
  'TOKEN_EXPIRED',
  'USER_DISABLED',
  'USER_NOT_FOUND',
]) {
  test(`rejects Firebase ${identityError} without unexpected-error logging`, async () => {
    const fixture = await createFixture({ identityStatus: 400, identityError });
    const response = await fixture.request();
    assert.equal(response.statusCode, 401);
    assert.equal(fixture.lookups.length, 0);
    assert.equal(fixture.updates.length, 0);
    assert.equal(fixture.reports.length, 0);
  });
}

for (const status of ['Archived', 'Refunded', 'Payment Made']) {
  test(`does not update a ${status} ticket`, async () => {
    const fixture = await createFixture({
      tickets: [
        {
          id: 'recInactive',
          fields: { Status: status, 'Email Address': 'guest@example.invalid' },
        },
      ],
    });
    const response = await fixture.request();
    assert.equal(response.statusCode, 409);
    assert.equal(fixture.updates.length, 0);
    assert.equal(fixture.reports.length, 0);
  });
}

for (const [label, tickets] of [
  ['no linked ticket', []],
  [
    'email mismatch',
    [
      {
        id: 'recOther',
        fields: {
          Status: 'Ticket Purchased',
          'Email Address': 'other@example.invalid',
        },
      },
    ],
  ],
  [
    'ambiguous active tickets',
    ['recOne', 'recTwo'].map(id => ({
      id,
      fields: {
        Status: 'Ticket Purchased',
        'Email Address': 'guest@example.invalid',
      },
    })),
  ],
]) {
  test(`rejects ${label} without writing`, async () => {
    const fixture = await createFixture({ tickets });
    const response = await fixture.request();
    assert.equal(response.statusCode, 409);
    assert.equal(fixture.updates.length, 0);
  });
}

for (const failure of [
  'shouldFailIdentity',
  'shouldFailLookup',
  'shouldFailUpdate',
]) {
  test(`reports ${failure} without a success response`, async () => {
    const fixture = await createFixture({ [failure]: true });
    const response = await fixture.request();
    assert.equal(response.statusCode, 500);
    assert.deepEqual(response.body, {
      message: 'Unable to save your dietary information. Please try again.',
    });
    assert.equal(fixture.reports.length, 1);
    assert.equal(
      fixture.reports[0].extra.action,
      'save-guest-dietary-information',
    );
    if (failure !== 'shouldFailUpdate') assert.equal(fixture.updates.length, 0);
  });
}

test('reports dietary read failure without returning empty success-shaped data', async () => {
  const fixture = await createFixture({ shouldFailLookup: true });
  const response = await fixture.request('POST');
  assert.equal(response.statusCode, 500);
  assert.deepEqual(response.body, {
    message: 'Unable to load your dietary information. Please try again.',
  });
  assert.equal(fixture.reports.length, 1);
  assert.equal(
    fixture.reports[0].extra.action,
    'load-guest-dietary-information',
  );
  assert.equal(fixture.updates.length, 0);
});
