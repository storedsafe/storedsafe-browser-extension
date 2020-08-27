import Logger from "../../../utils/Logger";

import { logger as contentLogger } from '../../content_script'
export const logger = new Logger('Inject', contentLogger)