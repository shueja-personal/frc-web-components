import { FrcDashboard } from '@frc-web-components/dashboard';
import addDashboardComponentsPlugin from './dashboard-components';
import addFrcPlugin from './frc';
import addFrcSimPlugin from './frc-sim';
import addFormElementsPlugin from './form-and-input-elements';
import addTutorialPlugin from './tutorial';
import addSourceElementsPlugin from './source-elements';
import addField3dElementsPlugin from './field3d';

export default function addPlugins(dashboard: FrcDashboard): void {
  addDashboardComponentsPlugin(dashboard);
  addFrcPlugin(dashboard);
  addFrcSimPlugin(dashboard);
  addFormElementsPlugin(dashboard);
  addTutorialPlugin();
  addSourceElementsPlugin(dashboard);
  addField3dElementsPlugin(dashboard);
}

export const addDashboardComponents = addDashboardComponentsPlugin;
export const addFrc = addFrcPlugin;
export const addFrcSim = addFrcSimPlugin;
export const addFormElements = addFormElementsPlugin;
export const addTutorial = addTutorialPlugin;
export const addSourceElements = addSourceElementsPlugin;
export const addField3dElements = addField3dElementsPlugin;
