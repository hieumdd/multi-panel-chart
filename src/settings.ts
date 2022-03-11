'use strict';

import { dataViewObjectsParser } from 'powerbi-visuals-utils-dataviewutils';
import DataViewObjectsParser = dataViewObjectsParser.DataViewObjectsParser;

export class ColorSettings {
    public color: string = '#991b1b';
}

export class AreaSettings {
    public area: boolean = false;
}

export class VisualSettings extends DataViewObjectsParser {
    public color: ColorSettings = new ColorSettings();
    public area: AreaSettings = new AreaSettings();
}
