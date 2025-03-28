import React from 'react'
import Header from './components/Header'
import HeroSection from './components/HeroSection'
import StepsAhead from './components/StepsAhead'
import Footer from './components/Footer'

export default function Home() {
  return (

          <>
          <div className='p-8'>
          <Header />
          <HeroSection />
          <StepsAhead />
          <Footer />
          </div>
          </>
        )
      }

