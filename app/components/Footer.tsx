import React from 'react';
// import Image from "next/image";

function Footer() {
  return (
    <header className="text-gray-600 body-font m-5" style={{position: 'fixed', bottom: '0', width: '100%'}}>
    <div className="container mx-auto flex flex-wrap flex-col md:flex-row items-center">
      <a className="flex title-font font-medium items-center text-gray-900 mb-4 md:mb-0 size-8">
        <img src='https://cdn.prod.website-files.com/64fc48f31a4d9631cd0b7df0/650ecb48d22e2bc3f80ffe36_HJ%20Recruitment%20Transparent%20256.png' alt='HJ_Rec-Logo' />
      </a>
      <div className="md:ml-auto flex flex-wrap items-center text-base justify-center inline-flex items-center mx-16">
          <span className='text-white mx-6 italic'>Thanks For Visiting !</span>
      
      </div>
    </div>
  </header>
  )
}

export default Footer