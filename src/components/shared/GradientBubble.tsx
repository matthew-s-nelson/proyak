interface GradientBubbleProps {
    children: React.ReactNode;
}

const GradientBubble: React.FC<GradientBubbleProps> = ({ children }) => {
    return (
        <span style={{
            display: 'inline-block',
            padding: '0.5rem 1.25rem',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            borderRadius: '9999px',
            fontSize: '0.875rem',
            fontWeight: '500'
        }}>
            {children}
        </span>
    )
}

export default GradientBubble;