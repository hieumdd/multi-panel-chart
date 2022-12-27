import dayjs from 'dayjs';
import { defaultFormatter, formatter } from './formatter';

export const getAxisPointer = (format: string) => ({
    snap: true,
    link: { xAxisIndex: 'all' },
    label: {
        backgroundColor: '#777',
        formatter: ({ axisDimension, value }: any) => {
            return axisDimension === 'x'
                ? formatter(format).format(dayjs(value).toDate())
                : defaultFormatter.format(value);
        },
    },
});
