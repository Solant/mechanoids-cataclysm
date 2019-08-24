import Stage from 'telegraf/stage';

import introduction from './introduction';
import location from './location';

export default new Stage([...introduction, ...location]);
