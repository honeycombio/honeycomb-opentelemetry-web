import { createBrowserRouter, useParams } from 'react-router-dom';

function Hello({ name }: { name?: string }) {
  const params = useParams();
  const paramName = params['name'];
  return <h1>Hello {paramName ?? name}!</h1>;
}
export const router = createBrowserRouter([
  {
    path: '/',
    element: <Hello name="world" />,
  },
  {
    path: '/:name',
    element: <Hello />,
  },
]);
