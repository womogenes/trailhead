import { useRouter } from 'next/router';

const TrailPage = () => {
  const router = useRouter();
  const { trailId } = router.query;

  return (
    <div>
      <h1>Trail ID: {trailId}</h1>
    </div>
  );
};

export default TrailPage;
