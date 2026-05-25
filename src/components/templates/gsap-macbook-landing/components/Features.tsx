import {Canvas} from "@react-three/fiber";
import StudioLights from "./three/StudioLights";
import {features, featureSequence} from "../constants/index";
import clsx from "clsx";
import {Suspense, useRef, useState} from "react";
import {Html} from "@react-three/drei";
import MacbookModel from "./models/Macbook";
import {useMediaQuery} from "../hooks/useMediaQuery";
import {useGSAP} from "@gsap/react";
import gsap from 'gsap';
import {Group} from "three";

const ModelScroll = ({ onFeatureChange }: { onFeatureChange: (index: number) => void }) => {
    const groupRef = useRef<Group>(null);
    const isMobile = useMediaQuery({ query: '(max-width: 1024px)'})
    const activeFeatureRef = useRef(0);

    useGSAP(() => {
        const syncVideo = (progress: number) => {
            const index = Math.min(
                featureSequence.length - 1,
                Math.floor(progress * featureSequence.length)
            );

            if (activeFeatureRef.current !== index) {
                activeFeatureRef.current = index;
                onFeatureChange(index);
            }
        };

        if (groupRef.current) {
            gsap.set(groupRef.current.rotation, { y: -0.28 });
        }

        // 3D MODEL ROTATION ANIMATION
        const modelTimeline = gsap.timeline({
            scrollTrigger: {
                trigger: '#f-canvas',
                start: 'top top',
                end: 'bottom  top',
                scrub: 1,
                pin: true,
            }
        });

        // SYNC THE FEATURE CONTENT
        const timeline = gsap.timeline({
            scrollTrigger: {
                trigger: '#f-canvas',
                start: 'top center',
                end: 'bottom  top',
                scrub: 1,
                onUpdate: (self) => syncVideo(self.progress),
            }
        })

        // Keep the display readable while the hardware turns gently in space.
        if(groupRef.current) {
            modelTimeline.to(groupRef.current.rotation, { y: 0.28, ease: 'power1.inOut'})
        }

        timeline
            .to('.box1', { opacity: 1, y: 0, delay: 1 })
            .to('.box2', { opacity: 1, y: 0 })
            .to('.box3', { opacity: 1, y: 0 })
            .to('.box4', { opacity: 1, y: 0})
            .to('.box5', { opacity: 1, y: 0 })
    }, [onFeatureChange]);

    return (
        <group ref={groupRef}>
            <Suspense fallback={<Html><h1 className="text-white text-3xl uppercase">Loading...</h1></Html>}>
                <MacbookModel scale={isMobile ? 0.07 : 0.115} position={[0, -0.7, 0]} />
            </Suspense>
        </group>
    )
}

const Features = () => {
    const [activeFeature, setActiveFeature] = useState(0);

    return (
        <section id="features">
            <h2>See it all in a new light.</h2>

            <Canvas id="f-canvas" camera={{}}>
                <StudioLights />
                <ambientLight intensity={0.5} />
                <ModelScroll onFeatureChange={setActiveFeature} />
                <Html fullscreen>
                    <div className="feature-media-display">
                        {featureSequence.map((feature, index) => (
                            <video
                                key={feature.videoPath}
                                className={clsx(index === activeFeature && 'active')}
                                src={feature.videoPath}
                                autoPlay
                                loop
                                muted
                                playsInline
                                preload="auto"
                                aria-hidden="true"
                            />
                        ))}
                    </div>
                </Html>
            </Canvas>

            <div className="absolute inset-0">
                {features.map((feature, index) => (
                    <div key={feature.id} className={clsx('box', `box${index + 1}`, feature.styles)}>
                        <img src={feature.icon} alt={feature.highlight} />
                        <p>
                            <span className="text-white">{feature.highlight}</span>
                            {feature.text}
                        </p>
                    </div>
                ))}
            </div>
        </section>
    )
}

export default Features
