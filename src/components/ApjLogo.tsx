interface ApjLogoProps {
  className?: string;
  withFrame?: boolean;
}

export const APJ_LOGO_SRC = '/assets/aistudio/Copilot_20260721_192856_22039296.png';
export const APJ_SAMPLE_CERT_SRC = '/assets/aistudio/APJ_Tech_Certificate_of_Completion_5239fd60.png';

export function ApjLogo({ className = 'h-11 w-11', withFrame = true }: ApjLogoProps) {
  return (
    <img
      src={APJ_LOGO_SRC}
      alt="APJ Tech Official Logo"
      referrerPolicy="no-referrer"
      className={`${className} aspect-square object-contain shrink-0 ${
        withFrame ? 'rounded-full bg-white p-0.5' : ''
      }`}
    />
  );
}
