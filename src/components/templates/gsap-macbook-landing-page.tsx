"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import NavBar from "./gsap-macbook-landing/components/NavBar";
import Hero from "./gsap-macbook-landing/components/Hero";
import Showcase from "./gsap-macbook-landing/components/Showcase";
import Performance from "./gsap-macbook-landing/components/Performance";
import Highlights from "./gsap-macbook-landing/components/Highlights";
import Footer from "./gsap-macbook-landing/components/Footer";

const ProductViewer = dynamic(() => import("./gsap-macbook-landing/components/ProductViewer"), {
  ssr: false,
  loading: () => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', height: '80vh', width: '100%' }}>
      <p style={{ color: '#888' }}>Loading interactive 3D model...</p>
    </div>
  ),
});

const Features = dynamic(() => import("./gsap-macbook-landing/components/Features"), {
  ssr: false,
  loading: () => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', height: '100vh', width: '100%' }}>
      <p style={{ color: '#888' }}>Loading interactive 3D model...</p>
    </div>
  ),
});

import gsap from "gsap";
import { ScrollTrigger } from "gsap/all";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function GsapMacbookLandingPage() {
  return (
    <div className="macbook-landing-page text-[#86868b] bg-black font-semibold selection:bg-neutral-800 selection:text-white relative min-h-screen antialiased overflow-x-hidden">
      {/* Dynamic Scoped CSS Injection to ensure clean look & absolute styling isolation */}
      <style dangerouslySetInnerHTML={{ __html: `
        @font-face {
          font-family: "MacRegular";
          src: url("/fonts/regular.otf");
        }
        @font-face {
          font-family: "MacMedium";
          src: url("/fonts/medium.otf");
        }
        @font-face {
          font-family: "MacSemiBold";
          src: url("/fonts/semibold.otf");
        }
        @font-face {
          font-family: "MacBold";
          src: url("/fonts/bold.otf");
        }

        .macbook-landing-page {
          --font-regular: "MacRegular", sans-serif;
          --font-medium: "MacMedium", sans-serif;
          --font-semibold: "MacSemiBold", sans-serif;
          --font-bold: "MacBold", sans-serif;
          --color-primary: #0071e3;
          --color-dark-100: #86868b;
          --color-dark-200: #2e2e30;
          --color-light-100: #adb5bd;
          font-family: var(--font-semibold);
        }

        .macbook-landing-page * {
          scrollbar-color: var(--color-dark-100) #000;
        }

        /* Missing Tailwind v4 Utility Compilations */
        .macbook-landing-page .flex-center {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .macbook-landing-page .flex-between {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .macbook-landing-page .col-center {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .macbook-landing-page .abs-center {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }

        .macbook-landing-page .h3-semibold {
          font-weight: 600;
          font-size: 1.25rem;
          color: var(--color-dark-100);
        }

        .macbook-landing-page .base-semibold {
          font-weight: 600;
          font-size: 1.0rem;
          color: var(--color-dark-100);
        }

        .macbook-landing-page .small-medium {
          font-weight: 500;
          font-size: 0.75rem;
        }

        .macbook-landing-page .bg-primary {
          background-color: var(--color-primary);
        }

        .macbook-landing-page .text-primary {
          color: var(--color-primary);
        }

        .macbook-landing-page .text-dark-100 {
          color: var(--color-dark-100);
        }

        .macbook-landing-page .text-light-100 {
          color: var(--color-light-100);
        }

        .macbook-landing-page .bg-neutral-800 {
          background-color: #2e2e30;
        }

        .macbook-landing-page header {
          width: 100vw;
          position: fixed;
          top: 0;
          left: 0;
          z-index: 50;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #000;
          min-height: 7vh;
        }

        .macbook-landing-page header nav {
          width: 100%;
          max-width: 1200px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 20px;
        }

        .macbook-landing-page header nav img {
          cursor: pointer;
          transition: all 0.35s ease-in-out;
        }
        .macbook-landing-page header nav img:hover {
          transform: translateY(-2px);
        }

        .macbook-landing-page header nav ul {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 32px;
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .macbook-landing-page header nav ul li a {
          display: none;
          color: #fff;
          opacity: 0.8;
          font-family: var(--font-regular);
          font-size: 14px;
          text-decoration: none;
          cursor: pointer;
          transition: all 0.3s ease-in-out;
        }
        @media (min-width: 768px) {
          .macbook-landing-page header nav ul li a {
            display: block;
          }
        }
        .macbook-landing-page header nav ul li a:hover {
          opacity: 1;
        }

        .macbook-landing-page #hero {
          height: fit-content;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          margin-top: 160px;
        }
        @media (min-width: 1024px) {
          .macbook-landing-page #hero {
            height: 80vh;
            margin-top: 80px;
          }
        }
        @media (min-width: 1536px) {
          .macbook-landing-page #hero {
            margin-top: 7vh;
          }
        }

        .macbook-landing-page #hero div {
          position: relative;
          z-index: 10;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        @media (min-width: 1024px) {
          .macbook-landing-page #hero div {
            transform: translateY(64px);
          }
        }

        .macbook-landing-page #hero div h1 {
          font-weight: 600;
          color: #fff;
          font-size: 24px;
        }
        @media (min-width: 1024px) {
          .macbook-landing-page #hero div h1 {
            font-size: 32px;
          }
        }
        @media (min-width: 1536px) {
          .macbook-landing-page #hero div h1 {
            font-size: 48px;
          }
        }

        .macbook-landing-page #hero div img {
          max-width: 400px;
          width: 66%;
          margin: 0 auto;
        }

        .macbook-landing-page #hero video {
          margin: 0 auto;
        }
        @media (min-width: 1024px) {
          .macbook-landing-page #hero video {
            transform: translateY(20px);
          }
        }

        .macbook-landing-page #hero button {
          position: relative;
          z-index: 10;
          background-color: var(--color-primary);
          color: #fff;
          border: none;
          padding: 8px 24px;
          margin-top: 40px;
          margin-bottom: 20px;
          border-radius: 9999px;
          font-weight: 600;
          font-size: 18px;
          cursor: pointer;
          transition: all 0.3s ease-in-out;
        }
        .macbook-landing-page #hero button:hover {
          background-color: #fff;
          color: #000;
        }

        .macbook-landing-page #hero p {
          font-weight: 600;
          font-size: 16px;
          color: var(--color-dark-100);
        }
        @media (min-width: 1024px) {
          .macbook-landing-page #hero p {
            font-size: 20px;
          }
        }

        .macbook-landing-page #product-viewer {
          position: relative;
          min-height: 93vh;
          max-width: 1200px;
          margin: 160px auto 0 auto;
          padding: 0 20px;
        }

        .macbook-landing-page #product-viewer h2 {
          color: #fff;
          font-weight: 600;
          font-size: 30px;
        }
        @media (min-width: 1024px) {
          .macbook-landing-page #product-viewer h2 {
            font-size: 60px;
          }
        }

        .macbook-landing-page #product-viewer .controls {
          position: absolute;
          z-index: 45;
          bottom: 160px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }
        @media (min-width: 1536px) {
          .macbook-landing-page #product-viewer .controls {
            bottom: 208px;
          }
        }

        .macbook-landing-page #product-viewer .controls .color-control {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background-color: #2e2e30;
          border-radius: 9999px;
          padding: 12px 24px;
          gap: 16px;
        }

        .macbook-landing-page #product-viewer .controls .color-control div {
          width: 28px;
          height: 28px;
          border-radius: 9999px;
          cursor: pointer;
          transition: all 0.2s ease-in-out;
        }

        .macbook-landing-page #product-viewer .controls .color-control div.active {
          box-shadow: 0 0 0 4px #adb5bd;
          transform: scale(0.9);
        }

        .macbook-landing-page #product-viewer .controls .size-control {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background-color: #2e2e30;
          border-radius: 9999px;
          padding: 10px 24px;
          gap: 8px;
          font-size: 12px;
          font-weight: 500;
        }

        .macbook-landing-page #product-viewer .controls .size-control div {
          width: 32px;
          height: 32px;
          border-radius: 9999px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease-in-out;
        }

        .macbook-landing-page #product-viewer #canvas {
          width: 100% !important;
          height: 80vh !important;
          position: relative;
          z-index: 40;
        }
        @media (min-width: 1024px) {
          .macbook-landing-page #product-viewer #canvas {
            height: 100vh !important;
          }
        }

        .macbook-landing-page #showcase {
          position: relative;
        }

        .macbook-landing-page #showcase .media {
          position: relative;
        }
        @media (min-width: 1024px) {
          .macbook-landing-page #showcase .media {
            overflow: hidden;
          }
        }

        .macbook-landing-page #showcase .media video {
          width: 100%;
          object-fit: cover;
          object-position: center;
        }

        .macbook-landing-page #showcase .media .mask {
          position: absolute;
          height: 100%;
          top: 0;
        }
        @media (min-width: 1024px) {
          .macbook-landing-page #showcase .media .mask {
            top: -80px;
          }
        }
        @media (min-width: 1280px) {
          .macbook-landing-page #showcase .media .mask {
            top: 0;
          }
        }

        .macbook-landing-page #showcase .media .mask img {
          height: 100%;
          transform: matrix(1, 0, 0, 1, 0, 0);
          transition: all 0.1s ease-out;
        }
        @media (min-width: 1024px) {
          .macbook-landing-page #showcase .media .mask img {
            transform: matrix(80, 0, 0, 80, 0, 0);
          }
        }

        .macbook-landing-page #showcase .content {
          position: relative;
          z-index: 10;
          margin-top: 20px;
          background-color: #000;
          font-weight: 600;
          font-size: 20px;
          color: var(--color-dark-100);
        }
        @media (min-width: 1024px) {
          .macbook-landing-page #showcase .content {
            margin-top: -160px;
            opacity: 0;
            transform: translateY(40px);
          }
        }

        .macbook-landing-page #showcase .content .wrapper {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px 80px 20px;
          display: flex;
          flex-direction: column;
          gap: 80px;
        }
        @media (min-width: 1024px) {
          .macbook-landing-page #showcase .content .wrapper {
            flex-direction: row;
            justify-content: center;
          }
        }

        .macbook-landing-page #showcase .content h2 {
          font-weight: 600;
          font-size: 30px;
          color: #fff;
        }
        @media (min-width: 1024px) {
          .macbook-landing-page #showcase .content h2 {
            font-size: 72px;
          }
        }

        .macbook-landing-page #showcase .content h3 {
          font-weight: 600;
          font-size: 20px;
          color: #fff;
        }
        @media (min-width: 1024px) {
          .macbook-landing-page #showcase .content h3 {
            font-size: 48px;
          }
        }

        .macbook-landing-page #performance {
          width: 100vw;
          height: auto;
          overflow: hidden;
          padding-top: 80px;
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
        }

        .macbook-landing-page #performance h2 {
          font-weight: 600;
          font-size: 30px;
          color: #fff;
          max-width: 672px;
          text-align: center;
          padding: 0 20px;
        }
        @media (min-width: 1024px) {
          .macbook-landing-page #performance h2 {
            font-size: 60px;
          }
        }

        .macbook-landing-page #performance .wrapper {
          width: min(1200px, 100vw);
          height: 50vh;
          position: relative;
        }
        @media (min-width: 1024px) {
          .macbook-landing-page #performance .wrapper {
            height: 100vh;
          }
        }
        @media (min-width: 1536px) {
          .macbook-landing-page #performance .wrapper {
            width: min(100rem, 100vw);
          }
        }

        .macbook-landing-page #performance .wrapper img {
          max-width: 160px;
          object-fit: cover;
          object-position: center;
          will-change: left, right, bottom, transform;
        }
        @media (min-width: 1024px) {
          .macbook-landing-page #performance .wrapper img {
            max-width: 432px;
          }
        }
        @media (min-width: 1536px) {
          .macbook-landing-page #performance .wrapper img {
            max-width: 560px;
          }
        }

        .macbook-landing-page #performance .wrapper .p1 {
          position: absolute;
          bottom: 50%;
          left: 23%;
          z-index: 1;
        }
        .macbook-landing-page #performance .wrapper .p2 {
          position: absolute;
          bottom: 40%;
          right: 17%;
          z-index: 3;
        }
        .macbook-landing-page #performance .wrapper .p3 {
          position: absolute;
          bottom: 25%;
          right: 15%;
          z-index: 2;
        }
        .macbook-landing-page #performance .wrapper .p4 {
          position: absolute;
          bottom: 15%;
          right: 10%;
          z-index: 1;
        }
        .macbook-landing-page #performance .wrapper .p5 {
          position: absolute;
          bottom: 20%;
          left: 50%;
          transform: translateX(-50%) scale(1.5);
        }
        .macbook-landing-page #performance .wrapper .p6 {
          position: absolute;
          bottom: 25%;
          left: 25%;
          z-index: 2;
        }
        .macbook-landing-page #performance .wrapper .p7 {
          position: absolute;
          bottom: 5%;
          left: 15%;
          z-index: 3;
        }

        @media (max-width: 640px) {
          .macbook-landing-page #performance .wrapper .p1 {
            left: 33%;
          }
          .macbook-landing-page #performance .wrapper .p2 {
            right: 37%;
          }
          .macbook-landing-page #performance .wrapper .p6,
          .macbook-landing-page #performance .wrapper .p7 {
            left: 35%;
          }
          .macbook-landing-page #performance .wrapper .p3 {
            right: 35%;
          }
          .macbook-landing-page #performance .wrapper .p4 {
            right: 30%;
          }
        }

        .macbook-landing-page #performance .content {
          margin: 96px auto 0 auto;
          max-width: 576px;
          padding: 0 20px;
        }

        .macbook-landing-page #performance .content p {
          text-align: center;
          font-size: 16px;
          font-weight: 600;
          color: var(--color-dark-100);
        }
        @media (min-width: 1024px) {
          .macbook-landing-page #performance .content p {
            font-size: 20px;
            transform: translateY(40px);
            opacity: 0;
          }
        }

        .macbook-landing-page #features {
          padding-top: 160px;
          position: relative;
        }

        .macbook-landing-page #features h2 {
          color: #fff;
          font-weight: 600;
          font-size: 30px;
          text-align: center;
          max-width: 768px;
          margin: 0 auto;
          padding: 0 20px;
        }
        @media (min-width: 1024px) {
          .macbook-landing-page #features h2 {
            font-size: 72px;
          }
        }

        .macbook-landing-page #features #f-canvas {
          width: 100% !important;
          height: 100vh !important;
          position: relative;
          z-index: 40;
        }

        .macbook-landing-page #features .feature-media-display {
          position: absolute;
          top: 50%;
          left: 50%;
          width: min(34vw, 500px);
          aspect-ratio: 16 / 9;
          transform: translate(-50%, -72%);
          overflow: hidden;
          border-radius: 5px;
          background-color: #050505;
          pointer-events: none;
        }

        .macbook-landing-page #features .feature-media-display video {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0;
          transition: opacity 180ms ease-out;
        }

        .macbook-landing-page #features .feature-media-display video.active {
          opacity: 1;
        }

        @media (max-width: 1024px) {
          .macbook-landing-page #features .feature-media-display {
            width: min(58vw, 480px);
            transform: translate(-50%, -66%);
          }
        }

        .macbook-landing-page #features .box {
          max-width: 320px;
          position: absolute;
          z-index: 50;
          opacity: 0;
          transform: translateY(20px);
        }

        .macbook-landing-page #features .box1 {
          left: 20px;
          top: 20%;
        }
        .macbook-landing-page #features .box2 {
          right: 20px;
          top: 30%;
        }
        .macbook-landing-page #features .box3 {
          left: 20px;
          top: 50%;
        }
        .macbook-landing-page #features .box4 {
          right: 20px;
          top: 70%;
        }
        .macbook-landing-page #features .box5 {
          left: 20px;
          top: 90%;
        }
        @media (min-width: 768px) {
          .macbook-landing-page #features .box1,
          .macbook-landing-page #features .box3,
          .macbook-landing-page #features .box5 {
            left: 80px;
          }
          .macbook-landing-page #features .box2,
          .macbook-landing-page #features .box4 {
            right: 80px;
          }
        }

        .macbook-landing-page #features .box p {
          font-weight: 600;
          font-size: 16px;
          color: var(--color-dark-100);
        }
        @media (min-width: 1024px) {
          .macbook-landing-page #features .box p {
            font-size: 20px;
          }
        }

        .macbook-landing-page #highlights {
          max-width: 1200px;
          margin: 0 auto;
          padding: 160px 20px;
        }

        .macbook-landing-page #highlights h2 {
          color: #fff;
          font-weight: 600;
          font-size: 30px;
          text-align: center;
          max-width: 768px;
          margin: 0 auto;
        }
        @media (min-width: 1024px) {
          .macbook-landing-page #highlights h2 {
            font-size: 72px;
          }
        }

        .macbook-landing-page #highlights h3 {
          color: #f5f5f7;
          font-weight: 600;
          font-size: 20px;
          text-align: center;
          margin-top: 40px;
        }
        @media (min-width: 1024px) {
          .macbook-landing-page #highlights h3 {
            font-size: 30px;
          }
        }

        .macbook-landing-page #highlights .masonry {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
          margin-top: 80px;
          color: #f5f5f7;
        }
        @media (min-width: 1024px) {
          .macbook-landing-page #highlights .masonry {
            grid-template-columns: 1fr 1fr;
          }
        }

        .macbook-landing-page #highlights .masonry .left-column,
        .macbook-landing-page #highlights .masonry .right-column {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          gap: 20px;
          opacity: 0;
          transform: translateY(-20px);
        }

        .macbook-landing-page #highlights .masonry .left-column div:first-of-type {
          background-image: url("/highlight-bg.png");
          background-repeat: no-repeat;
          background-size: cover;
          padding: 40px;
          border-radius: 24px;
          height: 100%;
          min-height: 280px;
        }
        @media (min-width: 1024px) {
          .macbook-landing-page #highlights .masonry .left-column div:first-of-type,
          .macbook-landing-page #highlights .masonry .right-column div:last-of-type {
            padding-top: 80px;
          }
        }
        @media (min-width: 1536px) {
          .macbook-landing-page #highlights .masonry .left-column div:first-of-type,
          .macbook-landing-page #highlights .masonry .right-column div:last-of-type {
            padding-top: 128px;
          }
        }

        .macbook-landing-page #highlights .masonry .left-column div:first-of-type p,
        .macbook-landing-page #highlights .masonry .left-column p,
        .macbook-landing-page #highlights .masonry .right-column p {
          font-weight: 600;
          font-size: 36px;
          max-width: 250px;
        }

        .macbook-landing-page #highlights .masonry .left-column div:last-of-type {
          background-color: #1d1d1f;
          padding: 40px;
          border-radius: 24px;
          display: flex;
          align-items: center;
          gap: 28px;
        }

        .macbook-landing-page #highlights .masonry .left-column div:last-of-type p {
          font-weight: 600;
          font-size: 20px;
        }
        @media (min-width: 1024px) {
          .macbook-landing-page #highlights .masonry .left-column div:last-of-type p {
            font-size: 24px;
          }
          .macbook-landing-page #highlights .masonry .left-column div:last-of-type p {
            font-size: 30px;
          }
        }

        .macbook-landing-page #highlights .masonry .right-column .apple-gradient {
          padding: 40px;
          border-radius: 24px;
          display: flex;
          align-items: center;
          gap: 28px;
          position: relative;
          background: #1d1d1f;
          background-clip: padding-box;
          border: 3px solid transparent;
        }

        .macbook-landing-page #highlights .masonry .right-column .apple-gradient::before {
          content: "";
          pointer-events: none;
          position: absolute;
          inset: 0px;
          z-index: -1;
          margin: -5px;
          border-radius: 24px;
          background: linear-gradient(91deg, #0096ff 0%, #bb64ff 42%, #f2416b 74%, #eb7500 100%);
        }

        .macbook-landing-page #highlights .masonry .right-column .apple-gradient p {
          font-weight: 600;
          font-size: 20px;
        }
        @media (min-width: 1024px) {
          .macbook-landing-page #highlights .masonry .right-column .apple-gradient p {
            font-size: 24px;
          }
          .macbook-landing-page #highlights .masonry .right-column .apple-gradient p {
            font-size: 30px;
          }
        }

        .macbook-landing-page #highlights .masonry .right-column .apple-gradient p span {
          background: linear-gradient(91deg, #0096ff 0%, #bb64ff 42%, #f2416b 74%, #eb7500 100%);
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .macbook-landing-page #highlights .masonry .right-column div:last-of-type {
          background-color: #1d1d1f;
          padding: 40px;
          border-radius: 24px;
          height: 100%;
          min-height: 280px;
        }

        .macbook-landing-page #highlights .masonry .right-column div:last-of-type p {
          font-weight: 600;
          font-size: 36px;
          max-width: 384px;
        }

        .macbook-landing-page #highlights .masonry .right-column div:last-of-type p .green-gradient {
          background: linear-gradient(90deg, #35a98a 0%, #6dd400 100%);
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .macbook-landing-page footer {
          max-width: 1200px;
          margin: 0 auto;
          padding: 28px 20px;
        }

        .macbook-landing-page footer .info {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .macbook-landing-page footer .info p {
          font-size: 14px;
          font-weight: 500;
        }

        .macbook-landing-page footer .info p span {
          color: var(--color-primary);
          margin: 0 2px;
        }

        .macbook-landing-page footer hr {
          margin: 28px 0;
          border: 0;
          border-top: 1px solid #424245;
        }

        .macbook-landing-page footer .links {
          display: flex;
          flex-direction: column;
          gap: 20px;
          font-size: 14px;
        }
        @media (min-width: 1024px) {
          .macbook-landing-page footer .links {
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
          }
        }

        .macbook-landing-page footer .links ul {
          display: flex;
          flex-direction: column;
          gap: 10px;
          list-style: none;
          margin: 0;
          padding: 0;
        }
        @media (min-width: 1024px) {
          .macbook-landing-page footer .links ul {
            flex-direction: row;
            gap: 0;
          }
          .macbook-landing-page footer .links ul li {
            border-left: 1px solid #424245;
            padding: 0 20px;
          }
          .macbook-landing-page footer .links ul li:first-child {
            border-left: none;
            padding-left: 0;
          }
        }

        .macbook-landing-page footer .links ul li a {
          color: #86868b;
          text-decoration: none;
          cursor: pointer;
          transition: all 0.3s ease-in-out;
        }
        .macbook-landing-page footer .links ul li a:hover {
          color: var(--color-primary);
        }
      ` }} />

      <NavBar />
      <Hero />
      <div key="product-viewer-wrap">
        <ProductViewer />
      </div>
      <Showcase />
      <Performance />
      <div key="features-wrap">
        <Features />
      </div>
      <Highlights />
      <Footer />
    </div>
  );
}
