export default async function handler(req, res) {
  // allow CodePen to call this API
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { messageUrl } = req.body || {};

  if (!messageUrl) {
    return res.status(400).json({ error: "messageUrl is required" });
  }

  // Extract IDs
  const match = messageUrl.match(/channels\/(\d+)\/(\d+)\/(\d+)/);
  if (!match) {
    return res.status(400).json({ error: "Invalid Discord message URL" });
  }

  const channelId = match[2];
  const messageId = match[3];

  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token) {
    return res.status(500).json({ error: "Missing bot token" });
  }

  try {
    const response = await fetch(
      `https://discord.com/api/v10/channels/${channelId}/messages/${messageId}`,
      {
        headers: {
          Authorization: `Bot ${token}`,
        },
      }
    );

    const msgData = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: "Discord API error",
        details: msgData,
      });
    }

    return res.status(200).json({
      attachments: msgData.attachments || [],
    });
  } catch (err) {
    return res.status(500).json({ error: "Server error", details: err });
  }
}
