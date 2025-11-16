export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { messageUrl } = req.body;

    if (!messageUrl) {
      return res.status(400).json({ error: "Missing messageUrl" });
    }

    // Extract channel + message IDs from Discord URL
    const match = messageUrl.match(/channels\/\d+\/(\d+)\/(\d+)/);
    if (!match) {
      return res.status(400).json({ error: "Invalid Discord message link" });
    }

    const channelId = match[1];
    const messageId = match[2];

    // Fetch from Discord using bot token (server side, safe)
    const discordResponse = await fetch(
      `https://discord.com/api/v10/channels/${channelId}/messages/${messageId}`,
      {
        headers: {
          Authorization: `Bot ${process.env.BOT_TOKEN}`
        }
      }
    );

    if (!discordResponse.ok) {
      return res.status(500).json({ error: "Discord API error" });
    }

    const data = await discordResponse.json();

    // Extract attachments (images)
    const imageUrls = data.attachments
      .filter(a => a.content_type?.startsWith("image"))
      .map(a => a.url);

    return res.status(200).json({ images: imageUrls });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
}
