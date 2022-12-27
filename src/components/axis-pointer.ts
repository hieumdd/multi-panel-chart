import dayjs from 'dayjs';
import formatter, { defaultFormatter } from './formatter';

export const getAxisPointer = (format: string) => ({
    snap: true,
    link: { xAxisIndex: 'all' },
    label: {
        backgroundColor: '#777',
        formatter: ({ axisDimension, value }: any) =>
            axisDimension === 'x'
                ? formatter(format).format(dayjs(value).toDate())
                : defaultFormatter.format(value),
    },
});
