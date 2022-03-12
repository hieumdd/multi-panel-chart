import powerbi from 'powerbi-visuals-api';
import DataViewObjects = powerbi.DataViewObjects;
import { dataViewObjects } from 'powerbi-visuals-utils-dataviewutils';


type GetEnumObjectsValue = (objects: DataViewObjects) => string;

const getPanel: GetEnumObjectsValue = (objects: DataViewObjects) => {
    const value = <string>dataViewObjects.getValue(objects, {
        objectName: 'panel',
        propertyName: 'panel',
    });
    return objects && value ? value : '1';
};

const getYAxis: GetEnumObjectsValue = (objects: DataViewObjects) => {
    const value = <string>dataViewObjects.getValue(objects, {
        objectName: 'yAxisAlign',
        propertyName: 'yAxisAlign',
    });
    return objects && value ? value : 'left';
};

const getColor: GetEnumObjectsValue = (objects: DataViewObjects) => {
    const value = dataViewObjects.getFillColor(objects, {
        objectName: 'color',
        propertyName: 'color',
    });
    return objects && value ? value : '#000000';
};

export { getPanel, getYAxis, getColor };
