import styled from 'styled-components';

interface ContainerProps {
  $maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

const widths = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
};

/**
 * Styled Container component
 * Responsive container with max-width
 * Usage:
 *   <Container $maxWidth="lg">
 *     <h1>Hello</h1>
 *   </Container>
 */
export const Container = styled.div<ContainerProps>`
  width: 100%;
  max-width: ${(props) => widths[props.$maxWidth || 'lg']};
  margin: 0 auto;
  padding-left: ${(props) => props.theme.spacing.lg};
  padding-right: ${(props) => props.theme.spacing.lg};

  @media (max-width: ${(props) => props.theme.breakpoints.tablet}) {
    padding-left: ${(props) => props.theme.spacing.md};
    padding-right: ${(props) => props.theme.spacing.md};
  }

  @media (max-width: ${(props) => props.theme.breakpoints.mobile}) {
    padding-left: ${(props) => props.theme.spacing.sm};
    padding-right: ${(props) => props.theme.spacing.sm};
  }
`;
