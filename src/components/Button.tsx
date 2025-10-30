import styled from 'styled-components';

interface ButtonProps {
  $variant?: 'primary' | 'secondary' | 'danger';
  $size?: 'sm' | 'md' | 'lg';
  $fullWidth?: boolean;
}

/**
 * Styled Button component
 * Usage:
 *   <Button>Click me</Button>
 *   <Button $variant="primary" $size="lg">Primary Large</Button>
 *   <Button $variant="danger" $fullWidth>Delete</Button>
 */
export const Button = styled.button<ButtonProps>`
  padding: ${(props) =>
    props.$size === 'sm'
      ? `${props.theme.spacing.sm} ${props.theme.spacing.md}`
      : props.$size === 'lg'
        ? `${props.theme.spacing.lg} ${props.theme.spacing.xl}`
        : `${props.theme.spacing.md} ${props.theme.spacing.lg}`};

  font-size: ${(props) =>
    props.$size === 'sm'
      ? props.theme.fonts.size.sm
      : props.$size === 'lg'
        ? props.theme.fonts.size.lg
        : props.theme.fonts.size.base};

  font-weight: ${(props) => props.theme.fonts.weight.semibold};

  border-radius: ${(props) => props.theme.radius.md};
  border: 2px solid transparent;

  transition: all ${(props) => props.theme.transitions.base};

  width: ${(props) => (props.$fullWidth ? '100%' : 'auto')};

  /* Variants */
  ${(props) => {
    switch (props.$variant) {
      case 'secondary':
        return `
          background-color: ${props.theme.colors.secondaryLight};
          color: ${props.theme.colors.secondary};
          border-color: ${props.theme.colors.border};

          &:hover {
            background-color: ${props.theme.colors.border};
            color: ${props.theme.colors.secondaryDark};
          }

          &:active {
            transform: scale(0.98);
          }

          &:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
        `;
      case 'danger':
        return `
          background-color: ${props.theme.colors.error};
          color: ${props.theme.colors.white};

          &:hover {
            background-color: ${props.theme.colors.error};
            opacity: 0.9;
            box-shadow: ${props.theme.shadows.md};
          }

          &:active {
            transform: scale(0.98);
          }

          &:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
        `;
      case 'primary':
      default:
        return `
          background-color: ${props.theme.colors.primary};
          color: ${props.theme.colors.white};

          &:hover {
            background-color: ${props.theme.colors.primaryDark};
            box-shadow: ${props.theme.shadows.md};
          }

          &:active {
            transform: scale(0.98);
          }

          &:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
        `;
    }
  }}
`;
