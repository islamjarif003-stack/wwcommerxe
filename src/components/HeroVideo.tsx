"use client";
import { useEffect, useRef, useState } from "react";

interface HeroVideoProps {
    /** Array of video URLs — first supported format will be used */
    sources?: string[];
    /** Fallback image (required for mobile / slow connections) */
    fallbackImage: string;
    /** Children overlaid on top of the video */
    children?: React.ReactNode;
    /** Min-height of the hero section */
    minHeight?: string;
    /** Optional overlay color */
    overlayColor?: string;
}

/**
 * Nike / Apple–style hero background video.
 * - Autoplay, muted, loop, no controls
 * - On mobile or slow connection → shows fallback image instead
 * - Video loads AFTER first paint (won't block LCP)
 * - Zero layout shift — size set via CSS
 */
export function HeroVideo({
    sources = [],
    fallbackImage,
    children,
    minHeight = "100svh",
    overlayColor = "rgba(0,0,0,0.45)",
}: HeroVideoProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [showVideo, setShowVideo] = useState(false);
    const [videoReady, setVideoReady] = useState(false);

    useEffect(() => {
        // Don't attempt video on mobile (<= 768px) or if sources are empty
        if (sources.length === 0) return;
        // if (window.innerWidth <= 768) return; // Commented out to allow video on mobile

        // Check connection quality
        const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
        if (connection) {
            const slowTypes = ["slow-2g", "2g"];
            if (slowTypes.includes(connection.effectiveType)) return;
        }

        setShowVideo(true);
    }, [sources]);

    useEffect(() => {
        if (!showVideo || !videoRef.current) return;
        const video = videoRef.current;

        const handleCanPlay = () => setVideoReady(true);
        video.addEventListener("canplaythrough", handleCanPlay);

        // Lazy-load: set src after mount
        if (sources[0] && !video.src) {
            video.src = sources[0];
            video.load();
        }

        return () => video.removeEventListener("canplaythrough", handleCanPlay);
    }, [showVideo, sources]);

    return (
        <div style={{
            position: "relative", overflow: "hidden",
            minHeight, display: "flex", alignItems: "center",
        }}>
            {/* Fallback image (always rendered, hidden once video plays) */}
            <div style={{
                position: "absolute", inset: 0, zIndex: 0,
                backgroundImage: `url(${fallbackImage})`,
                backgroundSize: "cover", backgroundPosition: "center",
                opacity: videoReady ? 0 : 1,
                transition: "opacity 0.8s ease",
            }} />

            {/* Background video */}
            {showVideo && (
                <video
                    ref={videoRef}
                    muted
                    autoPlay
                    loop
                    playsInline
                    preload="none"               // Don't preload — set src lazily above
                    style={{
                        position: "absolute", inset: 0, width: "100%", height: "100%",
                        objectFit: "cover", zIndex: 0,
                        opacity: videoReady ? 1 : 0,
                        transition: "opacity 0.8s ease",
                    }}
                />
            )}

            {/* Dark overlay */}
            <div style={{
                position: "absolute", inset: 0, zIndex: 1,
                background: overlayColor,
            }} />

            {/* Content */}
            <div style={{ position: "relative", zIndex: 2, width: "100%" }}>
                {children}
            </div>
        </div>
    );
}
