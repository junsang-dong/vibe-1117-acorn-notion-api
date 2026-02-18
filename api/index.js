// Vercel 서버리스 함수용 Express 앱 래퍼
const app = require('../server');

// Vercel은 module.exports를 사용
module.exports = app;

