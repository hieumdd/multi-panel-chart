import { groupBy } from 'lodash-es';

const formatter = (i: any) => {
    const tooltipEl = document.createElement('div');
    tooltipEl.className = 'tooltip';

    Object.values(groupBy(i, ({ axisIndex }) => axisIndex))
        .map((panel) =>
            panel.map(({ marker, seriesName, value }: any) => {
                const seriesEl = document.createElement('div');
                seriesEl.className = 'tooltip-series';

                [`${marker} ${seriesName}`, `${value[1] || '-'}`]
                    .map((p, i) => {
                        const el = document.createElement('p');
                        el.innerHTML = p;
                        el.style.fontWeight = i === 0 ? '600' : '400';
                        return el;
                    })
                    .forEach((el) => seriesEl.appendChild(el));

                return seriesEl;
            }),
        )
        .map((seriesEls) => {
            const panelEl = document.createElement('div');
            seriesEls.forEach((el) => panelEl.appendChild(el));
            return panelEl;
        })
        .forEach((el) => tooltipEl.appendChild(el));

    console.log(tooltipEl);

    return tooltipEl.outerHTML;
};

const tooltip = {
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
    formatter,
};

export default tooltip;
