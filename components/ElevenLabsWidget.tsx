'use client';

import Script from 'next/script';

const ELEVENLABS_AGENT_ID = 'agent_1401kjy6b9kqebfbht9d8wx9xrce';

export function ElevenLabsWidget() {
  return (
    <>
      <Script
        src="https://unpkg.com/@elevenlabs/convai-widget-embed"
        strategy="afterInteractive"
        type="text/javascript"
      />
      <div className="mt-16 max-w-content">
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <elevenlabs-convai agent-id={ELEVENLABS_AGENT_ID} />
      </div>
    </>
  );
}
