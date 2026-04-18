const { Expo } = require('expo-server-sdk');
const prisma = require('../../prisma/client');

let expo = new Expo();

async function sendPushNotification(userId, title, body, data = {}) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { expoPushToken: true },
    });
    if (!user?.expoPushToken) return;
    if (!Expo.isExpoPushToken(user.expoPushToken)) {
      console.error(`Invalid push token for user ${userId}`);
      return;
    }
    const messages = [{
      to: user.expoPushToken,
      sound: 'default',
      title,
      body,
      data,
    }];
    const chunks = expo.chunkPushNotifications(messages);
    for (const chunk of chunks) {
      await expo.sendPushNotificationsAsync(chunk);
    }
  } catch (error) {
    console.error('Error sending push notification:', error);
  }
}

module.exports = { sendPushNotification };