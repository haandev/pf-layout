import clsx from 'clsx';
import logo from './assets/logo.svg';
import styles from './styles.module.css';
import { FC, useCallback } from 'react';
import { FlowPage } from '../FlowPage';
import { IPageProps } from '@renderer/components/application-layout/types';
import { useApp } from '../../stores/app-store';
import { useScene } from '@renderer/components/application-layout/stores/scene-store';
import { v4 } from 'uuid';
import CadPage from '../CadPage';
const Welcome: FC<IPageProps> = () => {
  const app = useApp();
  const scene = useScene();

  const addTabInitial = useCallback(() => {
    const id = v4();
    scene.addTabInitial({
      id,
      content: <CadPage id={id} />,
      recentlyCreated: true
    });
  }, [scene]);

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
