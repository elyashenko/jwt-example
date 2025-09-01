#!/usr/bin/env ts-node

import JWTExamples from './jwtExamples';

/**
 * Скрипт для запуска всех примеров JWT
 * Запуск: npm run examples
 */
async function main() {
  console.log('🎯 JWT TypeScript Examples');
  console.log('==========================\n');
  
  try {
    await JWTExamples.runAllExamples();
  } catch (error) {
    console.error('❌ Error running examples:', error);
    process.exit(1);
  }
}

// Запускаем примеры, если файл вызван напрямую
if (require.main === module) {
  main();
}

export default main;
