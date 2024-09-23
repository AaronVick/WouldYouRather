import Head from 'next/head';
import { useState } from 'react';

export default function Home() {
  const [error, setError] = useState(null);

  const playGame = async () => {
    try {
      console.log('Attempting to play game...');
      const response = await fetch('/api/playWouldYouRather');
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const html = await response.text();
      console.log('Received HTML:', html);
      
      // For now, let's just display the received HTML
      document.body.innerHTML = html;
    } catch (err) {
      console.error('Error playing game:', err);
      setError(err.message);
    }
  };

  const shareText = encodeURIComponent('Play the Would You Rather game!\n\nFrame by @aaronv.eth');
  const shareLink = `https://warpcast.com/~/compose?text=${shareText}&embeds[]=${encodeURIComponent(process.env.NEXT_PUBLIC_BASE_URL)}`;

  const imageUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/wouldrather.png`;

  return (
    <div>
      <Head>
        <title>Would You Rather Game</title>
        <meta property="og:title" content="Would You Rather Game" />
        <meta property="og:image" content={imageUrl} />
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:image" content={imageUrl} />
        <meta property="fc:frame:button:1" content="Play Game" />
        <meta property="fc:frame:button:2" content="Share" />
        <meta property="fc:frame:button:2:action" content="link" />
        <meta property="fc:frame:button:2:target" content={shareLink} />
      </Head>
      <main>
        <h1>Welcome to Would You Rather!</h1>
        <button onClick={playGame}>Play Game</button>
        <button onClick={() => window.open(shareLink)}>Share</button>
        {error && <p style={{color: 'red'}}>Error: {error}</p>}
      </main>
    </div>
  );
}