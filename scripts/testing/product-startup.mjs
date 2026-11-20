import { channel } from 'node:diagnostics_channel';

channel('ideeo.product.startup').subscribe(phase=>process.send(phase));
process.send('preload');
