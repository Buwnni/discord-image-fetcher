export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { messageUrl } = req.body;

    if (!messageUrl) {
      return res.status(400).json({ error: "Missing messageUrl" });
    }

    const match = messageUrl.match(/channels\/(\d+)\/(\d+)\/(\d+)/);
    if (!match) {
      return res.status(400).json({ error: "Invalid Discord message URL" });
    }

    const [, guildId, channelId, messageId] = match;
    const token = process.env.BOT_TOKEN;

    if (!token) {
      return res.status(500).json({ error: "Missing BOT_TOKEN on server." });
    }

    const response = await fetch(
      `https://discord.com/api/v10/channels/${channelId}/messages/${messageId}`,
      {
        headers: { Authorization: `Bot ${token}` },
      }
    );

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return res.status(response.status).json({ error: err.message || "Discord API error" });
    }

    const messageData = await response.json();
    res.status(200).json({ attachments: messageData.attachments || [] });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
}
