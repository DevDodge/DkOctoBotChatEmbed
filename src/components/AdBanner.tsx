import { createSignal, onMount, onCleanup, Show } from 'solid-js';

type AdBannerProps = {
    adConfig?: {
        adText?: string | string[]; // Supports Spintax (Pipe separated string or Array)
        adImage?: string;
        adLink?: string;
        showBadge?: boolean;
    };
    textColor?: string;
};

export const AdBanner = (props: AdBannerProps) => {
    const [currentText, setCurrentText] = createSignal('');
    const [displayText, setDisplayText] = createSignal('');
    const [isTyping, setIsTyping] = createSignal(true);

    const parseSpintax = (text: string | string[]) => {
        if (Array.isArray(text)) return text;
        if (!text) return [];
        // Basic pipe separation if string, e.g. "Hello|Hi|Welcome"
        return text.split('|');
    };

    const adTexts = () => parseSpintax(props.adConfig?.adText || '');

    // Typewriter Logic
    let typeWriterTimeout: any;
    let textIndex = 0;

    // Cycle through spintax options
    let spinIndex = 0;

    const startTyping = (text: string) => {
        setIsTyping(true);
        setDisplayText('');
        let charIndex = 0;

        const typeChar = () => {
            if (charIndex < text.length) {
                setDisplayText((prev) => prev + text.charAt(charIndex));
                charIndex++;
                typeWriterTimeout = setTimeout(typeChar, 50 + Math.random() * 50); // Handwriting randomness
            } else {
                setIsTyping(false);
                // Wait and then switch text if multiple options exist
                if (adTexts().length > 1) {
                    setTimeout(() => {
                        spinIndex = (spinIndex + 1) % adTexts().length;
                        startTyping(adTexts()[spinIndex]);
                    }, 5000); // Show for 5 seconds
                }
            }
        };
        typeChar();
    };

    onMount(() => {
        const texts = adTexts();
        if (texts.length > 0) {
            startTyping(texts[0]);
        }
    });

    onCleanup(() => {
        clearTimeout(typeWriterTimeout);
    });

    return (
        <div style={{
            display: 'flex',
            'flex-direction': 'column',
            'align-items': 'center',
            'justify-content': 'center',
            'background': 'rgba(255, 255, 255, 0.05)',
            'backdrop-filter': 'blur(5px)',
            'padding': '10px',
            'border-radius': '8px',
            'margin': '10px 0',
            'border': '1px solid rgba(255, 255, 255, 0.1)',
            'width': '95%',
            'box-shadow': '0 4px 6px rgba(0,0,0,0.1)'
        }}>
            <Show when={props.adConfig?.showBadge}>
                <span class="pulse-badge" style={{
                    'font-size': '10px',
                    'text-transform': 'uppercase',
                    'letter-spacing': '1px',
                    'background': 'linear-gradient(90deg, #E91E63, #ff6b6b)',
                    'color': 'white',
                    'padding': '2px 8px',
                    'border-radius': '12px',
                    'margin-bottom': '5px',
                    'font-weight': 'bold',
                    'box-shadow': '0 0 10px rgba(233, 30, 99, 0.5)'
                }}>
                    Sponsored
                </span>
            </Show>

            <a href={props.adConfig?.adLink || '#'} target="_blank" rel="noopener noreferrer" style={{
                'text-decoration': 'none',
                'display': 'flex',
                'align-items': 'center',
                'flex-direction': 'column',
                'gap': '8px'
            }}>
                <Show when={props.adConfig?.adImage}>
                    <img src={props.adConfig?.adImage} alt="Ad" style={{
                        'width': '100%',
                        'max-height': '150px',
                        'object-fit': 'cover',
                        'border-radius': '6px'
                    }} />
                </Show>

                <span style={{
                    'color': props.textColor || '#ffffff',
                    'font-family': "'Caveat', cursive, sans-serif", // Handwriting font preferred
                    'font-size': '16px',
                    'text-align': 'center',
                    'min-height': '24px'
                }}>
                    {displayText()}
                    <span class="blinking-cursor" style={{ 'opacity': isTyping() ? 1 : 0 }}>|</span>
                </span>
            </a>

            <style>{`
                @keyframes pulse-badge-anim {
                    0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(233, 30, 99, 0.7); }
                    70% { transform: scale(1.05); box-shadow: 0 0 0 6px rgba(233, 30, 99, 0); }
                    100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(233, 30, 99, 0); }
                }
                .pulse-badge {
                    animation: pulse-badge-anim 2s infinite;
                }
                .blinking-cursor {
                    animation: blink 1s step-end infinite;
                }
                @keyframes blink { 50% { opacity: 0; } }
            `}</style>
        </div>
    );
};
