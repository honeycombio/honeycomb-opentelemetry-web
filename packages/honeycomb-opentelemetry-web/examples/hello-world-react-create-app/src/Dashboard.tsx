// Dashboard.tsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { usePageViewSpan } from './PageViewSpanProvider';
import { context, trace } from '@opentelemetry/api';

export function Dashboard() {
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);

  const pageViewSpan = usePageViewSpan();

  useEffect(() => {
    if (!pageViewSpan) return;

    const spanCtx = trace.setSpan(context.active(), pageViewSpan);

    async function fetchWithTelemetry(
      input: string | URL | globalThis.Request,
      init?: RequestInit,
    ): Promise<Response> {
      const boundFetch = context.bind(spanCtx, async () => {
        return await fetch(input, init);
      });

      return boundFetch();
    }

    fetchWithTelemetry('https://jsonplaceholder.typicode.com/users')
      .then((res) => res.json())
      .then(setUsers);

    fetchWithTelemetry('https://jsonplaceholder.typicode.com/posts')
      .then((res) => res.json())
      .then(setPosts);

    fetchWithTelemetry('https://jsonplaceholder.typicode.com/comments')
      .then((res) => res.json())
      .then(setComments);
  }, [pageViewSpan]);

  return (
    <main>
      <h1>Dashboard</h1>
      <Link to="/">Home</Link>
      <p>
        Loaded {users.length} users, {posts.length} posts, {comments.length}{' '}
        comments.
      </p>
    </main>
  );
}
