import { valueFormatter } from 'powerbi-visuals-utils-formattingutils';
import IValueFormatter = valueFormatter.IValueFormatter;

import { groupBy } from 'lodash-es';

const formatter = (seriesValueFormatters: IValueFormatter[]) => (i: any) => {
    const tooltipEl = document.createElement('div');
    tooltipEl.className = 'tooltip';

    Object.values(groupBy(i, ({ axisIndex }) => axisIndex))
        .map((panel) =>
            panel.map(({ marker, seriesName, value, seriesIndex }: any) => {
                const seriesEl = document.createElement('div');
                seriesEl.className = 'tooltip-series';

                const labelEl = document.createElement('p');
                labelEl.innerHTML = `${marker} ${seriesName}`;
                labelEl.style.fontWeight = '400';

                const valueEl = document.createElement('p');
                valueEl.innerHTML = `${
                    seriesValueFormatters[seriesIndex].format(value[1]) || '-'
                }`;
                valueEl.style.fontWeight = '600';

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

    tooltipEl.style.gap = `${12 / (tooltipEl.childElementCount - 0.5)}em`;
    return tooltipEl;
};

const getTooltip = (seriesValueFormatters: IValueFormatter[]) => ({
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
    formatter: formatter(seriesValueFormatters),
});

export default getTooltip;
