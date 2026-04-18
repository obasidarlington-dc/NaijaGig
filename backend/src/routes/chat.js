const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { getConversations, getMessages, markMessagesRead } = require('../controllers/chatController');

router.use(authenticate);
router.get('/conversations', getConversations);
router.get('/messages/:conversationId', getMessages);
router.post('/messages/read/:conversationId', markMessagesRead);

module.exports = router;



// const express = require('express');
// const router = express.Router();
// const { authenticate } = require('../middleware/auth');

// // All chat routes require authentication
// router.use(authenticate);

// // GET /api/chat/conversations
// router.get('/conversations', (req, res) => {
//   res.json({ success: true, data: [] });
// });

// // GET /api/chat/messages/:conversationId
// router.get('/messages/:conversationId', (req, res) => {
//   res.json({ success: true, data: [] });
// });

// // POST /api/chat/messages/read/:conversationId
// router.post('/messages/read/:conversationId', (req, res) => {
//   res.json({ success: true });
// });

// module.exports = router;