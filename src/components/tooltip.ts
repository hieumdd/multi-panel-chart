import { valueFormatter } from 'powerbi-visuals-utils-formattingutils';
import IValueFormatter = valueFormatter.IValueFormatter;

import { groupBy } from 'lodash-es';

const getContrastColor = (bgColor: string) =>
    parseInt(bgColor.replace('#', ''), 16) > 0xffffff / 2
        ? '#333333'
        : '#ffffff';

const formatter =
    (
        seriesValueFormatters: IValueFormatter[],
        fontSize: number,
        panelGap: number,
    ) =>
    (i: any) => {
        const tooltipEl = document.createElement('div');
        tooltipEl.className = 'tooltip';

        Object.values(groupBy(i, ({ axisIndex }) => axisIndex))
            .map((panel) =>
                panel.map(({ seriesName, value, seriesIndex, color }: any) => {
                    const seriesEl = document.createElement('div');
                    seriesEl.className = 'tooltip-series';
                    seriesEl.style.backgroundColor = color;
                    seriesEl.style.color = getContrastColor(color);

                    const labelEl = document.createElement('p');
                    labelEl.innerHTML = `${seriesName}`;
                    labelEl.style.fontSize = `${fontSize}px`;
                    labelEl.style.fontWeight = '400';

                    const valueEl = document.createElement('p');
                    valueEl.innerHTML = `${
                        seriesValueFormatters[seriesIndex].format(value[1]) ||
                        '-'
                    }`;
                    valueEl.style.fontSize = `${fontSize}px`;
                    valueEl.style.fontWeight = '600';

                    [labelEl, valueEl].forEach((el) =>
                        seriesEl.appendChild(el),
                    );

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

const getTooltip = (
    seriesValueFormatters: IValueFormatter[],
    fontSize: number,
    panelGap: number,
) => ({
    trigger: 'axis',
    className: 'tooltip-container',
    padding: '0px',
    backgroundColor: 'rgba(50,50,50,0.0)',
    extraCssText: 'box-shadow: none;',
    axisPointer: {
        type: 'cross',
    },
    position: (pos, params, el, elRect, size) => ({
        top: '5%',
        [['left', 'right'][+(pos[0] < size.viewSize[0] / 2)]]: '10%',
    }),
    formatter: formatter(seriesValueFormatters, fontSize, panelGap),
});

export default getTooltip;
