import { trpc } from '@/utils/trpc';

/**
 * Home page component
 * Demonstrates tRPC client-side usage
 */
export default function Home() {
  const helloQuery = trpc.example.hello.useQuery({ name: 'NextJS' });
  const addMutation = trpc.example.add.useMutation();

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Next.js + tRPC Boilerplate</h1>

      <section style={{ marginTop: '1rem' }}>
        <h2>Query Example</h2>
        {helloQuery.isPending && <p>Loading...</p>}
        {helloQuery.isError && <p>Error: {helloQuery.error?.message}</p>}
        {helloQuery.data && <p>{helloQuery.data.message}</p>}
      </section>

      <section style={{ marginTop: '1rem' }}>
        <h2>Mutation Example</h2>
        <button
          onClick={() => addMutation.mutate({ a: 5, b: 3 })}
          disabled={addMutation.isPending}
        >
          Add 5 + 3
        </button>
        {addMutation.isPending && <p>Computing...</p>}
        {addMutation.data && <p>Result: {addMutation.data.result}</p>}
      </section>
    </div>
  );
}

export async function getStaticProps() {
  return {
    props: {},
    revalidate: 60,
  };
}
