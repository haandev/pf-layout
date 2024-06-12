import './assets/main.css';

import React, { FC } from 'react';
import ReactDOM from 'react-dom/client';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import App from './App';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const AppRouter: FC = () => {
  return (
    <MemoryRouter>
      <Routes>
        <Route path="*" element={<DndProvider backend={HTML5Backend} children={<App />} />}></Route>
      </Routes>
    </MemoryRouter>
  );
};

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <AppRouter />
  </React.StrictMode>
);
