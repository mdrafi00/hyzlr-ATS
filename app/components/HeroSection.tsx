"use client";
import React from 'react';
import Link from "next/link";

function HeroSection() {
  return (
    <section className="text-white-600 body-font">
    <div className="container mx-auto flex px-5 py-24 md:flex-row flex-col items-center justify-center">
        <div className=" md:w-1/2 lg:pr-16 md:pr-16 flex flex-col md:items-start md:text-left mb-16 md:mb-0 items-center text-center">
        <h1 className="title-font sm:text-4xl text-6xl mb-4 text-white-900">Before they sold out
            <br className="hidden lg:inline-block" />readymade gluten
        </h1>
        <p className="mb-8">Copper mug try-hard pitchfork pour-over freegan heirloom neutra air plant cold-pressed tacos poke beard tote bag. Heirloom echo park mlkshk tote bag selvage hot chicken authentic tumeric truffaut hexagon try-hard chambray.</p>
        <div className="flex justify-center">
        <Link href="/JobDescription">
            <button className="inline-flex text-white bg-indigo-500 border-0 py-2 px-6 focus:outline-none hover:bg-indigo-600 rounded text-lg" onClick={()=>sessionStorage.setItem('NavData', btoa('JDGen'))}>Get Started !</button>
            </Link>
        </div>
        </div>
        <div className="lg:max-w-lg lg:w-full md:w-1/2 w-16">
        <img alt="hero" src="HeroSectionIntro.svg" />
        </div>
    </div>
    </section>

  )
}

export default HeroSection