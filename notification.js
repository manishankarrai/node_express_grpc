

// VAPID Keys (Dummy keys for now, use `web-push generate-vapid-keys` to generate your own)

const express = require('express');
const bodyParser = require('body-parser');
const webPush = require('web-push');

// VAPID Keys (Dummy keys for now, use `web-push generate-vapid-keys` to generate your own)
const vapidKeys = {
    publicKey: "BBdJMa1Ss97giUdNXv1hmY-5LtCImfc8_oQdP0ovhx8HXhYh4PE88UbSWTutnzOWw42K6HjB6pyn7ufzqFBwKLo",
    privateKey: "XnBVGDMGfnVzDiQTWe-bO29YTX6bVsSCbQclCV33240"

};

webPush.setVapidDetails(
  'mailto:your-email@example.com', // The email address for your service
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

const app = express();
const PORT = 3000;

app.use(bodyParser.json());

// Store subscriptions temporarily (in real-world, you should use a DB)
let subscriptions = [];

// API to register push subscription
app.post('/subscribe', (req, res) => {
  const subscription = req.body;
  subscriptions.push(subscription);
  res.status(201).json({ message: 'Subscription successful!' });
});

// API to send push notification
app.post('/send-notification', (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  // Send the notification to all subscribers
  subscriptions.forEach(subscription => {
    webPush.sendNotification(subscription, JSON.stringify({ message }))
      .catch(err => console.error('Error sending notification', err));
  });

  res.status(200).json({ message: 'Notification sent successfully!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Push notification service running on http://localhost:${PORT}`);
});
