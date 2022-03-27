import powerbi from 'powerbi-visuals-api';
import DataViewObjects = powerbi.DataViewObjects;
import { dataViewObjects } from 'powerbi-visuals-utils-dataviewutils';

type GetEnumObjectsValue<T> = (objects: DataViewObjects) => T;

export type Panel = '1' | '2' | '3' | '4' | '5';
export type YAxisAlign = 'left' | 'right';
export type YAxisInverse = boolean;
export type YAxisMinMax = {
    override: boolean;
    min: number;
    max: number;
};
export type Color = string;
export type IsArea = boolean;
export type ValueFormat = 'raw' | 'percentage' | 'thousand' | 'million';

export const getPanel: GetEnumObjectsValue<Panel> = (
    objects: DataViewObjects,
) => {
    const value = dataViewObjects.getValue<Panel>(objects, {
        objectName: 'panel',
        propertyName: 'panel',
    });
    return objects && value ? value : '1';
};

export const getYAxisAlign: GetEnumObjectsValue<YAxisAlign> = (
    objects: DataViewObjects,
) => {
    const value = dataViewObjects.getValue<YAxisAlign>(objects, {
        objectName: 'yAxisAlign',
        propertyName: 'yAxisAlign',
    });
    return objects && value ? value : 'left';
};

export const getYAxisInverse: GetEnumObjectsValue<YAxisInverse> = (
    objects: DataViewObjects,
) => {
    const value = dataViewObjects.getValue<YAxisInverse>(objects, {
        objectName: 'yAxisInverse',
        propertyName: 'yAxisInverse',
    });
    return objects && value ? value : false;
};

export const getYAxisMinMax: GetEnumObjectsValue<YAxisMinMax> = (
    objects: DataViewObjects,
) => {
    const defaultOptions = [
        ['override', false],
        ['min', 0],
        ['max', 100],
    ];
    const options = defaultOptions.map(
        ([propertyName, default_]: [string, any]) => [
            propertyName,
            dataViewObjects.getValue(objects, {
                objectName: 'yAxisMinMax',
                propertyName,
            }) || default_,
        ],
    );
    return objects
        ? Object.fromEntries(options)
        : Object.fromEntries(defaultOptions);
};

export const getColor: GetEnumObjectsValue<Color> = (
    objects: DataViewObjects,
) => {
    const value = dataViewObjects.getFillColor(objects, {
        objectName: 'color',
        propertyName: 'color',
    });
    return objects && value ? value : '#333333';
};

export const getIsArea: GetEnumObjectsValue<IsArea> = (
    objects: DataViewObjects,
) => {
    const value = dataViewObjects.getValue<IsArea>(objects, {
        objectName: 'isArea',
        propertyName: 'isArea',
    });
    return objects && value ? value : false;
};
