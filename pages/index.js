import Head from 'next/head';

export default function Home() {
  const imageUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/wouldrather.png`;
  const playUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/playWouldYouRather`;
  
  const shareText = encodeURIComponent('Play the Would You Rather game!\n\nFrame by @aaronv.eth');
  const shareLink = `https://warpcast.com/~/compose?text=${shareText}&embeds[]=${encodeURIComponent(process.env.NEXT_PUBLIC_BASE_URL)}`;

  return (
    <div>
      <Head>
        <title>Would You Rather Game</title>
        <meta property="og:title" content="Would You Rather Game" />
        <meta property="og:image" content={imageUrl} />
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:image" content={imageUrl} />
        <meta property="fc:frame:button:1" content="Play Game" />
        <meta property="fc:frame:post_url" content={playUrl} />
      </Head>
      <main>
        <h1>Welcome to Would You Rather!</h1>
        <p>This is a Farcaster Frame game. Interact with it on Farcaster!</p>
        <button onClick={() => window.open(shareLink)}>Share</button>
      </main>
    </div>
  );
}