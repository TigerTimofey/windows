export async function query(data) {
  const response = await fetch(
    "https://router.huggingface.co/featherless-ai/v1/completions",
    {
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_HF_API_KEY}`,
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        model: 'meta-llama/Meta-Llama-3-8B',
        prompt: data.prompt
      }),
    }
  );
  const result = await response.json();
  return result;
}
