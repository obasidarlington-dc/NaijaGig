const prisma = require('../../prisma/client');

// GET /api/chat/conversations
exports.getConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    const conversations = await prisma.conversation.findMany({
      where: {
        booking: {
          OR: [{ clientId: userId }, { artisanId: userId }],
        },
      },
      include: {
        booking: {
          include: {
            client: { select: { id: true, name: true, profileImage: true, role: true } },
            artisan: { select: { id: true, name: true, profileImage: true, role: true } },
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
    const formatted = conversations.map(conv => {
      const isClient = conv.booking.clientId === userId;
      const otherUser = isClient ? conv.booking.artisan : conv.booking.client;
      const lastMessage = conv.messages[0];
      return {
        id: conv.id,
        otherUser: {
          id: otherUser.id,
          name: otherUser.name,
          profileImage: otherUser.profileImage,
          role: otherUser.role,   // 👈 include role
        },
        lastMessage: lastMessage?.content || '',
        lastMessageTime: lastMessage?.createdAt,
        bookingId: conv.bookingId,
      };
    });
    res.json({ success: true, data: formatted });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};


// exports.getConversations = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const conversations = await prisma.conversation.findMany({
//       where: {
//         booking: {
//           OR: [{ clientId: userId }, { artisanId: userId }],
//         },
//       },
//       include: {
//         booking: {
//           include: {
//             client: { select: { id: true, name: true, profileImage: true } },
//             artisan: { select: { id: true, name: true, profileImage: true } },
//           },
//         },
//         messages: {
//           orderBy: { createdAt: 'desc' },
//           take: 1,
//         },
//       },
//       orderBy: { updatedAt: 'desc' },
//     });
//     const formatted = conversations.map(conv => {
//       const otherUser = conv.booking.clientId === userId ? conv.booking.artisan : conv.booking.client;
//       const lastMessage = conv.messages[0];
//       return {
//         id: conv.id,
//         otherUser: { name: otherUser.name, profileImage: otherUser.profileImage, id: otherUser.id },
//         lastMessage: lastMessage?.content || '',
//         lastMessageTime: lastMessage?.createdAt,
//         bookingId: conv.bookingId,
//         serviceType: conv.booking.serviceType,
//       };
//     });
//     res.json({ success: true, data: formatted });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, error: 'Server error' });
//   }
// };

// GET /api/chat/messages/:conversationId
exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;
    const conv = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { booking: true },
    });
    if (!conv || (conv.booking.clientId !== userId && conv.booking.artisanId !== userId)) {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }
    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      include: { sender: { select: { name: true, profileImage: true } } },
    });
    res.json({ success: true, data: messages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// POST /api/chat/messages/read/:conversationId
exports.markMessagesRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;
    await prisma.message.updateMany({
      where: { conversationId, senderId: { not: userId }, isRead: false },
      data: { isRead: true },
    });
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};


// const prisma = require('../../prisma/client');

// // GET /api/chat/conversations
// exports.getConversations = async (req, res) => {
//   try {
//     const userId = req.user.userId;
//     const conversations = await prisma.conversation.findMany({
//       where: {
//         booking: {
//           OR: [{ clientId: userId }, { artisanId: userId }],
//         },
//       },
//       include: {
//         booking: {
//           include: {
//             client: { select: { id: true, name: true, profileImage: true } },
//             artisan: { select: { id: true, name: true, profileImage: true } },
//           },
//         },
//         messages: {
//           orderBy: { createdAt: 'desc' },
//           take: 1,
//         },
//       },
//       orderBy: { updatedAt: 'desc' },
//     });
//     // Format last message and unread count
//     const formatted = conversations.map(conv => {
//       const otherUser = conv.booking.clientId === userId ? conv.booking.artisan : conv.booking.client;
//       const lastMessage = conv.messages[0];
//       return {
//         id: conv.id,
//         otherUser: { name: otherUser.name, profileImage: otherUser.profileImage },
//         lastMessage: lastMessage?.content || '',
//         lastMessageTime: lastMessage?.createdAt,
//         bookingId: conv.bookingId,
//         serviceType: conv.booking.serviceType,
//       };
//     });
//     res.json({ success: true, data: formatted });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, error: 'Server error' });
//   }
// };

// // GET /api/chat/messages/:conversationId
// exports.getMessages = async (req, res) => {
//   try {
//     const { conversationId } = req.params;
//     const userId = req.user.userId;
//     // Verify user belongs to this conversation
//     const conv = await prisma.conversation.findUnique({
//       where: { id: conversationId },
//       include: { booking: true },
//     });
//     if (!conv || (conv.booking.clientId !== userId && conv.booking.artisanId !== userId)) {
//       return res.status(403).json({ success: false, error: 'Unauthorized' });
//     }
//     const messages = await prisma.message.findMany({
//       where: { conversationId },
//       orderBy: { createdAt: 'asc' },
//     });
//     res.json({ success: true, data: messages });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, error: 'Server error' });
//   }
// };

// // POST /api/chat/messages/read/:conversationId
// exports.markMessagesRead = async (req, res) => {
//   try {
//     const { conversationId } = req.params;
//     const userId = req.user.userId;
//     await prisma.message.updateMany({
//       where: { conversationId, senderId: { not: userId }, isRead: false },
//       data: { isRead: true },
//     });
//     res.json({ success: true });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, error: 'Server error' });
//   }
// };