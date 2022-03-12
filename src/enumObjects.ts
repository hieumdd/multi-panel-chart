import powerbi from 'powerbi-visuals-api';
import DataViewObjects = powerbi.DataViewObjects;
import { dataViewObjects } from 'powerbi-visuals-utils-dataviewutils';

type GetEnumObjectsValue<T> = (objects: DataViewObjects) => T;

export type Panel = '1' | '2' | '3' | '4' | '5';
export type YAxis = 'left' | 'right';
export type Color = string;
export type IsArea = boolean;
export type ValueFormat = 'raw' | 'percentage' | 'thousand' | 'million';

export const getPanel: GetEnumObjectsValue<Panel> = (objects: DataViewObjects) => {
    const value = dataViewObjects.getValue<Panel>(objects, {
        objectName: 'panel',
        propertyName: 'panel',
    });
    return objects && value ? value : '1';
};

export const getYAxis: GetEnumObjectsValue<YAxis> = (objects: DataViewObjects) => {
    const value = dataViewObjects.getValue<YAxis>(objects, {
        objectName: 'yAxisAlign',
        propertyName: 'yAxisAlign',
    });
    return objects && value ? value : 'left';
};

export const getColor: GetEnumObjectsValue<Color> = (objects: DataViewObjects) => {
    const value = dataViewObjects.getFillColor(objects, {
        objectName: 'color',
        propertyName: 'color',
    });
    return objects && value ? value : '#000000';
};

export const getIsArea: GetEnumObjectsValue<IsArea> = (objects: DataViewObjects) => {
    const value = dataViewObjects.getValue<IsArea>(objects, {
        objectName: 'isArea',
        propertyName: 'isArea',
    });
    return objects && value ? value : false;
};

export const getValueFormat: GetEnumObjectsValue<ValueFormat> = (
    objects: DataViewObjects,
) => {
    const value = dataViewObjects.getValue<ValueFormat>(objects, {
        objectName: 'valueFormat',
        propertyName: 'valueFormat',
    });
    return objects && value ? value : 'raw';
};
