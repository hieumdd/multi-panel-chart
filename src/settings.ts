'use strict';

import { dataViewObjectsParser } from 'powerbi-visuals-utils-dataviewutils';
import DataViewObjectsParser = dataViewObjectsParser.DataViewObjectsParser;

export class PanelSettings {
    public left1Color: string = '#991b1b';
    public left1Area: boolean = false;
    public left2Color: string = '#991b1b';
    public left2Area: boolean = false;
    public right1Color: string = '#991b1b';
    public right1Area: boolean = false;
    public right2Color: string = '#991b1b';
    public right2Area: boolean = false;
}

export class VisualSettings extends DataViewObjectsParser {
    public panel1: PanelSettings = new PanelSettings();
    public panel2: PanelSettings = new PanelSettings();
}
