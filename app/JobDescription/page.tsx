import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import JobForm from '../components/JobForm';

function page() {
  return (
    <>
    <div className='p-8'>
    <Header />
    <JobForm />
    <Footer />
    </div>
    </>
  )
}

export default page