import styles from './styles.module.css';
import logo from './assets/logo.svg';
import { useApp } from '@renderer/stores/app-store';
import clsx from 'clsx';
import { useCallback } from 'react';
import { FlowPage } from '../FlowPage';
import { v4 } from 'uuid';
const Welcome = () => {
  const app = useApp();

  const addTabInitial = useCallback(() => {
    const id = v4();
    app.addTabInitial({
      id,
      content: <FlowPage id={id} />,
      recentlyCreated: true
    });
  }, [app]);

  return (
    <div className={styles.root}>
      <header>
        <button className={styles.logo} onClick={app.hideHome}>
          <img src={logo} alt="logo" />
        </button>
      </header>
      <main>
        <nav>
          <button className={clsx(styles.button, styles.accent)} onClick={addTabInitial}>
            <span>New File</span>
          </button>
          <button className={clsx(styles.button, styles.soft)}>
            <span>Open</span>
          </button>
        </nav>
      </main>
    </div>
  );
};

export default Welcome;
