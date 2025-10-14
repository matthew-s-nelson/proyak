import React, { useState, useEffect } from 'react';
import { MessageCircle, Target, Zap, Gift } from 'lucide-react';

interface BenefitItemProps {
  icon: React.ReactNode;
  text: string;
}

const BenefitItem: React.FC<BenefitItemProps> = ({ icon, text }) => {
  return (
    <div className="benefit-item">
      <span className="benefit-icon">{icon}</span>
      <span>{text}</span>
    </div>
  );
};

const SignupFormSection: React.FC = () => {
  const [formLoaded, setFormLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFormLoaded(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const benefits = [
    {
      icon: <MessageCircle size={20} />,
      text: "Share Your Thoughts"
    },
    {
      icon: <Target size={20} />,
      text: "Shape Our Features"
    },
    {
      icon: <Zap size={20} />,
      text: "Quick 2-minute survey"
    },
    {
      icon: <Gift size={20} />,
      text: "Early Access Reward"
    }
  ];

  return (
    <section className="signup-form-section" id="validate">
      <div className="container">
        <div className="signup-form-header">
          <h2>Help Us Validate Proyak</h2>
          <p>Tell us about your job search experience and help us build a platform that truly serves job seekers like you.</p>
        </div>
        
        <div className="form-benefits">
          {benefits.map((benefit, index) => (
            <BenefitItem
              key={index}
              icon={benefit.icon}
              text={benefit.text}
            />
          ))}
        </div>

        <div className="embedded-form-container">
          {!formLoaded && (
            <div className="loading-message">
              <div className="loading-spinner"></div>
              Loading signup form...
            </div>
          )}
          <div className="embedded-form-wrapper" style={{ display: formLoaded ? 'block' : 'none' }}>
            <iframe 
              className="embedded-google-form"
              src="https://docs.google.com/forms/d/e/1FAIpQLSfwtxVQ8UH3nJFrX23J0AYNNxtdLVrESjfhxijIil4UQwDjEg/viewform?embedded=true"
              frameBorder="0"
              title="Proyak Signup Form">
            </iframe>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SignupFormSection;
