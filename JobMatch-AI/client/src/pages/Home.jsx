import React from 'react';
import Hero from '../components/Hero';
import useDocumentTitle from '../hooks/useDocumentTitle';

const Home = () => {
  useDocumentTitle(
    'AI Hiring & Skill Matching',
    'Match candidates to jobs by verified skills and automated quality benchmarks, not keyword density.'
  );

  return (
    <>
      <Hero />
    </>
  );
};

export default Home;
