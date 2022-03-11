'use strict';

import './../style/visual.less';
import powerbi from 'powerbi-visuals-api';
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
import DataView = powerbi.DataView;

// Formatting Options
import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;
import VisualObjectInstanceEnumeration = powerbi.VisualObjectInstanceEnumeration;
import { VisualSettings } from './settings';

import { groupBy, zip, flattenDepth, min, max, round } from 'lodash-es';
import * as echarts from 'echarts';

import tooltip from './components/tooltip';
import legend from './components/legend'
import axisPointer from './components/axisPointer'

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

const panelOptionsMap = {
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
    isArea: {
        left: {
            1: 'left1Area',
            2: 'left2Area',
        },
        right: {
            1: 'right1Area',
            2: 'right2Area',
        },
    },
};

const chain = '-';

const mapDataView = (dataView: DataView): Data[] => {
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
    const getSettingsMap = (
        key: string,
        [panelId, yAxisAlign, seriesAxisId]: string[],
    ): string =>
        settings[panelMap[panelId]][
            panelOptionsMap[key][yAxisAlign][seriesAxisId]
        ];

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
        const seriesIds = seriesData
            .reduce((_, cur) => cur.id, '')
            .split(chain);
        const color = getSettingsMap('color', seriesIds);
        return {
            type: 'line',
            name: `${xAxisId}-${key}`,
            xAxisId,
            yAxisId: `${xAxisId}-${yAxis}`,
            key,
            data: seriesData.map(({ date, value }) => [date, value]),
            lineStyle: { color },
            itemStyle: { color },
            areaStyle: getSettingsMap('isArea', seriesIds) ? { color } : null,
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

    constructor(options: VisualConstructorOptions) {
        this.target = options.element;
    }

    public update(options: VisualUpdateOptions) {
        this.settings = VisualSettings.parse<VisualSettings>(
            options && options.dataViews && options.dataViews[0],
        );

        const dataView: DataView = options.dataViews[0];

        const data = mapDataView(dataView);

        const chartOptions = buildOptions(data, this.settings);

        console.log(data);
        console.log(chartOptions);
        const chart = echarts.init(this.target);
        chart.setOption(chartOptions);
    }

    public enumerateObjectInstances(
        options: EnumerateVisualObjectInstancesOptions,
    ): VisualObjectInstanceEnumeration {
        const settings = this.settings || VisualSettings.getDefault();
        return VisualSettings.enumerateObjectInstances(settings, options);
    }
}
