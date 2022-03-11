import { dataViewObjectsParser } from 'powerbi-visuals-utils-dataviewutils';
import DataViewObjectsParser = dataViewObjectsParser.DataViewObjectsParser;
export declare class PanelSettings {
    left1Color: string;
    left2Color: string;
    right1Color: string;
    right2Color: string;
}
export declare class VisualSettings extends DataViewObjectsParser {
    panel1: PanelSettings;
    panel2: PanelSettings;
}
