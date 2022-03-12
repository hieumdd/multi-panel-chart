import powerbi from 'powerbi-visuals-api';
import DataViewObjects = powerbi.DataViewObjects;
import { dataViewObjects } from 'powerbi-visuals-utils-dataviewutils';

type GetEnumObjectsValue<T> = (objects: DataViewObjects) => T;

const getPanel: GetEnumObjectsValue<string> = (objects: DataViewObjects) => {
    const value = dataViewObjects.getValue<string>(objects, {
        objectName: 'panel',
        propertyName: 'panel',
    });
    return objects && value ? value : '1';
};

const getYAxis: GetEnumObjectsValue<string> = (objects: DataViewObjects) => {
    const value = dataViewObjects.getValue<string>(objects, {
        objectName: 'yAxisAlign',
        propertyName: 'yAxisAlign',
    });
    return objects && value ? value : 'left';
};

const getColor: GetEnumObjectsValue<string> = (objects: DataViewObjects) => {
    const value = dataViewObjects.getFillColor(objects, {
        objectName: 'color',
        propertyName: 'color',
    });
    return objects && value ? value : '#000000';
};

const getIsArea: GetEnumObjectsValue<boolean> = (objects: DataViewObjects) => {
    const value = dataViewObjects.getValue<boolean>(objects, {
        objectName: 'isArea',
        propertyName: 'isArea',
    });
    return objects && value ? value : false;
};

export { getPanel, getYAxis, getColor, getIsArea };
