import Stage from 'telegraf/stage';

import introduction from './introduction';
import location from './location';
import battle from './battle';

export default new Stage([...introduction, ...location, ...battle]);
