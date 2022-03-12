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
                labelEl.innerHTML = `${marker} ${seriesName}}`;
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
            seriesEls.forEach((el) => panelEl.appendChild(el));
            return panelEl;
        })
        .forEach((el) => tooltipEl.appendChild(el));

    return tooltipEl.outerHTML;
};

const getTooltip = (seriesValueFormatters: IValueFormatter[]) => ({
    trigger: 'axis',
    axisPointer: {
        type: 'cross',
    },
    position: (pos, params, el, elRect, size) => ({
        top: '20%',
        [['left', 'right'][+(pos[0] < size.viewSize[0] / 2)]]: '10%',
    }),
    formatter: formatter(seriesValueFormatters),
});

export default getTooltip;
