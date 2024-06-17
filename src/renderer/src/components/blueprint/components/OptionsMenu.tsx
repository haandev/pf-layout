/**
 * @className OptionsMenu
 */

import styles from './OptionsMenu.module.css';
import { useTranslation } from 'react-i18next';
import { useBlueprint } from '../store';
import { getNaturalSize } from '../geometry';
import { BlueprintStore } from '../store/state';

const OptionsMenu = () => {
  const { options, view, content, ...blueprint } = useBlueprint<BlueprintStore>();

  const { t, i18n } = useTranslation();

  const modelSize = content.measurement ? getNaturalSize(content.measurement) : ['?', '?'];
  const zoomString = view.scale.toLocaleString(i18n.language, { style: 'percent' });
  const arePathFeaturesTogglable = content.measurement !== null;
  const numberOpt = { maximumFractionDigits: 2 };
  const xUnitScale = modelSize[0].toLocaleString(i18n.language, numberOpt);
  const yUnitScale = modelSize[1].toLocaleString(i18n.language, numberOpt);

  return (
    <div className={`${styles.optionsMenu} noselect`}>
      <div
        className={styles.measurement}
      >{`${xUnitScale} x ${yUnitScale} ${options.unitString || t('OptionsMenu.units')}`}</div>
      <div className={styles.viewControls}>
        <div>
          {' '}
          <label>
            <input
              type="checkbox"
              checked={options.fitOnScreen}
              onChange={() => blueprint.toggleFitScreen()}
              disabled={!arePathFeaturesTogglable}
            />
            {t('OptionsMenu.fitOnScreen').toLocaleLowerCase()} <span className={styles.zoomUnit}>[{zoomString}]</span>
          </label>
        </div>
        <div>
          <label>
            <input type="checkbox" checked={options.showGrid} onChange={() => blueprint.toggleGrid()} />
            {t('OptionsMenu.showGrid').toLocaleLowerCase()}
          </label>
        </div>
        <div>
          <label>
            <input
              type="checkbox"
              checked={options.showPathNames}
              onChange={() => blueprint.togglePathNames()}
              disabled={!arePathFeaturesTogglable}
            />
            {t('OptionsMenu.showPathNames').toLocaleLowerCase()}
          </label>
        </div>
        <div>
          <label>
            <input
              type="checkbox"
              checked={options.showPathFlow}
              onChange={() => blueprint.togglePathFlow()}
              disabled={!arePathFeaturesTogglable}
            />
            {t('OptionsMenu.showPathFlow').toLocaleLowerCase()}
          </label>
        </div>
      </div>
    </div>
  );
};

export default OptionsMenu;
