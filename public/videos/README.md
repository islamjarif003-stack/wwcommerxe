# Hero Video Setup

Place your hero background video file(s) here:

📁 `/public/videos/hero.mp4`

## Requirements
- Duration: 4–8 seconds
- Resolution: 1920×1080 (1080p) minimum
- Format: MP4 (H.264 codec) for broad browser support
- File size: Keep under 8MB for fast loading
- Content: Abstract motion, lifestyle, product showcase — NO audio needed (muted)
- Loop point: Should loop seamlessly

## How to Enable

Once you have a video file, open:
`src/app/page.tsx`

Find the `HeroVideo` component and update `sources`:

```tsx
<HeroVideo
  sources={["/videos/hero.mp4"]}   // ← add your video path here
  fallbackImage="/images/hero-fallback.jpg"
  minHeight="100vh"
  overlayColor="rgba(0,0,0,0.25)"
/>
```

## Fallback Image
Also create a fallback image for mobile at:
`/public/images/hero-fallback.jpg` (1200×800 minimum)

## Free Video Resources
- https://www.pexels.com/videos/ (free, no attribution required with account)
- https://coverr.co/ (free lifestyle videos)
- https://pixabay.com/videos/ (CC0 licensed)

## Performance Notes
- The video is never loaded on mobile (≤768px)
- The video is never loaded on slow 2G/slow-2g connections
- Video src is lazy-loaded after first paint (won't block LCP)
- The gradient hero still shows beautifully with no video
