import React from 'react';

export default function Extension(props) {
  const path = window.location.href.split('#')[1];
  const breadcrumbs = path.split('/');

  const breadcrumbsLi = breadcrumbs.map(crumb => {
    return <li key={crumb.toLowerCase()}>{crumb}</li>;
  });

  return (
    <main>
      <p>Path</p>
      <ul>{breadcrumbsLi}</ul>
    </main>
  );
}
