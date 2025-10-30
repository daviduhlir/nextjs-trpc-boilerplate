import styled from 'styled-components';
import { trpc } from '@/utils/trpc';
import { Container, Button } from '@/components';

const PageWrapper = styled.div`
  padding: ${(props) => props.theme.spacing.xl};
  min-height: 100vh;
`;

const Section = styled.section`
  margin-top: ${(props) => props.theme.spacing.xl};
  padding: ${(props) => props.theme.spacing.lg};
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: ${(props) => props.theme.radius.lg};
  background-color: ${(props) => props.theme.colors.lightGray};
`;

const Status = styled.p`
  margin-top: ${(props) => props.theme.spacing.md};
  color: ${(props) => props.theme.colors.textSecondary};
  font-size: ${(props) => props.theme.fonts.size.sm};
`;

const Result = styled.p`
  margin-top: ${(props) => props.theme.spacing.md};
  color: ${(props) => props.theme.colors.success};
  font-weight: ${(props) => props.theme.fonts.weight.semibold};
`;

/**
 * Home page component
 * Demonstrates tRPC client-side usage with styled-components
 */
export default function Home() {
  const helloQuery = trpc.example.hello.useQuery({ name: 'NextJS' });
  const addMutation = trpc.example.add.useMutation();

  return (
    <PageWrapper>
      <Container>
        <h1>Next.js + tRPC + Styled Components</h1>

        <Section>
          <h2>Query Example</h2>
          {helloQuery.isPending && <Status>Loading...</Status>}
          {helloQuery.isError && <Status>Error: {helloQuery.error?.message}</Status>}
          {helloQuery.data && <Result>{helloQuery.data.message}</Result>}
        </Section>

        <Section>
          <h2>Mutation Example</h2>
          <Button
            onClick={() => addMutation.mutate({ a: 5, b: 3 })}
            disabled={addMutation.isPending}
            $variant="primary"
          >
            Add 5 + 3
          </Button>
          {addMutation.isPending && <Status>Computing...</Status>}
          {addMutation.data && <Result>Result: {addMutation.data.result}</Result>}
        </Section>
      </Container>
    </PageWrapper>
  );
}

export async function getStaticProps() {
  return {
    props: {},
    revalidate: 60,
  };
}
