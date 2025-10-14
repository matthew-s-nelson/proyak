import React, { useState, useEffect } from 'react';
import { Bell, Lightbulb } from 'lucide-react';

interface UpdateBenefitProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const UpdateBenefit: React.FC<UpdateBenefitProps> = ({ icon, title, description }) => {
  return (
    <div className="update-benefit">
      <span className="update-icon">{icon}</span>
      <div>
        <h4>{title}</h4>
        <p>{description}</p>
      </div>
    </div>
  );
};

const UpdatesSection: React.FC = () => {
  const [formLoaded, setFormLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFormLoaded(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const benefits = [
    {
      icon: <Bell size={32} color="white" />,
      title: "Launch Notifications",
      description: "Get notified when our beta is ready and be among the first to try Proyak"
    },
    {
      icon: <span style={{ fontSize: '32px' }}>🙏</span>,
      title: "Development Updates", 
      description: "See our progress and learn about new features as we build them"
    },
    {
      icon: <Lightbulb size={32} color="white" />,
      title: "Early Access",
      description: "Get priority access to beta testing and help shape the final product"
    }
  ];

  return (
    <section className="updates-section" id="updates">
      <div className="container">
        <div className="updates-header">
          <h2>Stay Updated on Our Progress</h2>
          <p>Be the first to know when Proyak launches and get exclusive updates on our development journey</p>
        </div>
        
        <div className="updates-form-container">
          <div className="updates-benefits">
            {benefits.map((benefit, index) => (
              <UpdateBenefit
                key={index}
                icon={benefit.icon}
                title={benefit.title}
                description={benefit.description}
              />
            ))}
          </div>

          <div className="contact-form-wrapper">
            {!formLoaded && (
              <div className="contact-loading-message">
                <div className="loading-spinner"></div>
                Loading contact form...
              </div>
            )}
            <div className="contact-form-container" style={{ display: formLoaded ? 'block' : 'none' }}>
              <iframe 
                className="contact-google-form"
                src="https://docs.google.com/forms/d/e/1FAIpQLSc6D0mROsr0L_K4OiZdIsTl125bIrANNMbBz1R7QGRtkFI0Eg/viewform?embedded=true"
                frameBorder="0"
                title="Proyak Contact Updates Form">
              </iframe>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UpdatesSection;
