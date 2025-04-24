export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ status_code: 405, message: "Method not allowed", data: {} });
  }

  const body = req.body;

  try {
    const email = process.env.EMAIL;
    const password = process.env.PASSWORD;
    const api_key = process.env.TOKEN;

    const token = btoa(`${email}:${password}`);

    console.log(api_key, "api_key", token, "token", process.env.BACKEND_URL)

    const response = await fetch(process.env.BACKEND_URL, {
      method: "POST",
      headers: {
        "X-Api-Key": api_key,
        token: token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    return res.status(response.status).json({
      status_code: data.status_code,
      message: data?.message || "Question answered successfully!",
      data: data?.data || {},
    });
  } catch (error) {
    console.error("Error in upload-media API:", error);
    return res
      .status(500)
      .json({ status_code: 500, message: "Internal server error", data: {} });
  }
}
