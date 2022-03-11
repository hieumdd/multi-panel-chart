'use strict';

import './../style/visual.less';
import powerbi from 'powerbi-visuals-api';
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
import IVisualHost = powerbi.extensibility.visual.IVisualHost;
import DataView = powerbi.DataView;
import DataViewObjects = powerbi.DataViewObjects;
import DataViewMetadata = powerbi.DataViewMetadata;

// Formatting Options
import VisualObjectInstance = powerbi.VisualObjectInstance;
import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;
import VisualObjectInstanceEnumeration = powerbi.VisualObjectInstanceEnumeration;
import VisualEnumerationInstanceKinds = powerbi.VisualEnumerationInstanceKinds;
import { VisualSettings } from './settings';

import { ColorHelper } from 'powerbi-visuals-utils-colorutils';

import { groupBy, zip, flattenDepth, min, max, round } from 'lodash-es';
import * as echarts from 'echarts';

import tooltip from './components/tooltip';
import legend from './components/legend';
import axisPointer from './components/axisPointer';
import { dataViewObjects } from 'powerbi-visuals-utils-dataviewutils';

type Data = {
    id: string;
    panelId: string;
    yAxisId: string;
    seriesIndexId: string;
    date: Date;
    key: string;
    value: number;
    color: string;
};

const chain = '-';

const getColor = (objects: DataViewObjects) =>
    objects
        ? dataViewObjects.getFillColor(objects, {
              objectName: 'color',
              propertyName: 'color',
          })
        : '#000000';

const mapDataView = (dataView: DataView): Data[] => {
    const { columns, rows } = dataView.table;

    const dateValues = <string[]>rows.map((row) => row[0]);

    const dataObjects = dataView.metadata.columns
        .slice(1)
        .map(({ objects }) => objects);

    const dataValues = rows
        .map((row) => <number[]>row.slice(1))
        .map((row) =>
            zip(
                columns
                    .slice(1)
                    .map((column) => [
                        Object.keys(column.roles)[0],
                        column.displayName,
                    ]),
                row,
            ).map(([[id, key], value]) => ({ id, key, value })),
        );

    const matchedData = zip(dateValues, dataValues).map(([date, values]) => {
        return zip(values, dataObjects).map(([value, object]) => ({
            ...value,
            date: new Date(date),
            color: getColor(object),
        }));
    });

    return flattenDepth(matchedData, 1).map((d) => {
        const [panelId, yAxisId, seriesIndexId] = d.id.split(chain);
        return {
            ...d,
            panelId,
            yAxisId,
            seriesIndexId,
        };
    });
};

const buildOptions = (data: Data[]) => {
    const groupData = (fn: (d: Data) => string | number) => groupBy(data, fn);
    const panelData = groupData(({ panelId }) => panelId);
    const axisData = groupData(({ panelId, yAxisId }) =>
        [panelId, yAxisId].join(chain),
    );
    const seriesData = groupData(({ panelId, yAxisId, key }) =>
        [panelId, yAxisId, key].join(chain),
    );

    const grid = Object.entries(panelData).map(([id], i, arr) => ({
        id,
        top: `${i * (100 / arr.length) + 5}%`,
        height: `${(100 / arr.length) * 0.6}%`,
        right: '25%',
    }));

    const xAxis = Object.entries(panelData).map(([id]) => ({
        type: 'time',
        id,
        gridId: id,
    }));

    const yAxis = Object.entries(axisData).map(([id, data]) => {
        const [gridId, y_axis] = id.split(chain);
        const cleanedData = data
            .map(({ value }) => value)
            .filter((x) => x === 0 || !!x);
        return {
            type: 'value',
            alignTick: true,
            gridId,
            id,
            min: min(cleanedData) * 0.99,
            max: max(cleanedData) * 1.01,
            position: y_axis.toLowerCase(),
            axisLabel: {
                formatter: round,
            },
        };
    });

    const series = Object.entries(seriesData).map(([id, seriesData]) => {
        const [xAxisId, yAxis, key] = id.split(chain);
        const color = seriesData.reduce((_, cur) => cur.color, '');
        return {
            type: 'line',
            name: `${xAxisId}-${key}`,
            xAxisId,
            yAxisId: `${xAxisId}-${yAxis}`,
            key,
            data: seriesData.map(({ date, value }) => [date, value]),
            lineStyle: { color },
            itemStyle: { color },
            // areaStyle: getSettingsMap('isArea', seriesIds) ? { color } : null,
        };
    });

    return {
        legend,
        tooltip,
        axisPointer,
        grid,
        xAxis,
        yAxis,
        series,
    };
};

export class Visual implements IVisual {
    private target: HTMLElement;
    private settings: VisualSettings;
    private metadata: DataViewMetadata;
    private dataView: DataView;
    private host: IVisualHost;
    private data: Data[];
    private chart: echarts.ECharts;

    constructor(options: VisualConstructorOptions) {
        this.target = options.element;
        this.host = options.host;
        this.chart = echarts.init(this.target);
    }

    public update(options: VisualUpdateOptions) {
        this.settings = VisualSettings.parse<VisualSettings>(
            options && options.dataViews && options.dataViews[0],
        );

        this.dataView = options.dataViews[0];
        this.metadata = this.dataView.metadata;

        this.data = mapDataView(this.dataView);
        const chartOptions = buildOptions(this.data);

        this.chart.resize();
        this.chart.setOption(chartOptions, true, true);
    }

    public enumerateObjectInstances(
        options: EnumerateVisualObjectInstancesOptions,
    ): VisualObjectInstanceEnumeration {
        let objectName = options.objectName;
        let objectEnumeration: VisualObjectInstance[] = [];

        if (!this.settings || !this.data) {
            return objectEnumeration;
        }

        switch (objectName) {
            case 'color':
                zip(
                    this.metadata.columns.slice(1),
                    Object.entries(groupBy(this.data, ({ key }) => key)),
                ).forEach(([{ queryName, objects }, [key]]) => {
                    objectEnumeration.push({
                        objectName,
                        displayName: key,
                        properties: {
                            color: {
                                solid: {
                                    color: getColor(objects),
                                },
                            },
                        },
                        propertyInstanceKind: {
                            color: VisualEnumerationInstanceKinds.Constant,
                        },
                        selector: {
                            metadata: queryName,
                        },
                    });
                });
                break;
        }
        return objectEnumeration;
    }
}
