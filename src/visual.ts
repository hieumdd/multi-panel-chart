'use strict';

import './../style/visual.less';
import powerbi from 'powerbi-visuals-api';
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
import DataView = powerbi.DataView;
import DataViewObjects = powerbi.DataViewObjects;
import DataViewMetadata = powerbi.DataViewMetadata;

// Formatting Options
import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;
import VisualObjectInstanceEnumeration = powerbi.VisualObjectInstanceEnumeration;
import VisualObjectInstance = powerbi.VisualObjectInstance;

import { groupBy, zip, flattenDepth, isEmpty, min, max, round } from 'lodash-es';
import * as echarts from 'echarts';

import { VisualSettings } from './settings';
import getTooltip from './components/tooltip';
import legend from './components/legend';
import axisPointer from './components/axisPointer';
import {
    Panel,
    YAxis,
    Color,
    IsArea,
    ValueFormat,
    getPanel,
    getYAxis,
    getColor,
    getIsArea,
    getValueFormat,
} from './enumObjects';
import formatter from './components/formatter';

type Data = {
    id: string;
    date: Date;
    key: string;
    value: number;
    panelId: Panel;
    yAxisId: YAxis;
    color: Color;
    isArea: IsArea;
    valueFormatterOption: ValueFormat;
};

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
            panelId: getPanel(object),
            yAxisId: getYAxis(object),
            color: getColor(object),
            isArea: getIsArea(object),
            valueFormatterOption: getValueFormat(object),
        }));
    });

    return flattenDepth(matchedData, 1);
};

const buildOptions = (data: Data[]) => {
    const chain = '-';

    const groupData = (fn: (d: Data) => string | number) => groupBy(data, fn);
    const panelData = groupData(({ panelId }) => panelId);
    const axisData = groupData(({ panelId, yAxisId }) =>
        [panelId, yAxisId].join(chain),
    );
    const seriesData = groupData(
        ({ panelId, yAxisId, key, color, isArea, valueFormatterOption }) =>
            [panelId, yAxisId, key, color, isArea, valueFormatterOption].join(
                chain,
            ),
    );

    const grid = Object.entries(panelData).map(([id], i, arr) => ({
        id,
        top: `${i * (100 / arr.length) + 5}%`,
        height: `${(100 / arr.length) * 0.8}%`,
        right: '25%',
    }));

    const xAxis = Object.entries(panelData).map(([id]) => ({
        type: 'time',
        id,
        gridId: id,
    }));

    const yAxis = Object.entries(axisData).map(([id, data]) => {
        const [panelId, yAxisId] = id.split(chain);
        const cleanedData = data
            .map(({ value }) => value)
            .filter((x) => x === 0 || !!x);
        return {
            type: 'value',
            alignTick: true,
            gridId: panelId,
            id: `${panelId}-${yAxisId}`,
            min: min(cleanedData) * 0.99,
            max: max(cleanedData) * 1.01,
            position: yAxisId,
            axisLabel: { formatter: round },
        };
    });

    const series = Object.entries(seriesData).map(([id, data]) => {
        const [panelId, yAxisId, key, color, isArea] = id.split(chain);
        return {
            type: 'line',
            name: `${panelId} - ${key}`,
            xAxisId: panelId,
            yAxisId: `${panelId}-${yAxisId}`,
            data: data.map(({ date, value }) => [date, value]),
            lineStyle: { color },
            itemStyle: { color },
            areaStyle: JSON.parse(isArea) ? { color } : null,
        };
    });

    const valueFormatters = Object.entries(seriesData).map(
        ([id]) => formatter[id.split(chain).slice(-1).pop()],
    );

    return {
        legend,
        tooltip: getTooltip(valueFormatters),
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
    private data: Data[];
    private chart: echarts.ECharts;

    constructor(options: VisualConstructorOptions) {
        this.target = options.element;
        this.chart = echarts.init(this.target);
    }

    public update(options: VisualUpdateOptions) {
        this.settings = VisualSettings.parse<VisualSettings>(
            options && options.dataViews && options.dataViews[0],
        );

        this.dataView = options.dataViews[0];
        this.metadata = this.dataView.metadata;

        this.data = mapDataView(this.dataView);
        console.log(this.data);

        if (isEmpty(this.data)) {
            return
        }
        
        const chartOptions = buildOptions(this.data);
        console.log(chartOptions);

        this.chart.resize();
        this.chart.setOption(chartOptions, true, true);
    }

    public enumerateObjectInstances(
        options: EnumerateVisualObjectInstancesOptions,
    ): VisualObjectInstanceEnumeration {
        const { objectName } = options;

        if (!this.settings || !this.data) {
            return [];
        }

        const pushObjectEnum = (
            propertiesFn: (
                DataViewObjects,
            ) => VisualObjectInstance['properties'],
        ): VisualObjectInstanceEnumeration =>
            zip(
                this.metadata.columns.slice(1),
                Object.entries(groupBy(this.data, ({ key }) => key)),
            ).map(([{ queryName, objects }, [key]]) => ({
                objectName,
                displayName: key,
                properties: propertiesFn(objects),
                selector: {
                    metadata: queryName,
                },
            }));

        switch (objectName) {
            case 'panel':
                return pushObjectEnum((objects) => ({
                    panel: getPanel(objects),
                }));
            case 'yAxisAlign':
                return pushObjectEnum((objects) => ({
                    yAxisAlign: getYAxis(objects),
                }));
            case 'color':
                return pushObjectEnum((objects) => ({
                    color: {
                        solid: {
                            color: getColor(objects),
                        },
                    },
                }));
            case 'isArea':
                return pushObjectEnum((objects) => ({
                    isArea: getIsArea(objects),
                }));
            case 'valueFormat':
                return pushObjectEnum((objects) => ({
                    valueFormat: getValueFormat(objects),
                }));
        }
        return [];
    }
}
