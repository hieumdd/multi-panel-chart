import { dataViewObjectsParser } from 'powerbi-visuals-utils-dataviewutils';
import DataViewObjectsParser = dataViewObjectsParser.DataViewObjectsParser;

export class LegendSettings {
    public fontSize: number = 12;
}

export class AxisSettings {
    public fontSize: number = 12;
}

export class TooltipSettings {
    public fontSize: number = 12;
}

export class DataPointSettings {
    public dataPoint: boolean = false;
}

export class VisualSettings extends DataViewObjectsParser {
    public legend: LegendSettings = new LegendSettings();
    public axis: AxisSettings = new AxisSettings();
    public tooltip: TooltipSettings = new TooltipSettings();
    public dataPoint: DataPointSettings = new DataPointSettings();
}
