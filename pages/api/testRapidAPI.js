import { NextResponse } from 'next/server';

export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  console.log('Testing RapidAPI connection...');

  const url = 'https://would-you-rather.p.rapidapi.com/wyr/random';
  const options = {
    method: 'GET',
    headers: {
      'x-rapidapi-key': process.env.XRapidAPIKey,
      'x-rapidapi-host': 'would-you-rather.p.rapidapi.com'
    }
  };

  console.log('API Key (last 4 chars):', process.env.XRapidAPIKey ? process.env.XRapidAPIKey.slice(-4) : 'Not set');

  if (!process.env.XRapidAPIKey) {
    return new NextResponse('RapidAPI key is not set', { status: 500 });
  }

  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      console.error('API Response:', response.status, response.statusText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    console.log('API response:', JSON.stringify(result));

    return new NextResponse(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error testing RapidAPI:', error);
    return new NextResponse(`Error testing RapidAPI: ${error.message}`, { status: 500 });
  }
}