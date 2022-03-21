import { dataViewObjectsParser } from 'powerbi-visuals-utils-dataviewutils';
import DataViewObjectsParser = dataViewObjectsParser.DataViewObjectsParser;

export class DataPointSettings {
    public dataPoint: boolean = false;
}

export class VisualSettings extends DataViewObjectsParser {
    public dataPoint: DataPointSettings = new DataPointSettings();
}
