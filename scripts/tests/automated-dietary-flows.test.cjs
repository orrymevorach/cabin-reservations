const assert = require('node:assert/strict');
const { test } = require('node:test');
const { chromium } = require('@playwright/test');
const {
  airtableRequest,
  listAirtableRecords,
  testEmailPrefix,
} = require('./automated-reservations-test-utils.cjs');
const { createTestIdToken } = require('./dietary-test-identity.cjs');

const appUrl = process.env.AUTOMATED_TEST_BASE_URL;
assert.ok(appUrl, 'Run through the automated reservations runner.');

async function createGuest(label) {
  const suffix = `${Date.now()}-${label}`;
  const email = `${testEmailPrefix}${suffix}@example.invalid`;
  const uid = `dietary-test-${suffix}`;
  const cabins = await listAirtableRecords('Cabins');
  assert.ok(cabins.length, 'A test cabin is required.');
  const ticket = await airtableRequest({
    method: 'POST',
    table: 'Ticket Purchases',
    body: {
      fields: {
        Name: `Dietary Automation ${label}`,
        'Email Address': email,
        'Firebase UID': uid,
        Status: 'Ticket Purchased',
        Cabin: [cabins[0].id],
      },
    },
  });
  return { ticket, email, uid, idToken: createTestIdToken({ email, uid }) };
}

async function readGuest(guest) {
  return airtableRequest({
    table: 'Ticket Purchases',
    recordId: guest.ticket.id,
  });
}

async function saveDietary(
  guest,
  dietaryRequirements,
  dietaryNotes,
  extra = {},
) {
  return fetch(`${appUrl}/api/platform/dietary-intake`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      idToken: guest.idToken,
      dietaryRequirements,
      dietaryNotes,
      ...extra,
    }),
  });
}

test('live dietary API saves, reads, clears, and protects unrelated tickets', async () => {
  const guest = await createGuest('api');
  const otherGuest = await createGuest('other');
  const otherBaseline = await readGuest(otherGuest);
  let response = await saveDietary(
    guest,
    ['Vegan', 'Peanut Allergy', 'Vegan'],
    '  Separate utensils  ',
    {
      recordId: otherGuest.ticket.id,
    },
  );
  assert.equal(response.status, 200, await response.text());
  let saved = await readGuest(guest);
  assert.deepEqual(saved.fields['Dietary Requirements'], [
    'Vegan',
    'Peanut Allergy',
  ]);
  assert.equal(saved.fields['Dietary Notes'], 'Separate utensils');
  assert.equal(saved.fields['Dietary Restrictions'], true);
  assert.deepEqual((await readGuest(otherGuest)).fields, otherBaseline.fields);

  response = await fetch(`${appUrl}/api/platform/dietary-intake`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken: guest.idToken }),
  });
  assert.deepEqual(await response.json(), {
    dietaryRequirements: ['Vegan', 'Peanut Allergy'],
    dietaryNotes: 'Separate utensils',
  });
  response = await saveDietary(guest, [], 'None');
  assert.equal(response.status, 200);
  saved = await readGuest(guest);
  assert.equal(saved.fields['Dietary Notes'], 'None');
  assert.equal(saved.fields['Dietary Restrictions'], true);
  assert.deepEqual(saved.fields['Dietary Requirements'] || [], []);
  response = await saveDietary(guest, [], '');
  assert.equal(response.status, 200);
  saved = await readGuest(guest);
  assert.equal(saved.fields['Dietary Restrictions'] || false, false);
  assert.equal(saved.fields['Dietary Notes'] || '', '');
  response = await saveDietary(guest, ['Unknown'], '');
  assert.equal(response.status, 422);
  response = await saveDietary({ ...guest, idToken: 'invalid' }, ['Vegan'], '');
  assert.equal(response.status, 401);
});

test('browser dietary prompts, save, reload, None, validation and failed-save recovery', async () => {
  const guest = await createGuest('browser');
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.route(
      'https://identitytoolkit.googleapis.com/**',
      async route => {
        const url = route.request().url();
        if (url.includes('accounts:lookup')) {
          await route.fulfill({
            json: {
              users: [
                {
                  localId: guest.uid,
                  email: guest.email,
                  emailVerified: true,
                  providerUserInfo: [
                    { providerId: 'password', email: guest.email },
                  ],
                },
              ],
            },
          });
          return;
        }
        assert.ok(
          url.includes('accounts:signInWithPassword'),
          'Unexpected browser Firebase request.',
        );
        await route.fulfill({
          json: {
            localId: guest.uid,
            email: guest.email,
            idToken: guest.idToken,
            refreshToken: 'unused-test-refresh-token',
            expiresIn: '3600',
            registered: true,
          },
        });
      },
    );
    await page.goto(appUrl);
    await page.getByLabel('Email', { exact: true }).fill(guest.email);
    await page.getByLabel('Password', { exact: true }).fill('test-password');
    await page.getByRole('button', { name: 'Log in', exact: true }).click();
    await page.waitForURL('**/summary');
    const prompt = page.getByRole('button', {
      name: 'Fill out dietary form',
      exact: true,
    });
    await prompt.waitFor();
    await prompt.click();
    await page.getByLabel('Vegan', { exact: true }).check();
    await page.getByLabel('Peanut Allergy', { exact: true }).check();
    await page
      .getByLabel('Other dietary needs or additional comments')
      .fill('Separate utensils');
    await page
      .getByRole('button', { name: 'Save dietary information', exact: true })
      .click();
    await page
      .getByRole('status')
      .filter({ hasText: 'Your dietary information has been saved.' })
      .waitFor();
    assert.equal(
      (await readGuest(guest)).fields['Dietary Notes'],
      'Separate utensils',
    );
    await page.reload();
    await page
      .getByRole('button', { name: 'Update dietary information' })
      .click();
    assert.equal(
      await page.getByLabel('Vegan', { exact: true }).isChecked(),
      true,
    );
    assert.equal(
      await page.getByLabel('Peanut Allergy', { exact: true }).isChecked(),
      true,
    );
    assert.equal(
      await page
        .getByLabel('Other dietary needs or additional comments')
        .getAttribute('maxlength'),
      '5000',
    );
    const notesInput = page.getByLabel(
      'Other dietary needs or additional comments',
    );
    await notesInput.fill('a'.repeat(5000));
    await notesInput.press('End');
    await page.keyboard.insertText('b');
    assert.equal((await notesInput.inputValue()).length, 5000);
    await page
      .getByRole('button', { name: 'Save dietary information', exact: true })
      .click();
    await page
      .getByRole('status')
      .filter({ hasText: 'has been saved' })
      .waitFor();
    assert.equal((await readGuest(guest)).fields['Dietary Notes'].length, 5000);
    await notesInput.fill('Separate utensils');
    await page
      .getByRole('button', { name: 'Save dietary information', exact: true })
      .click();
    await page
      .getByRole('status')
      .filter({ hasText: 'has been saved' })
      .waitFor();

    await page.route('**/api/platform/dietary-intake', async route => {
      await route.fulfill({
        status: 500,
        json: {
          message: 'Unable to save your dietary information. Please try again.',
        },
      });
    });
    await page
      .getByLabel('Other dietary needs or additional comments')
      .fill('Unsaved change');
    await page
      .getByRole('button', { name: 'Save dietary information', exact: true })
      .click();
    await page
      .getByRole('alert')
      .filter({ hasText: 'Unable to save' })
      .waitFor();
    assert.equal(
      await page
        .getByLabel('Other dietary needs or additional comments')
        .inputValue(),
      'Unsaved change',
    );
    assert.equal(
      (await readGuest(guest)).fields['Dietary Notes'],
      'Separate utensils',
    );
    assert.equal(
      await page
        .getByRole('status')
        .filter({ hasText: 'has been saved' })
        .count(),
      0,
    );
    await page.unroute('**/api/platform/dietary-intake');

    await page
      .getByRole('button', {
        name: "I don't have dietary restrictions",
        exact: true,
      })
      .click();
    await page
      .getByRole('status')
      .filter({ hasText: 'has been saved' })
      .waitFor();
    let saved = await readGuest(guest);
    assert.equal(saved.fields['Dietary Notes'], 'None');
    assert.equal(saved.fields['Dietary Restrictions'], true);
    assert.deepEqual(saved.fields['Dietary Requirements'] || [], []);
    await page.reload();
    await page
      .getByText('You have no dietary restrictions.', { exact: true })
      .waitFor();
    assert.equal(await prompt.count(), 0);
    await page
      .getByRole('button', { name: 'Update dietary information' })
      .click();
    await page
      .getByLabel('Other dietary needs or additional comments')
      .fill('');
    await page
      .getByRole('button', { name: 'Save dietary information', exact: true })
      .click();
    await page
      .getByRole('status')
      .filter({ hasText: 'has been saved' })
      .waitFor();
    saved = await readGuest(guest);
    assert.equal(saved.fields['Dietary Restrictions'] || false, false);
    await page.reload();
    await prompt.waitFor();
    await context.close();
  } finally {
    await browser.close();
  }
});
