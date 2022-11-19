import { FrcDashboard } from '@frc-web-components/dashboard';
import { field3dConfig } from './field';
import { field3dObjectConfig } from './field-object';

export default function addField3dElements(dashboard: FrcDashboard): void {
  console.log('loading field');
  dashboard.addElements(
    {
      'fwc-field-three': field3dConfig,
      'fwc-field-object-three': field3dObjectConfig,
    },
    'Sources'
  );
}
