import { FrcDashboard } from '@frc-web-components/dashboard';
import { field3dConfig } from './field';

export default function addField3dElements(dashboard: FrcDashboard): void {
  console.log('loading field');
  dashboard.addElements(
    {
      'fwc-field-three': field3dConfig,
    },
    'Sources'
  );
}
