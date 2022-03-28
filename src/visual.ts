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

import { groupBy, zip, flattenDepth, isEmpty } from 'lodash-es';
import * as echarts from 'echarts';

import { VisualSettings } from './settings';
import getTooltip from './components/tooltip';
import getLegend from './components/legend';
import getAxisPointer from './components/axisPointer';
import {
    EnumObject,
    PanelOptions,
    panelEnum,
    YAxisOptions,
    yAxisEnum,
    SeriesOptions,
    seriesEnum,
    getDefaultOption,
    getPanel,
    getYAxis,
    getSeries,
} from './enumObjects';
import formatter, { defaultFormat } from './components/formatter';

type Data = {
    id: string;
    date: Date;
    key: string;
    value: number;
    panel: PanelOptions;
    yAxis: YAxisOptions;
    series: SeriesOptions;
    valueFormat: string;
};

const mapDataView = (dataView: DataView): Data[] => {
    const { columns, rows } = dataView.table;

    const dateValues = <string[]>rows.map((row) => row[0]);

    const dataObjects = dataView.metadata.columns
        .slice(1)
        .map(({ format, objects }) => ({ format, objects }));

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

    const matchedData = zip(dateValues, dataValues).map(([date, values]) =>
        zip(values, dataObjects).map(([value, { format, objects }]) => ({
            ...value,
            date: new Date(date),
            panel: getPanel(objects),
            yAxis: getYAxis(objects),
            series: getSeries(objects),
            valueFormat: format || defaultFormat,
        })),
    );

    return flattenDepth(matchedData, 1);
};

const buildOptions = (
    data: Data[],
    settings: VisualSettings,
    dateFormat: string,
) => {
    const chain = '-';

    const groupData = (fn: (d: Data) => string | number) => groupBy(data, fn);
    const panelData = groupData(({ panel }) => panel.panel);
    const axisData = groupData(({ panel, yAxis }) =>
        [panel.panel, yAxis.align].join(chain),
    );
    const seriesData = groupData(({ panel, yAxis, key, valueFormat }) =>
        [panel.panel, yAxis.align, key, valueFormat].join(chain),
    );

    const grid = Object.entries(panelData).map(([id], i, arr) => ({
        id,
        top: `${i * (90 / arr.length) + 5}%`,
        height: `${90 / arr.length - 5}%`,
        left: '5%',
        right: '20%',
    }));

    const xAxis = Object.entries(panelData).map(([id]) => ({
        type: 'time',
        id,
        gridId: id,
        axisLine: { show: false },
        axisLabel: {
            fontSize: settings.axis.fontSize,
        },
    }));

    const yAxis = Object.entries(axisData).map(([id, data]) => {
        const [panel, align] = id.split(chain);
        const { inverse, mmOverride, mmMin, mmMax } = data.reduce(
            (_, cur) => cur.yAxis,
            getDefaultOption(yAxisEnum),
        );
        const valueFormat = data.reduce((_, cur) => cur.valueFormat, '');

        return {
            type: 'value',
            gridId: panel,
            id: `${panel}-${align}`,
            min: (value: { min: number }) => (mmOverride ? mmMin : value.min),
            max: (value: { max: number }) => (mmOverride ? mmMax : value.max),
            position: align,
            inverse,
            axisLabel: {
                formatter: (value: number) =>
                    formatter(valueFormat).format(value),
                fontSize: settings.axis.fontSize,
            },
        };
    });

    const series = Object.entries(seriesData).map(([id, data]) => {
        const [panel, yAxis, key, _] = id.split(chain);
        const { color, area } = data.reduce(
            (_, cur) => cur.series,
            getDefaultOption(seriesEnum),
        );
        return {
            type: 'line',
            symbol: settings.dataPoint.dataPoint ? 'empty-circle' : 'none',
            name: `${panel} - ${key}`,
            xAxisId: panel,
            yAxisId: `${panel}-${yAxis}`,
            data: data.map(({ date, value }) => [date, value]),
            lineStyle: { color },
            itemStyle: { color },
            areaStyle: area ? { color } : null,
        };
    });

    const valueFormatters = Object.entries(seriesData).map(([id]) =>
        formatter(id.split(chain).slice(-1).pop()),
    );

    return {
        legend: getLegend(settings.legend.fontSize),
        tooltip: getTooltip(
            valueFormatters,
            settings.tooltip.fontSize,
            settings.tooltip.panelGap,
        ),
        axisPointer: getAxisPointer(dateFormat),
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
        this.chart = echarts.init(this.target, '', {
            renderer: 'svg',
        });
    }

    public update(options: VisualUpdateOptions) {
        this.settings = VisualSettings.parse<VisualSettings>(
            options && options.dataViews && options.dataViews[0],
        );

        this.dataView = options.dataViews[0];
        this.metadata = this.dataView.metadata;

        this.data = mapDataView(this.dataView);
        console.log(this.settings);
        console.log(this.data);

        if (isEmpty(this.data)) {
            return;
        }

        const chartOptions = buildOptions(
            this.data,
            this.settings,
            this.dataView.metadata.columns[0].format,
        );
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

        const pushObject = (properties: { [key: string]: any }) => [
            { objectName, properties, selector: null },
        ];

        const pushObjectEnum = <T>(
            displayName: EnumObject<T>,
            propertiesFn: (
                DataViewObjects,
            ) => VisualObjectInstance['properties'],
        ) => {
            const dataWithObjects = zip(
                this.metadata.columns.slice(1),
                Object.entries(groupBy(this.data, ({ key }) => key)),
            );
            const objectEnums = dataWithObjects.map(
                ([{ queryName, objects }, [key]]) => {
                    const props = propertiesFn(objects);
                    return Object.entries(props).map(
                        ([propsKey, propsValue]) => ({
                            objectName,
                            properties: {
                                [propsKey]: propsValue,
                            },
                            displayName: `${displayName[propsKey].displayName} - ${key}`,
                            selector: {
                                metadata: queryName,
                            },
                        }),
                    );
                },
            );
            return flattenDepth(objectEnums, 1);
        };

        switch (objectName) {
            case 'legend':
                return pushObject({
                    fontSize: this.settings.legend.fontSize,
                });
            case 'axis':
                return pushObject({
                    fontSize: this.settings.axis.fontSize,
                });
            case 'tooltip':
                return pushObject({
                    fontSize: this.settings.tooltip.fontSize,
                    panelGap: this.settings.tooltip.panelGap,
                });
            case 'dataPoint':
                return pushObject({
                    dataPoint: this.settings.dataPoint.dataPoint,
                });
            case 'panel':
                return pushObjectEnum(panelEnum, getPanel);
            case 'yAxis':
                return pushObjectEnum(yAxisEnum, getYAxis);
            case 'series':
                return pushObjectEnum(seriesEnum, (objects) => {
                    const { color, area } = getSeries(objects);
                    return {
                        color: { solid: { color } },
                        area,
                    };
                });
        }
        return [];
    }
}
