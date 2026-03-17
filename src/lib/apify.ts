export async function runApifyActor(actorId: string, input: any) {
  const token = process.env.APIFY_API_TOKEN;
  if (!token) {
    throw new Error('APIFY_API_TOKEN is not set in environment variables');
  }

  // Ensure actorId uses tilde instead of slash for v2 API
  const normalizedActorId = actorId.replace('/', '~');

  const response = await fetch(`https://api.apify.com/v2/acts/${normalizedActorId}/runs?token=${token}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = errorText;
    try {
      const errorJson = JSON.parse(errorText);
      errorMessage = errorJson.error?.message || errorJson.message || errorText;
    } catch (e) {
      // Not JSON
    }
    throw new Error(`Apify Run Error (${response.status}): ${errorMessage}`);
  }

  const result = await response.json();
  return result.data;
}

export async function getApifyDataset(datasetId: string) {
  const token = process.env.APIFY_API_TOKEN;
  const response = await fetch(`https://api.apify.com/v2/datasets/${datasetId}/items?token=${token}`);

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Apify Dataset Error: ${error}`);
  }

  return await response.json();
}
