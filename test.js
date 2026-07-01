const test = require('node:test');
const assert = require('node:assert/strict');
const { normalizeText, shouldReplyToMessage } = require('./index');

test('normalizeText trims and lowercases', () => {
  assert.equal(normalizeText('  HeLLo  '), 'hello');
  assert.equal(normalizeText(''), '');
});

test('shouldReplyToMessage only replies in target group for hello', async () => {
  const targetMessage = {
    fromMe: false,
    body: 'Hello',
    getChat: async () => ({ isGroup: true, name: 'Maqsad' })
  };

  const wrongGroupMessage = {
    fromMe: false,
    body: 'Hello',
    getChat: async () => ({ isGroup: true, name: 'Other' })
  };

  const privateMessage = {
    fromMe: false,
    body: 'Hello',
    getChat: async () => ({ isGroup: false, name: 'Private' })
  };

  assert.equal(await shouldReplyToMessage(targetMessage), true);
  assert.equal(await shouldReplyToMessage(wrongGroupMessage), false);
  assert.equal(await shouldReplyToMessage(privateMessage), false);
});
