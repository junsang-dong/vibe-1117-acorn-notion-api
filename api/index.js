// Vercel 서버리스 함수용 Express 앱 래퍼
const app = require('../server');

// Vercel 서버리스 함수는 요청 핸들러를 export해야 함
module.exports = (req, res) => {
  return app(req, res);
};

