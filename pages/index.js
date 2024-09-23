import Head from 'next/head';

export default function Home() {
  const shareText = encodeURIComponent('Play the Would You Rather game!\n\nFrame by @aaronv.eth');
  const shareLink = `https://warpcast.com/~/compose?text=${shareText}&embeds[]=${encodeURIComponent(process.env.NEXT_PUBLIC_BASE_URL)}`;

  // Use the existing wouldrather.png image for the initial frame
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
        <meta property="fc:frame:post_url" content={`${process.env.NEXT_PUBLIC_BASE_URL}/api/playWouldYouRather`} />
        <meta property="fc:frame:button:2" content="Share" />
        <meta property="fc:frame:button:2:action" content="link" />
        <meta property="fc:frame:button:2:target" content={shareLink} />
      </Head>
      <main>
        <h1>Welcome to Would You Rather!</h1>
        <p>Click the button to start playing!</p>
      </main>
    </div>
  );
}
