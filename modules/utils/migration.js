import { NAME } from "../butler.js";
import { EnhancedConditions } from "../enhanced-conditions/enhanced-conditions.js";

export default class MigrationHelper {
    static async _onReady() {
        const cubVersion = game.modules.get(NAME)?.version;

        await EnhancedConditions._migrationHelper(cubVersion);
    }
}