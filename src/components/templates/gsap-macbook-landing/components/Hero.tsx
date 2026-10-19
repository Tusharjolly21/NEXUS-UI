import {useEffect, useRef} from "react";

const Hero = () => {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if(videoRef.current) videoRef.current.playbackRate = 2;
    }, []);

    return (
        <section id="hero">
            <div>
                <h1>Halcyon Book Pro</h1>
                <p className="hero-tagline">Built for Halcyon Intelligence.</p>
            </div>

            <video ref={videoRef} src="/videos/hero.mp4" poster="/videos/hero-poster.webp" autoPlay muted playsInline />

            <button>Buy</button>

            <p>From $1,599 or $133/mo for 12 months</p>
        </section>
    )
}
export default Hero
