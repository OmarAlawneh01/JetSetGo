// هاد الـ imports بجيب الـ React وكل الـ dependencies اللي محتاجينها
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// هاد الـ root هو المكان اللي رح نحط فيه الـ React app
const root = ReactDOM.createRoot(document.getElementById('root'));

// هاد الـ render بيحط الـ App في الـ root
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
); 