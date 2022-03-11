'use strict';

import './../style/visual.less';
import powerbi from 'powerbi-visuals-api';
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
import DataView = powerbi.DataView;
import VisualObjectInstanceEnumerationObject = powerbi.VisualObjectInstanceEnumerationObject;

// Formatting Options
import VisualObjectInstance = powerbi.VisualObjectInstance;
import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;
import {
    dataRoleHelper,
    dataViewWildcard,
} from 'powerbi-visuals-utils-dataviewutils';
import VisualEnumerationInstanceKinds = powerbi.VisualEnumerationInstanceKinds;
import { VisualSettings } from './settings';

import * as echarts from 'echarts';

import { groupBy, zip, flattenDepth, min, max, round } from 'lodash-es';

type Data = {
    id: string;
    date: Date;
    panel: string;
    yAxisAlign: string;
    key: string;
    value: number;
};

const panelMap = {
    1: 'panel1',
    2: 'panel2',
};

const yAxisAlignMap = {
    color: {
        left: {
            1: 'left1Color',
            2: 'left2Color',
        },
        right: {
            1: 'right1Color',
            2: 'right2Color',
        },
    },
};

const chain = '-';

const mapDataView = (dataView: DataView, settings: VisualSettings): Data[] => {
    const { categories = [], values = [] } = dataView.categorical;

    const columnsData = [...categories, ...values].map(
        ({ source: { roles, displayName }, values }) => [
            Object.keys(roles)[0],
            displayName,
            values,
        ],
    );

    const dateColumn = columnsData[0];
    const dateValues = dateColumn[2];
    const dataColumn: Data[][] = columnsData
        .slice(1)
        .map(([id, key, data]: [id: string, key: string, data: number[]]) =>
            zip<Date, number>(dateValues, data).map(([date, value]) => {
                const [panel, yAxisAlign, _] = id.split('-');
                return { id, date, panel, yAxisAlign, key, value };
            }),
        );
    return flattenDepth<Data>(dataColumn, 1);
};

const buildOptions = (data: Data[], settings: VisualSettings) => {
    const groupData = (fn: (d: Data) => string | number) => groupBy(data, fn);
    const panelData = groupData(({ panel }) => panel);
    const axisData = groupData(({ panel, yAxisAlign }) =>
        [panel, yAxisAlign].join(chain),
    );
    const seriesData = groupData(({ panel, yAxisAlign, key }) =>
        [panel, yAxisAlign, key].join(chain),
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
        const [panelId, yAxisAlign, seriesAxisId] = seriesData
            .reduce((_, cur) => cur.id, '')
            .split(chain);
        const color =
            settings[panelMap[panelId]][
                yAxisAlignMap.color[yAxisAlign][seriesAxisId]
            ];
        return {
            type: 'line',
            name: `${xAxisId}-${key}`,
            xAxisId,
            yAxisId: `${xAxisId}-${yAxis}`,
            key,
            data: seriesData.map(({ date, value }) => [date, value]),
            lineStyle: { color },
            itemStyle: { color },
        };
    });

    return {
        title: {
            text: 'Testing',
        },
        legend: {
            orient: 'vertical',
            top: '5%',
            right: 'right',
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'cross',
                crossStyle: {
                    color: '#999',
                },
            },
            position: (pos, params, el, elRect, size) => ({
                top: '20%',
                [['left', 'right'][+(pos[0] < size.viewSize[0] / 2)]]: '10%',
            }),
            // formatter: tooltipFormatter,
        },
        axisPointer: {
            link: {
                xAxisIndex: 'all',
            },
            label: {
                backgroundColor: '#777',
                // formatter: axisPointerFormatter,
            },
        },
        grid,
        xAxis,
        yAxis,
        series,
    };
};

export class Visual implements IVisual {
    private target: HTMLElement;
    private settings: VisualSettings;

    constructor(options: VisualConstructorOptions) {
        this.target = options.element;
    }

    public update(options: VisualUpdateOptions) {
        this.settings = Visual.parseSettings(
            options && options.dataViews && options.dataViews[0],
        );

        const dataView: DataView = options.dataViews[0];

        const data = mapDataView(dataView, this.settings);

        const chartOptions = buildOptions(data, this.settings);

        console.log(data);
        console.log(chartOptions);
        const chart = echarts.init(this.target);
        chart.setOption(chartOptions);
    }

    private static parseSettings(dataView: DataView): VisualSettings {
        return <VisualSettings>VisualSettings.parse(dataView);
    }

    public enumerateObjectInstances(
        options: EnumerateVisualObjectInstancesOptions,
    ): VisualObjectInstance[] {
        let objectName = options.objectName;
        let objectEnumeration: VisualObjectInstance[] = [];

        if (!this.settings) {
            return objectEnumeration;
        }

        const pushObjectEnum = (objectName) => {
            objectEnumeration.push({
                objectName,
                properties: {
                    left1Color: this.settings[objectName].left1Color,
                    left2Color: this.settings[objectName].left2Color,
                    right1Color: this.settings[objectName].right1Color,
                    right2Color: this.settings[objectName].right2Color,
                },
                propertyInstanceKind: {
                    left1Color: VisualEnumerationInstanceKinds.Constant,
                    left2Color: VisualEnumerationInstanceKinds.Constant,
                    right1Color: VisualEnumerationInstanceKinds.Constant,
                    right2Color: VisualEnumerationInstanceKinds.Constant,
                },
                altConstantValueSelector: null,
                selector: dataViewWildcard.createDataViewWildcardSelector(
                    dataViewWildcard.DataViewWildcardMatchingOption
                        .InstancesAndTotals,
                ),
            });
        };

        switch (objectName) {
            case 'panel1':
                pushObjectEnum(objectName);
                break;
            case 'panel2':
                pushObjectEnum(objectName);
                break;
        }
        return objectEnumeration;
    }
}
