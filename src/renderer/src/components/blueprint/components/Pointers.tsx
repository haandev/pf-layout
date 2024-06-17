import styles from './Pointers.module.css';
import { useBlueprint } from '../store';

const Pointers = ({}: {}) => {
  const view = useBlueprint((store) => store.view);

  const x = view.cursor[0],
    y = view.cursor[1];

  return (
    <svg className={styles.pointers} xmlns="http://www.w3.org/2000/svg">
      <g>
        <line className={styles.line} id="x" x1={x} y1="0" x2={x} y2="100%"></line>
        <line className={styles.line} id="y" x1="0" y1={y} x2="100%" y2={y}></line>
      </g>
    </svg>
  );
};

export default Pointers;
