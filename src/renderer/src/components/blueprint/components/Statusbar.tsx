import styles from './Statusbar.module.css';
import { useTranslation } from 'react-i18next';
import { useBlueprint } from '../store';
import { getCursorCoordinates } from '../geometry';

function Statusbar() {
  const { i18n } = useTranslation();
  const view = useBlueprint((store) => store.view);
  const options = useBlueprint((store) => store.options);

  const viewWidth = view.viewSize[0] / view.scale;
  var detail = 0;

  while (viewWidth && viewWidth < Math.pow(10, -(detail - 2))) detail++;
  const numberOptions = {
    maximumFractionDigits: detail,
    minimumFractionDigits: detail
  };
  const coo = getCursorCoordinates(view);
  const x = coo[0].toLocaleString(i18n.language, numberOptions);
  const ySign = options.yDirection == 'naturalUp' ? -1 : 1;
  const y = (ySign * coo[1]).toLocaleString(i18n.language, numberOptions);

  return (
    <div className={styles.statusbar}>
      {`x: ${x}, y: ${y} | zoom: ${view.scale.toLocaleString(i18n.language, { style: 'percent' })}`}
    </div>
  );
}

export default Statusbar;
