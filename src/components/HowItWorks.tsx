import React from 'react';

interface StepProps {
  number: number;
  title: string;
  description: string;
}

const Step: React.FC<StepProps> = ({ number, title, description }) => {
  return (
    <div className="step">
      <div className="step-number">{number}</div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
};

const HowItWorks: React.FC = () => {
  const steps = [
    {
      number: 1,
      title: "Share Your Interest",
      description: "Fill out our validation form to tell us if you'd use a platform like Proyak and what features matter most to you."
    },
    {
      number: 2,
      title: "Stay Connected",
      description: "Join our updates list to get early access to our beta launch and be the first to know about new features."
    },
    {
      number: 3,
      title: "Shape the Product",
      description: "Your feedback will directly influence how we build Proyak. Help us create the job board that truly serves job seekers."
    },
    {
      number: 4,
      title: "Get Early Access",
      description: "Be among the first to try Proyak when we launch our beta. Help us test and improve the platform before public release."
    }
  ];

  return (
    <section className="how-it-works" id="how-it-works">
      <div className="container">
        <h2>Help Us Validate Our Concept</h2>
        <div className="steps">
          {steps.map((step) => (
            <Step
              key={step.number}
              number={step.number}
              title={step.title}
              description={step.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
