import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { PAGES } from './pages';
import './site/site.css';

// Each website HTML file sets <div id="root" data-page="...">. In a production build the HTML is
// already rendered (see scripts/prerender.mjs), so React takes it over; in dev it renders fresh.
const root = document.getElementById('root')!;
const { Component } = PAGES[root.dataset.page || 'home'];
const tree = <StrictMode><Component /></StrictMode>;
if (root.firstElementChild) hydrateRoot(root, tree);
else createRoot(root).render(tree);
