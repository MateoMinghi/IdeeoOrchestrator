export default {
  test: {
    environment: 'node',
    setupFiles: ['server/testing/setup.ts', 'src/testing/all-locales.ts'],
    include: ['server/drivers/openai-chat*.test.ts', 'server/drivers/openai-responses.test.ts',
      'server/drivers/chat-tool-approval.test.ts', 'server/drivers/prompt-split.test.ts'],
    pool: 'forks', maxWorkers: 1, fileParallelism: false, testTimeout: 40000, hookTimeout: 30000,
  },
};
