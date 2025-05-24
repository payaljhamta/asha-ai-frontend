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
    const backend_url = process.env.BACKEND_URL;

    // Check if environment variables are available
    if (!backend_url) {
      console.error("BACKEND_URL environment variable is not set");
      return res
        .status(500)
        .json({ status_code: 500, message: "Backend configuration error", data: {} });
    }

    const token = btoa(`${email}:${password}`);


    const response = await fetch(`${backend_url}/chat`, {
      method: "POST",
      headers: {
        "X-Api-Key": api_key,
        token: token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Backend response error:", response.status, errorText);
      
      return res.status(response.status).json({
        status_code: response.status,
        message: `Backend error: ${response.statusText}`,
        data: {},
      });
    }

    const data = await response.json();

    return res.status(response.status).json({
      status_code: data.status_code || response.status,
      message: data?.message || "Question answered successfully!",
      data: data?.data || data || {},
    });
  } catch (error) {
    console.error("Error in chat API:", error);
    return res
      .status(500)
      .json({ 
        status_code: 500, 
        message: "Internal server error: " + error.message, 
        data: {} 
      });
  }
}
