import { valueFormatter } from 'powerbi-visuals-utils-formattingutils';
import IValueFormatter = valueFormatter.IValueFormatter;

import { groupBy } from 'lodash-es';

const getContrastColor = (bgColor: string) => {
    return parseInt(bgColor.replace('#', ''), 16) > 0xffffff / 2 ? '#333333' : '#ffffff';
};

const formatter = (
    seriesValueFormatters: IValueFormatter[],
    fontSize: number,
    panelGap: number,
) => {
    return (i: any) => {
        const tooltipEl = document.createElement('div');
        tooltipEl.className = 'tooltip';

        Object.values(groupBy(i, ({ axisIndex }) => axisIndex))
            .map((panel) =>
                panel.map(({ seriesName, value, seriesIndex, color }: any) => {
                    const seriesEl = document.createElement('div');
                    seriesEl.className = 'tooltip-series';
                    seriesEl.style.backgroundColor = `${color}`;
                    seriesEl.style.color = getContrastColor(color);

                    const labelEl = document.createElement('p');
                    labelEl.innerHTML = `${seriesName}`;
                    labelEl.style.fontSize = `${fontSize}px`;

                    const valueEl = document.createElement('p');
                    valueEl.innerHTML = `${
                        seriesValueFormatters[seriesIndex].format(value[1]) || '-'
                    }`;
                    valueEl.style.fontSize = `${fontSize}px`;

                    [labelEl, valueEl].forEach((el) => seriesEl.appendChild(el));

                    return seriesEl;
                }),
            )
            .map((seriesEls) => {
                const panelEl = document.createElement('div');
                panelEl.className = 'tooltip-panel';
                seriesEls.forEach((el) => panelEl.appendChild(el));
                return panelEl;
            })
            .forEach((el) => tooltipEl.appendChild(el));

        tooltipEl.style.gap = `${panelGap}em`;
        return tooltipEl;
    };
};

export const getTooltip = (
    seriesValueFormatters: IValueFormatter[],
    fontSize: number,
    panelGap: number,
) => ({
    trigger: 'axis',
    className: 'tooltip-container',
    backgroundColor: 'transparent',
    extraCssText: 'box-shadow: none; border: none',
    padding: 0,
    axisPointer: { type: 'cross' },
    position: (pos: any) => ({ top: '5%', left: pos[0] }),
    formatter: formatter(seriesValueFormatters, fontSize, panelGap),
});
