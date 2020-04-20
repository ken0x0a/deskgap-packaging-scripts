#!/usr/bin/env node

// =====================
// =======  CLI  =======
// =====================
if (require.main === module) {
  require('../lib/main')
} else {
  console.error('\x1b[35m%s\x1b[0m', 'Only for cli usage!')
  process.exit(1)
}