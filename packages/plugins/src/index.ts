import { FrcDashboard } from '@frc-web-components/dashboard';
import addDashboardComponentsPlugin from './dashboard-components';
import addFrcPlugin from './frc';
import addFrcSimPlugin from './frc-sim';
import addVaadinElementsPlugin from './vaadin-elements';
import addWiredElementsPlugin from './wired-elements';
import addTutorialPlugin from './tutorial';
import addSourceElementsPlugin from './source-elements';
import addField3dElementsPlugin from './field3d';

export default function addPlugins(dashboard: FrcDashboard): void {
  addDashboardComponentsPlugin(dashboard);
  addFrcPlugin(dashboard);
  addFrcSimPlugin(dashboard);
  addVaadinElementsPlugin(dashboard);
  addWiredElementsPlugin(dashboard);
  addTutorialPlugin(dashboard);
  addSourceElementsPlugin(dashboard);
  addField3dElementsPlugin(dashboard);
}

export const addDashboardComponents = addDashboardComponentsPlugin;
export const addFrc = addFrcPlugin;
export const addFrcSim = addFrcSimPlugin;
export const addVaadinElements = addVaadinElementsPlugin;
export const addWiredElements = addWiredElementsPlugin;
export const addTutorial = addTutorialPlugin;
export const addSourceElements = addSourceElementsPlugin;
export const addField3dElements = addField3dElementsPlugin;
