export async function runApifyActor(actorId: string, input: any) {
  const token = process.env.APIFY_API_TOKEN;
  if (!token) {
    throw new Error('APIFY_API_TOKEN is not set');
  }

  const response = await fetch(`https://api.apify.com/v2/acts/${actorId}/runs?token=${token}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Apify Run Error: ${error}`);
  }

  const { data } = await response.json();
  return data;
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
