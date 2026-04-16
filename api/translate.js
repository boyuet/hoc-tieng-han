export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    const { text, source = "ko", target = "vi" } = req.body || {};

    if (!text || !String(text).trim()) {
      return res.status(400).json({ ok: false, error: "Thiếu text" });
    }

    const clientId = process.env.NAVER_CLIENT_ID;
    const clientSecret = process.env.NAVER_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return res.status(500).json({
        ok: false,
        error: "Thiếu NAVER_CLIENT_ID hoặc NAVER_CLIENT_SECRET"
      });
    }

    const params = new URLSearchParams();
    params.append("source", source);
    params.append("target", target);
    params.append("text", text);

    const papagoRes = await fetch("https://openapi.naver.com/v1/papago/n2mt", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "X-Naver-Client-Id": clientId,
        "X-Naver-Client-Secret": clientSecret
      },
      body: params.toString()
    });

    const data = await papagoRes.json().catch(() => null);

    if (!papagoRes.ok) {
      return res.status(papagoRes.status).json({
        ok: false,
        error: data?.errorMessage || "Papago request failed",
        raw: data
      });
    }

    const meaning = data?.message?.result?.translatedText || "";

    return res.status(200).json({
      ok: true,
      meaning
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: err.message || "Server error"
    });
  }
}
