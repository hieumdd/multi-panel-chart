import { LegendSettings } from '../settings';

export const getLegend = ({ fontSize, spacing: itemGap }: LegendSettings) => ({
    orient: 'vertical',
    top: '5%',
    right: 'right',
    textStyle: { fontSize },
    itemGap,
    formatter: (name: string) => (name.length >= 25 ? `${name.slice(0, 25)}...` : name),
});
